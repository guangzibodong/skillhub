import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type CreateDeveloperProjectInput = {
  name?: unknown;
  slug?: unknown;
};

type CreateDeveloperProjectContext = {
  actorUserId?: string | null;
  organizationId: string;
};

type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

export async function createDeveloperProject(input: CreateDeveloperProjectInput, context: CreateDeveloperProjectContext) {
  const sql = await requireSql();
  const name = normalizeName(input.name);
  const slug = normalizeSlug(typeof input.slug === "string" && input.slug.trim() ? input.slug : name);

  const existing = (await sql`
    select id::text
    from projects
    where organization_id = ${context.organizationId}
      and slug = ${slug}
    limit 1
  `) as Array<{ id: string }>;

  if (existing[0]) {
    throw new Error("A project with this slug already exists in this organization.");
  }

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      insert into projects (organization_id, name, slug)
      values (${context.organizationId}, ${name}, ${slug})
      returning id::text, slug, name, created_at as "createdAt"
    `) as ProjectRow[];
    const project = rows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${context.actorUserId ?? null},
        'project.created',
        'project',
        ${project.id},
        'Developer project created from the workspace console.',
        ${tx.json({
          organizationId: context.organizationId,
          projectSlug: project.slug,
          projectName: project.name
        })}
      )
    `;

    await tx`
      insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
      values (
        ${context.actorUserId ?? null},
        ${context.organizationId},
        'project.created',
        'in_app',
        ${`Project created: ${project.name}`},
        ${tx.json({
          projectSlug: project.slug,
          projectName: project.name
        })},
        'queued'
      )
    `;

    return {
      ...project,
      apiKeys: {
        activeCount: 0,
        revokedCount: 0
      },
      installs: {
        approvedSkillCount: 0,
        installedSkillCount: 0,
        ownerRequiredCount: 0,
        suspendedInstallCount: 0
      },
      policy: {
        approvalRequiredCount: 0,
        monthlyBudgetCents: 0,
        policyCount: 0,
        state: "approved"
      },
      runtime: {
        avgLatencyMs: null,
        blockedCount: 0,
        callCount: 0,
        errorCount: 0,
        successCount: 0,
        successRate: null
      },
      subscriptions: {
        activeCount: 0
      },
      updates: {
        count: 0,
        latestAt: null
      },
      usage: {
        billableUsageCount: 0,
        currency: "usd",
        grossCents: 0
      }
    };
  });
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for project creation.");
  }

  return sql;
}

function normalizeName(value: unknown) {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

  if (name.length < 2) {
    throw new Error("Project name must be at least 2 characters.");
  }

  if (name.length > 90) {
    throw new Error("Project name must be 90 characters or fewer.");
  }

  return name;
}

function normalizeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length < 2) {
    throw new Error("Project slug must include at least 2 letters or numbers.");
  }

  if (slug.length > 80) {
    throw new Error("Project slug must be 80 characters or fewer.");
  }

  return slug;
}
