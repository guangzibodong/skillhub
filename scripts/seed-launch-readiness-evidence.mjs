#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(new URL("../apps/gateway/package.json", import.meta.url));
const postgres = require("postgres");

const DEFAULT_RUN_ID = "local-launch-readiness";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const env = await loadEnv(resolve(".env"));
const databaseUrl = args.databaseUrl ?? process.env.DATABASE_URL ?? env.DATABASE_URL;
const runId = normalizeRunId(args.runId ?? process.env.SKILLHUB_LAUNCH_EVIDENCE_RUN_ID ?? DEFAULT_RUN_ID);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in .env or pass --database-url.");
}

guardLocalDatabase(databaseUrl, args.allowNonLocal);

const sql = postgres(databaseUrl, { max: 1 });

try {
  const result = await sql.begin((tx) => seedEvidence(tx, runId));
  console.log("Launch readiness evidence seeded.");
  console.log(`Run id: ${runId}`);
  console.log(`Verified public skills: ${result.counts.verifiedSkills}`);
  console.log(`Active publishers: ${result.counts.activePublishers}`);
  console.log(`Active developer projects: ${result.counts.activeProjects}`);
  console.log(`Successful invocations: ${result.counts.successfulInvocations}`);
  console.log(`Published feedback: ${result.counts.publishedFeedback}`);
  console.log(`Active commission rules: ${result.counts.activeCommissionRules}`);
} finally {
  await sql.end();
}

async function seedEvidence(sql, runId) {
  const now = new Date();
  const reviewerOrg = await upsertOrganization(sql, "launch-review-ops", "Launch Review Ops");
  const reviewer = await upsertUser(sql, "launch.reviewer@acceptance.useskillhub.com", "Launch Reviewer");
  await upsertMember(sql, reviewerOrg.id, reviewer.id, "reviewer");

  const publisherOrgs = [
    await upsertOrganization(sql, "launch-publisher-research", "Research Partner Lab"),
    await upsertOrganization(sql, "launch-publisher-automation", "Automation Partner Studio")
  ];
  const publisherUsers = [
    await upsertUser(sql, "research.publisher@acceptance.useskillhub.com", "Research Publisher"),
    await upsertUser(sql, "automation.publisher@acceptance.useskillhub.com", "Automation Publisher")
  ];

  for (let index = 0; index < publisherOrgs.length; index += 1) {
    await upsertMember(sql, publisherOrgs[index].id, publisherUsers[index].id, "publisher");
    await upsertPublisherProfile(sql, publisherOrgs[index].id, publisherUsers[index].id, publisherOrgs[index].name);
  }

  const skills = [
    {
      org: publisherOrgs[0],
      slug: "launch-research-router",
      name: "Research Router",
      description: "Routes research tasks through source checks, citation capture, and risk notes.",
      tags: ["research", "browser", "citations"],
      browser: true
    },
    {
      org: publisherOrgs[0],
      slug: "launch-dataset-normalizer",
      name: "Dataset Normalizer",
      description: "Normalizes uploaded dataset fields and returns schema confidence notes.",
      tags: ["data", "cleanup", "schema"],
      browser: false
    },
    {
      org: publisherOrgs[0],
      slug: "launch-policy-checker",
      name: "Policy Checker",
      description: "Checks generated content against workspace policy and escalation rules.",
      tags: ["policy", "trust", "review"],
      browser: false
    },
    {
      org: publisherOrgs[1],
      slug: "launch-support-brief",
      name: "Support Brief",
      description: "Summarizes customer history into a support-ready action brief.",
      tags: ["support", "summary", "handoff"],
      browser: false
    },
    {
      org: publisherOrgs[1],
      slug: "launch-invoice-reader",
      name: "Invoice Reader",
      description: "Extracts invoice totals, vendors, due dates, and exception flags.",
      tags: ["finance", "invoice", "extraction"],
      browser: false
    }
  ];

  const seededSkills = [];

  for (const skill of skills) {
    const record = await upsertVerifiedSkill(sql, skill, runId, now);
    seededSkills.push(record);
    await upsertApprovedReview(sql, record.skillId, record.versionId, reviewer.id, skill.slug);
  }

  const developerOrgs = [
    await upsertOrganization(sql, "launch-developer-alpha", "Launch Developer Alpha"),
    await upsertOrganization(sql, "launch-developer-beta", "Launch Developer Beta"),
    await upsertOrganization(sql, "launch-developer-gamma", "Launch Developer Gamma")
  ];
  const developerUsers = [
    await upsertUser(sql, "alpha.developer@acceptance.useskillhub.com", "Alpha Developer"),
    await upsertUser(sql, "beta.developer@acceptance.useskillhub.com", "Beta Developer"),
    await upsertUser(sql, "gamma.developer@acceptance.useskillhub.com", "Gamma Developer")
  ];

  const projects = [];

  for (let index = 0; index < developerOrgs.length; index += 1) {
    await upsertMember(sql, developerOrgs[index].id, developerUsers[index].id, "developer");
    projects.push(await upsertProject(sql, developerOrgs[index].id, `launch-project-${index + 1}`, `Launch Project ${index + 1}`));
  }

  for (let index = 0; index < projects.length; index += 1) {
    await upsertInstall(sql, projects[index].id, seededSkills[index].skillId, seededSkills[index].versionId);
    await upsertInstall(sql, projects[index].id, seededSkills[(index + 2) % seededSkills.length].skillId, seededSkills[(index + 2) % seededSkills.length].versionId);
  }

  for (let index = 0; index < 20; index += 1) {
    const project = projects[index % projects.length];
    const skill = seededSkills[index % seededSkills.length];
    await upsertInvocation(sql, {
      createdAt: minutesAgo(now, 20 - index),
      projectId: project.id,
      requestId: `launch-readiness-${runId}-${index + 1}`,
      skillId: skill.skillId,
      skillVersionId: skill.versionId
    });
  }

  for (let index = 0; index < 5; index += 1) {
    const project = projects[index % projects.length];
    const skill = seededSkills[index];
    await upsertPublishedFeedback(sql, {
      body: feedbackBody(index),
      projectId: project.id,
      reviewerOrganizationId: project.organizationId,
      reviewerUserId: developerUsers[index % developerUsers.length].id,
      skillId: skill.skillId,
      skillVersionId: skill.versionId,
      title: feedbackTitle(index)
    });
  }

  await ensureActiveCommissionRule(sql);

  return {
    counts: await readCounts(sql)
  };
}

