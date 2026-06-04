import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ApiKeyRecord = {
  id: string;
  project_id: string;
  project_slug: string;
  organization_id: string;
};

type RuntimeSkillRecord = {
  project_id: string;
  skill_id: string;
  skill_version_id: string;
  skill_slug: string;
  display_name: string;
  verification_status: SkillSummary["verificationStatus"];
  version: string;
  manifest: SkillManifest;
  install_status: string;
  approval_state: string;
  max_permission_level: SkillSummary["permissionLevel"];
  allow_network: boolean;
  allow_browser: boolean;
  filesystem_access: "none" | "read" | "write";
  allow_secret_access: boolean;
  monthly_budget_cents: number;
  rate_limit_per_minute: number | null;
  approval_required: boolean;
  approved_at: string | null;
};

type RuntimeInvokeInput = {
  skillSlug?: string;
  version?: string;
  input?: unknown;
};

type PriceRecord = {
  billing_model: "free" | "per_call" | "subscription";
  unit_amount_cents: number;
  currency: string;
};

const permissionRank: Record<SkillSummary["permissionLevel"], number> = {
  low: 1,
  medium: 2,
  high: 3
};

const filesystemRank: Record<"none" | "read" | "write", number> = {
  none: 0,
  read: 1,
  write: 2
};

export async function listProjectApiKeys(projectSlug: string) {
  const sql = await getSql();

  if (!sql) {
    return [
      {
        id: "demo-key",
        projectSlug,
        name: "Demo project key",
        keyPrefix: "skh_demo",
        keyLast4: "demo",
        lastUsedAt: null,
        createdAt: "demo",
        revokedAt: null
      }
    ];
  }

  return sql`
    select
      ak.id::text,
      p.slug as "projectSlug",
      ak.name,
      ak.key_prefix as "keyPrefix",
      ak.key_last4 as "keyLast4",
      ak.last_used_at as "lastUsedAt",
      ak.created_at as "createdAt",
      ak.revoked_at as "revokedAt"
    from api_keys ak
    join projects p on p.id = ak.project_id
    where p.slug = ${projectSlug}
    order by ak.created_at desc
  `;
}

export async function createProjectApiKey(projectSlug: string, name = "Project API key") {
  const sql = await requireSql();
  const organization = await upsertDefaultOrganization(sql);
  const project = await upsertProject(sql, organization.id, projectSlug);
  const rawKey = `skh_${randomToken(32)}`;
  const keyHash = await sha256Hex(rawKey);
  const keyLast4 = rawKey.slice(-4);

  const rows = (await sql`
    insert into api_keys (
      project_id,
      name,
      key_hash,
      key_prefix,
      key_last4
    )
    values (
      ${project.id},
      ${name},
      ${keyHash},
      'skh',
      ${keyLast4}
    )
    returning
      id::text,
      name,
      key_prefix as "keyPrefix",
      key_last4 as "keyLast4",
      created_at as "createdAt"
  `) as Array<{
    id: string;
    name: string;
    keyPrefix: string;
    keyLast4: string;
    createdAt: string;
  }>;

  return {
    ...rows[0],
    projectSlug,
    apiKey: rawKey
  };
}

export async function revokeProjectApiKey(projectSlug: string, keyId: string) {
  const sql = await requireSql();

  const rows = (await sql`
    update api_keys ak
    set revoked_at = now()
    from projects p
    where ak.project_id = p.id
      and p.slug = ${projectSlug}
      and ak.id = ${keyId}
    returning
      ak.id::text,
      p.slug as "projectSlug",
      ak.name,
      ak.revoked_at as "revokedAt"
  `) as Array<{ id: string; projectSlug: string; name: string; revokedAt: string }>;

  if (!rows[0]) {
    throw new Error("API key not found.");
  }

  return rows[0];
}