async function upsertOrganization(sql, slug, name) {
  const rows = await sql`
    insert into organizations (slug, name)
    values (${slug}, ${name})
    on conflict (slug) do update set name = excluded.name
    returning id::text, slug, name
  `;
  return rows[0];
}

async function upsertUser(sql, email, displayName) {
  const rows = await sql`
    insert into users (email, display_name)
    values (${email}, ${displayName})
    on conflict (email) do update set display_name = excluded.display_name
    returning id::text, email, display_name as "displayName"
  `;
  return rows[0];
}

async function upsertMember(sql, organizationId, userId, role) {
  await sql`
    insert into organization_members (organization_id, user_id, role)
    values (${organizationId}, ${userId}, ${role})
    on conflict (organization_id, user_id) do update set role = excluded.role
  `;
}

async function upsertPublisherProfile(sql, organizationId, userId, displayName) {
  await sql`
    insert into publisher_profiles (
      organization_id,
      display_name,
      status,
      payout_status,
      terms_accepted_at,
      terms_version,
      terms_accepted_by_user_id,
      updated_at
    )
    values (
      ${organizationId},
      ${displayName},
      'active',
      'verified',
      now(),
      'launch-readiness-v1',
      ${userId},
      now()
    )
    on conflict (organization_id) do update set
      display_name = excluded.display_name,
      status = 'active',
      payout_status = 'verified',
      terms_accepted_at = coalesce(publisher_profiles.terms_accepted_at, excluded.terms_accepted_at),
      terms_version = excluded.terms_version,
      terms_accepted_by_user_id = excluded.terms_accepted_by_user_id,
      updated_at = now()
  `;
}