export async function invokeSkill(authorizationHeader: string | undefined, input: RuntimeInvokeInput) {
  const startedAt = Date.now();
  const apiKey = readBearer(authorizationHeader);

  if (!apiKey) {
    return {
      status: 401,
      body: {
        error: "Missing project API key.",
        code: "missing_api_key"
      }
    };
  }

  if (!input.skillSlug) {
    return {
      status: 400,
      body: {
        error: "Missing skillSlug.",
        code: "missing_skill_slug"
      }
    };
  }

  const sql = await requireSql();
  await seedRegistry();

  const apiKeyRecord = await findProjectApiKey(sql, apiKey);

  if (!apiKeyRecord) {
    return {
      status: 401,
      body: {
        error: "Invalid or revoked project API key.",
        code: "invalid_api_key"
      }
    };
  }

  const skill = await findInstalledSkill(sql, apiKeyRecord.project_id, input.skillSlug, input.version);

  if (!skill) {
    const invocation = await recordInvocation(sql, {
      projectId: apiKeyRecord.project_id,
      status: "blocked",
      latencyMs: Date.now() - startedAt,
      errorCode: "skill_not_installed",
      policyResult: {
        projectSlug: apiKeyRecord.project_slug,
        skillSlug: input.skillSlug
      },
      inputSummary: summarizeValue(input.input)
    });

    return {
      status: 403,
      body: {
        error: "Skill is not installed for this project.",
        code: "skill_not_installed",
        invocationId: invocation.id
      }
    };
  }

  const policy = await evaluatePolicy(sql, skill);

  if (!policy.ok) {
    const invocation = await recordInvocation(sql, {
      projectId: apiKeyRecord.project_id,
      skillId: skill.skill_id,
      skillVersionId: skill.skill_version_id,
      status: "blocked",
      latencyMs: Date.now() - startedAt,
      errorCode: policy.code,
      policyResult: policy,
      inputSummary: summarizeValue(input.input)
    });

    return {
      status: 403,
      body: {
        error: policy.message,
        code: policy.code,
        invocationId: invocation.id,
        policy
      }
    };
  }

  const execution = await executeSkill(skill.manifest, input.input);
  const latencyMs = Date.now() - startedAt;
  const status = execution.ok ? "success" : "error";
  const price = await getActivePrice(sql, skill.skill_id);
  const amountCents = status === "success" && price.billing_model === "per_call" ? price.unit_amount_cents : 0;
  const invocation = await recordInvocation(sql, {
    projectId: apiKeyRecord.project_id,
    skillId: skill.skill_id,
    skillVersionId: skill.skill_version_id,
    status,
    latencyMs,
    errorCode: execution.ok ? undefined : execution.errorCode,
    policyResult: policy,
    inputSummary: summarizeValue(input.input),
    outputSummary: summarizeValue(execution.output)
  });

  await sql`
    update api_keys
    set last_used_at = now()
    where id = ${apiKeyRecord.id}
  `;

  if (status === "success") {
    await sql`
      insert into usage_events (
        invocation_id,
        project_id,
        skill_id,
        skill_version_id,
        event_type,
        quantity,
        billable,
        amount_cents,
        currency
      )
      values (
        ${invocation.id},
        ${apiKeyRecord.project_id},
        ${skill.skill_id},
        ${skill.skill_version_id},
        'invocation_success',
        1,
        ${amountCents > 0},
        ${amountCents},
        ${price.currency}
      )
    `;
  }

  return {
    status: execution.ok ? 200 : 502,
    body: {
      invocationId: invocation.id,
      projectSlug: apiKeyRecord.project_slug,
      skillSlug: skill.skill_slug,
      version: skill.version,
      status,
      latencyMs,
      billable: amountCents > 0,
      amountCents,
      currency: price.currency,
      output: execution.output,
      error: execution.ok ? undefined : execution.error
    }
  };
}

async function findProjectApiKey(sql: Sql, apiKey: string): Promise<ApiKeyRecord | undefined> {
  const keyHash = await sha256Hex(apiKey);
  const rows = (await sql`
    select
      ak.id::text,
      ak.project_id::text,
      p.slug as project_slug,
      p.organization_id::text
    from api_keys ak
    join projects p on p.id = ak.project_id
    where ak.key_hash = ${keyHash}
      and ak.revoked_at is null
    limit 1
  `) as ApiKeyRecord[];

  return rows[0];
}