async function upsertVerifiedSkill(sql, skill, runId, now) {
  const manifest = buildManifest(skill, runId);
  const skillRows = await sql`
    insert into skills (
      organization_id,
      slug,
      display_name,
      description,
      tags,
      visibility,
      verification_status,
      updated_at
    )
    values (
      ${skill.org.id},
      ${skill.slug},
      ${skill.name},
      ${skill.description},
      ${pgTextArray(skill.tags)}::text[],
      'public',
      'verified',
      ${now}
    )
    on conflict (slug) do update set
      organization_id = excluded.organization_id,
      display_name = excluded.display_name,
      description = excluded.description,
      tags = excluded.tags,
      visibility = 'public',
      verification_status = 'verified',
      updated_at = now()
    returning id::text
  `;
  const skillId = skillRows[0].id;
  const versionRows = await sql`
    insert into skill_versions (skill_id, version, manifest, package_url, checksum)
    values (${skillId}, '1.0.0', ${sql.json(manifest)}, ${`https://api.useskillhub.com/launch-evidence/${skill.slug}.tgz`}, ${`sha256-${skill.slug}`})
    on conflict (skill_id, version) do update set
      manifest = excluded.manifest,
      package_url = excluded.package_url,
      checksum = excluded.checksum
    returning id::text
  `;
  return {
    skillId,
    slug: skill.slug,
    versionId: versionRows[0].id
  };
}

async function upsertApprovedReview(sql, skillId, versionId, reviewerId, slug) {
  const existing = await sql`
    select id::text
    from skill_reviews
    where skill_id = ${skillId}
      and skill_version_id = ${versionId}
      and status = 'approved'
    order by decided_at desc nulls last, created_at desc
    limit 1
  `;

  if (existing.length > 0) {
    await sql`
      update skill_reviews
      set reviewer_id = ${reviewerId},
          risk_level = 'low',
          notes = ${`Launch-readiness QA approval for ${slug}.`},
          decided_at = now()
      where id = ${existing[0].id}
    `;
    return;
  }

  await sql`
    insert into skill_reviews (
      skill_id,
      skill_version_id,
      reviewer_id,
      status,
      risk_level,
      notes,
      decided_at
    )
    values (
      ${skillId},
      ${versionId},
      ${reviewerId},
      'approved',
      'low',
      ${`Launch-readiness QA approval for ${slug}.`},
      now()
    )
  `;
}

async function upsertProject(sql, organizationId, slug, name) {
  const rows = await sql`
    insert into projects (organization_id, slug, name)
    values (${organizationId}, ${slug}, ${name})
    on conflict (organization_id, slug) do update set name = excluded.name
    returning id::text, organization_id::text as "organizationId", slug, name
  `;
  return rows[0];
}

async function upsertInstall(sql, projectId, skillId, versionId) {
  await sql`
    insert into project_skill_installs (
      project_id,
      skill_id,
      skill_version_id,
      status,
      approval_state,
      updated_at
    )
    values (${projectId}, ${skillId}, ${versionId}, 'installed', 'approved', now())
    on conflict (project_id, skill_id) do update set
      skill_version_id = excluded.skill_version_id,
      status = 'installed',
      approval_state = 'approved',
      updated_at = now()
  `;
}

async function upsertInvocation(sql, input) {
  await sql`
    insert into skill_invocations (
      project_id,
      skill_id,
      skill_version_id,
      status,
      latency_ms,
      request_id,
      input_summary,
      output_summary,
      policy_result,
      created_at
    )
    values (
      ${input.projectId},
      ${input.skillId},
      ${input.skillVersionId},
      'success',
      420,
      ${input.requestId},
      'Launch-readiness QA invocation',
      'Successful governed invocation for launch-readiness evidence.',
      ${sql.json({ approval: "approved", source: "launch-readiness-seed" })},
      ${input.createdAt}
    )
    on conflict (request_id) where request_id is not null do update set
      status = 'success',
      latency_ms = excluded.latency_ms,
      output_summary = excluded.output_summary,
      policy_result = excluded.policy_result,
      created_at = excluded.created_at
  `;
}

async function upsertPublishedFeedback(sql, input) {
  const existing = await sql`
    select id::text
    from skill_feedback
    where skill_id = ${input.skillId}
      and title = ${input.title}
    limit 1
  `;

  if (existing.length > 0) {
    await sql`
      update skill_feedback
      set skill_version_id = ${input.skillVersionId},
          reviewer_user_id = ${input.reviewerUserId},
          reviewer_organization_id = ${input.reviewerOrganizationId},
          project_id = ${input.projectId},
          rating = 5,
          body = ${input.body},
          use_case = 'Launch-readiness QA',
          status = 'published',
          moderation_reason = null,
          moderated_at = now(),
          published_at = now(),
          updated_at = now()
      where id = ${existing[0].id}
    `;
    return;
  }

  await sql`
    insert into skill_feedback (
      skill_id,
      skill_version_id,
      reviewer_user_id,
      reviewer_organization_id,
      project_id,
      rating,
      title,
      body,
      use_case,
      status,
      moderated_at,
      published_at,
      created_at,
      updated_at
    )
    values (
      ${input.skillId},
      ${input.skillVersionId},
      ${input.reviewerUserId},
      ${input.reviewerOrganizationId},
      ${input.projectId},
      5,
      ${input.title},
      ${input.body},
      'Launch-readiness QA',
      'published',
      now(),
      now(),
      now(),
      now()
    )
  `;
}

async function ensureActiveCommissionRule(sql) {
  const active = await sql`
    select id::text
    from commission_rules
    where starts_at <= now()
      and (ends_at is null or ends_at > now())
    limit 1
  `;

  if (active.length > 0) {
    return;
  }

  await sql`
    insert into commission_rules (
      name,
      platform_fee_bps,
      publisher_share_bps,
      starts_at,
      ends_at
    )
    values (
      'Launch default 20/80 split',
      2000,
      8000,
      now() - interval '1 minute',
      null
    )
  `;
}

async function readCounts(sql) {
  const rows = await sql`
    select
      (select count(*)::int from skills where verification_status = 'verified' and visibility = 'public') as "verifiedSkills",
      (
        select count(distinct pp.id)::int
        from publisher_profiles pp
        where pp.status = 'active'
          and exists (
            select 1
            from skills s
            where s.organization_id = pp.organization_id
              and s.visibility = 'public'
              and s.verification_status in ('submitted', 'verified', 'deprecated')
          )
      ) as "activePublishers",
      (
        select count(distinct p.id)::int
        from projects p
        where exists (
            select 1
            from project_skill_installs psi
            where psi.project_id = p.id
              and psi.status = 'installed'
          )
          or exists (
            select 1
            from skill_invocations si
            where si.project_id = p.id
          )
      ) as "activeProjects",
      (select count(*)::int from skill_invocations where status = 'success') as "successfulInvocations",
      (select count(*)::int from skill_feedback where status = 'published') as "publishedFeedback",
      (
        select count(*)::int
        from commission_rules
        where starts_at <= now()
          and (ends_at is null or ends_at > now())
      ) as "activeCommissionRules"
  `;
  return rows[0];
}

function buildManifest(skill, runId) {
  return {
    schemaVersion: "0.1",
    name: skill.slug,
    displayName: skill.name,
    version: "1.0.0",
    description: skill.description,
    author: {
      name: skill.org.name,
      url: "https://www.useskillhub.com"
    },
    tags: skill.tags,
    runtime: {
      type: "http",
      entrypoint: `https://api.useskillhub.com/launch-evidence/${runId}/${skill.slug}`
    },
    permissions: {
      browser: skill.browser,
      filesystem: "none",
      network: true,
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: {
          type: "string",
          minLength: 3
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["summary"],
      properties: {
        summary: {
          type: "string"
        },
        confidence: {
          maximum: 1,
          minimum: 0,
          type: "number"
        }
      }
    }
  };
}

function feedbackTitle(index) {
  return [
    "Clear handoff for governed research",
    "Useful schema cleanup before import",
    "Policy notes helped unblock review",
    "Support brief reduced manual triage",
    "Invoice extraction caught exceptions"
  ][index];
}

function feedbackBody(index) {
  return [
    "The skill produced a concise source-backed handoff and made review notes easy to audit.",
    "The normalized fields matched our project schema and surfaced confidence gaps before install.",
    "The policy result explained the escalation path without hiding the underlying decision.",
    "The output was short enough for operators to scan and complete enough for the next action.",
    "The extraction result separated totals, due dates, and exception flags cleanly."
  ][index];
}

function minutesAgo(now, minutes) {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

function pgTextArray(values) {
  return `{${values.map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`;
}

async function loadEnv(path) {
  try {
    const content = await readFile(path, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...rest] = line.split("=");
          return [key, rest.join("=")];
        })
    );
  } catch {
    return {};
  }
}

function guardLocalDatabase(databaseUrl, allowNonLocal) {
  if (allowNonLocal) {
    return;
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL.");
  }

  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error("Refusing to seed a non-local database. Pass --allow-non-local only for a controlled staging database.");
  }
}

function normalizeRunId(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || DEFAULT_RUN_ID;
}

function parseArgs(argv) {
  const parsed = {
    allowNonLocal: false,
    databaseUrl: null,
    help: false,
    runId: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    } else if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--allow-non-local") {
      parsed.allowNonLocal = true;
    } else if (arg === "--database-url") {
      parsed.databaseUrl = argv[++index];
    } else if (arg.startsWith("--database-url=")) {
      parsed.databaseUrl = arg.slice("--database-url=".length);
    } else if (arg === "--run-id") {
      parsed.runId = argv[++index];
    } else if (arg.startsWith("--run-id=")) {
      parsed.runId = arg.slice("--run-id=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/seed-launch-readiness-evidence.mjs [options]

Seeds local or controlled staging evidence for the admin launch-readiness panel.

Options:
  --run-id <id>           Stable id used in generated request ids.
  --database-url <url>    Database URL. Defaults to DATABASE_URL from env or .env.
  --allow-non-local       Permit writing to a non-local database.
  -h, --help              Show this help.
`);
}