async function findInstalledSkill(
  sql: Sql,
  projectId: string,
  skillSlug: string,
  version?: string
): Promise<RuntimeSkillRecord | undefined> {
  const rows = (await sql`
    select
      p.id::text as project_id,
      s.id::text as skill_id,
      sv.id::text as skill_version_id,
      s.slug as skill_slug,
      s.display_name,
      s.verification_status,
      sv.version,
      sv.manifest,
      psi.status as install_status,
      psi.approval_state,
      psp.max_permission_level,
      psp.allow_network,
      psp.allow_browser,
      psp.filesystem_access,
      psp.allow_secret_access,
      psp.monthly_budget_cents,
      psp.rate_limit_per_minute,
      psp.approval_required,
      psp.approved_at
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    join skill_versions sv on sv.id = psi.skill_version_id
    left join project_skill_policies psp on psp.project_id = p.id and psp.skill_id = s.id
    where p.id = ${projectId}
      and s.slug = ${skillSlug}
      and (${version ?? null}::text is null or sv.version = ${version ?? null})
    limit 1
  `) as RuntimeSkillRecord[];

  return rows[0];
}

async function evaluatePolicy(sql: Sql, skill: RuntimeSkillRecord) {
  const permissionLevel = getPermissionLevel(skill.manifest.permissions);
  const policy = {
    permissionLevel,
    maxPermissionLevel: skill.max_permission_level,
    installStatus: skill.install_status,
    approvalState: skill.approval_state,
    verificationStatus: skill.verification_status
  };

  if (skill.install_status !== "installed") {
    return blocked("install_not_active", "Skill install is not active.", policy);
  }

  if (skill.verification_status === "suspended" || skill.verification_status === "rejected") {
    return blocked("skill_not_allowed", "Skill is rejected or suspended.", policy);
  }

  if (skill.verification_status !== "verified" && skill.verification_status !== "deprecated") {
    return blocked("skill_not_verified", "Skill must be verified before runtime invocation.", policy);
  }

  if (skill.approval_state !== "approved") {
    return blocked("skill_not_approved", "Skill install requires project owner approval.", policy);
  }

  if (!skill.max_permission_level) {
    return blocked("policy_missing", "Project skill policy is missing.", policy);
  }

  if (skill.approval_required && !skill.approved_at) {
    return blocked("policy_approval_required", "Project policy still requires approval.", policy);
  }

  if (permissionRank[permissionLevel] > permissionRank[skill.max_permission_level]) {
    return blocked("permission_level_exceeded", "Skill permission level exceeds project policy.", policy);
  }

  if (skill.manifest.permissions.network && !skill.allow_network) {
    return blocked("network_not_allowed", "Project policy does not allow network access.", policy);
  }

  if (skill.manifest.permissions.browser && !skill.allow_browser) {
    return blocked("browser_not_allowed", "Project policy does not allow browser access.", policy);
  }

  if (filesystemRank[skill.manifest.permissions.filesystem] > filesystemRank[skill.filesystem_access]) {
    return blocked("filesystem_not_allowed", "Project policy does not allow the requested filesystem access.", policy);
  }

  if (skill.manifest.permissions.secrets.length > 0 && !skill.allow_secret_access) {
    return blocked("secrets_not_allowed", "Project policy does not allow secret access.", policy);
  }

  const rateLimit = await checkRateLimit(sql, skill);

  if (!rateLimit.ok) {
    return blocked("rate_limit_exceeded", "Project rate limit exceeded for this skill.", {
      ...policy,
      rateLimit
    });
  }

  const budget = await checkBudget(sql, skill);

  if (!budget.ok) {
    return blocked("budget_exceeded", "Project monthly budget exceeded for this skill.", {
      ...policy,
      budget
    });
  }

  return {
    ok: true,
    code: "allowed",
    message: "Runtime policy passed.",
    ...policy,
    rateLimit,
    budget
  };
}

function blocked(code: string, message: string, details: Record<string, unknown>) {
  return {
    ok: false,
    code,
    message,
    ...details
  };
}

async function checkRateLimit(sql: Sql, skill: RuntimeSkillRecord) {
  if (!skill.rate_limit_per_minute) {
    return { ok: true, limit: null, used: 0 };
  }

  const rows = (await sql`
    select count(*)::int as used
    from skill_invocations
    where project_id = ${skill.project_id}
      and skill_id = ${skill.skill_id}
      and created_at >= now() - interval '1 minute'
  `) as Array<{ used: number }>;
  const used = rows[0]?.used ?? 0;

  return {
    ok: used < skill.rate_limit_per_minute,
    limit: skill.rate_limit_per_minute,
    used
  };
}

async function checkBudget(sql: Sql, skill: RuntimeSkillRecord) {
  if (!skill.monthly_budget_cents || skill.monthly_budget_cents <= 0) {
    return { ok: true, limitCents: skill.monthly_budget_cents, usedCents: 0 };
  }

  const rows = (await sql`
    select coalesce(sum(amount_cents), 0)::int as used_cents
    from usage_events
    where project_id = ${skill.project_id}
      and skill_id = ${skill.skill_id}
      and billable = true
      and created_at >= date_trunc('month', now())
  `) as Array<{ used_cents: number }>;
  const usedCents = rows[0]?.used_cents ?? 0;

  return {
    ok: usedCents < skill.monthly_budget_cents,
    limitCents: skill.monthly_budget_cents,
    usedCents
  };
}

async function executeSkill(manifest: SkillManifest, input: unknown) {
  if (
    manifest.runtime.type === "http" &&
    getProcessEnv("SKILLHUB_RUNTIME_PROXY") === "enabled"
  ) {
    try {
      const response = await fetch(manifest.runtime.entrypoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input })
      });
      const contentType = response.headers.get("Content-Type") ?? "";
      const output = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) {
        return {
          ok: false,
          errorCode: "runtime_http_error",
          error: `Runtime returned ${response.status}.`,
          output
        };
      }

      return {
        ok: true,
        output
      };
    } catch (error) {
      return {
        ok: false,
        errorCode: "runtime_fetch_failed",
        error: error instanceof Error ? error.message : "Runtime fetch failed.",
        output: null
      };
    }
  }

  return {
    ok: true,
    output: {
      mode: "metered_contract",
      runtime: manifest.runtime.type,
      inputAccepted: true,
      message:
        "SkillHub recorded and metered this invocation. External runtime proxy is disabled until SKILLHUB_RUNTIME_PROXY=enabled.",
      receivedInput: input ?? null
    }
  };
}

async function getActivePrice(sql: Sql, skillId: string): Promise<PriceRecord> {
  const rows = (await sql`
    select billing_model, unit_amount_cents, currency
    from skill_prices
    where skill_id = ${skillId}
      and status = 'active'
    order by created_at desc
    limit 1
  `) as PriceRecord[];

  return rows[0] ?? { billing_model: "free", unit_amount_cents: 0, currency: "usd" };
}

async function recordInvocation(
  sql: Sql,
  input: {
    projectId?: string;
    skillId?: string;
    skillVersionId?: string;
    status: "success" | "error" | "blocked";
    latencyMs: number;
    errorCode?: string;
    policyResult?: Record<string, unknown>;
    inputSummary?: string;
    outputSummary?: string;
  }
) {
  const requestId = `inv_${randomToken(16)}`;
  const rows = (await sql`
    insert into skill_invocations (
      project_id,
      skill_id,
      skill_version_id,
      status,
      latency_ms,
      error_code,
      request_id,
      input_summary,
      output_summary,
      policy_result
    )
    values (
      ${input.projectId ?? null},
      ${input.skillId ?? null},
      ${input.skillVersionId ?? null},
      ${input.status},
      ${input.latencyMs},
      ${input.errorCode ?? null},
      ${requestId},
      ${input.inputSummary ?? null},
      ${input.outputSummary ?? null},
      ${sql.json(input.policyResult ?? {})}
    )
    returning id::text, request_id as "requestId"
  `) as Array<{ id: string; requestId: string }>;

  return rows[0];
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for runtime operations.");
  }

  return sql;
}

async function seedRegistry() {
  await searchSkills({ limit: 1 });
}

async function upsertDefaultOrganization(sql: Sql): Promise<{ id: string }> {
  const rows = (await sql`
    insert into organizations (name, slug)
    values ('SkillHub Demo Org', 'skillhub-demo')
    on conflict (slug) do update set name = excluded.name
    returning id::text
  `) as Array<{ id: string }>;

  return rows[0];
}

async function upsertProject(sql: Sql, organizationId: string, projectSlug: string): Promise<{ id: string }> {
  const name = projectSlug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");

  const rows = (await sql`
    insert into projects (organization_id, name, slug)
    values (${organizationId}, ${name || projectSlug}, ${projectSlug})
    on conflict (organization_id, slug) do update set name = excluded.name
    returning id::text
  `) as Array<{ id: string }>;

  return rows[0];
}

function readBearer(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function summarizeValue(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = JSON.stringify(value);
  return text.length > 500 ? `${text.slice(0, 497)}...` : text;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
