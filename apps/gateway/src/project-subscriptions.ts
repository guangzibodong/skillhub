import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectSubscriptionStatus = "trialing" | "active" | "past_due" | "paused" | "canceled";
type ProjectSubscriptionCreateStatus = "active" | "trialing";
type ProjectManagedSubscriptionStatus = "active" | "paused" | "canceled";

type ProjectSubscriptionCreateInput = {
  skillSlug?: unknown;
  priceId?: unknown;
  status?: unknown;
  trialDays?: unknown;
};

type ProjectSubscriptionRow = {
  id: string;
  projectSlug: string;
  organizationId: string;
  skillSlug: string;
  displayName: string;
  status: ProjectSubscriptionStatus;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  pausedAt: string | null;
  canceledAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const projectManagedStatuses: ProjectManagedSubscriptionStatus[] = ["active", "paused", "canceled"];
const projectCreateStatuses: ProjectSubscriptionCreateStatus[] = ["active", "trialing"];

export async function createProjectSubscription(
  projectSlug: string,
  input: ProjectSubscriptionCreateInput,
  organizationId?: string | null,
  actorUserId?: string | null
) {
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;
  const skillSlug = normalizeRequiredText(input.skillSlug, "skillSlug", 120);
  const requestedPriceId = normalizeOptionalText(input.priceId, 120);
  const status = normalizeCreateStatus(input.status);
  const trialDays = normalizeTrialDays(input.trialDays, status);

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      select
        p.id::text as "projectId",
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        s.id::text as "skillId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        s.visibility,
        s.verification_status as "verificationStatus",
        sp.id::text as "priceId",
        sp.billing_model as "billingModel",
        sp.unit_amount_cents as "unitAmountCents",
        sp.currency
      from projects p
      join skills s on s.slug = ${skillSlug}
      join lateral (
        select id, billing_model, unit_amount_cents, currency, status, created_at
        from skill_prices
        where skill_id = s.id
          and status = 'active'
          and (${requestedPriceId}::uuid is null or id = ${requestedPriceId})
        order by created_at desc
        limit 1
      ) sp on true
      where p.slug = ${projectSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      limit 1
      for update of p
    `) as Array<{
      projectId: string;
      projectSlug: string;
      organizationId: string;
      skillId: string;
      skillSlug: string;
      displayName: string;
      visibility: string;
      verificationStatus: string;
      priceId: string;
      billingModel: "free" | "per_call" | "subscription";
      unitAmountCents: number;
      currency: string;
    }>;
    const target = rows[0];

    if (!target) {
      throw new Error("Project, skill, or active price not found.");
    }

    if (target.billingModel !== "subscription") {
      throw new Error("Only subscription-priced skills can create project subscriptions.");
    }

    if (target.visibility !== "public" || target.verificationStatus !== "verified") {
      throw new Error("Project subscriptions require a public verified skill.");
    }

    const periodStart = new Date();
    const periodEnd = addDays(periodStart, status === "trialing" ? trialDays : 30);

    const existingRows = (await tx`
      select id::text
      from subscriptions
      where project_id = ${target.projectId}
        and skill_id = ${target.skillId}
      order by created_at desc
      limit 1
      for update
    `) as Array<{ id: string }>;
    const existingSubscriptionId = existingRows[0]?.id ?? null;

    const subscriptionRows = existingSubscriptionId
      ? ((await tx`
          update subscriptions
          set
            price_id = ${target.priceId},
            status = ${status},
            current_period_start = ${periodStart.toISOString()}::timestamptz,
            current_period_end = ${periodEnd.toISOString()}::timestamptz,
            paused_at = null,
            canceled_at = null,
            updated_at = now()
          where id = ${existingSubscriptionId}
          returning
            id::text,
            ${target.projectSlug} as "projectSlug",
            ${target.organizationId} as "organizationId",
            ${target.skillSlug} as "skillSlug",
            ${target.displayName} as "displayName",
            status,
            ${target.billingModel} as "billingModel",
            ${target.unitAmountCents}::int as "unitAmountCents",
            ${target.currency} as currency,
            current_period_start as "currentPeriodStart",
            current_period_end as "currentPeriodEnd",
            paused_at as "pausedAt",
            canceled_at as "canceledAt",
            updated_at as "updatedAt",
            created_at as "createdAt"
        `) as ProjectSubscriptionRow[])
      : ((await tx`
          insert into subscriptions (
            project_id,
            skill_id,
            price_id,
            status,
            current_period_start,
            current_period_end,
            paused_at,
            canceled_at,
            updated_at
          )
          values (
            ${target.projectId},
            ${target.skillId},
            ${target.priceId},
            ${status},
            ${periodStart.toISOString()}::timestamptz,
            ${periodEnd.toISOString()}::timestamptz,
            null,
            null,
            now()
          )
          returning
            id::text,
            ${target.projectSlug} as "projectSlug",
            ${target.organizationId} as "organizationId",
            ${target.skillSlug} as "skillSlug",
            ${target.displayName} as "displayName",
            status,
            ${target.billingModel} as "billingModel",
            ${target.unitAmountCents}::int as "unitAmountCents",
            ${target.currency} as currency,
            current_period_start as "currentPeriodStart",
            current_period_end as "currentPeriodEnd",
            paused_at as "pausedAt",
            canceled_at as "canceledAt",
            updated_at as "updatedAt",
            created_at as "createdAt"
        `) as ProjectSubscriptionRow[]);
    const subscription = subscriptionRows[0];
    const auditAction = existingSubscriptionId ? "project_subscription.refreshed" : "project_subscription.created";
    const auditVerb = existingSubscriptionId ? "refreshed" : "created";

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        ${auditAction},
        'subscription',
        ${subscription.id},
        ${`Project subscription ${auditVerb} with ${status} provider-deferred state.`},
        ${tx.json({
          projectSlug,
          skillSlug: subscription.skillSlug,
          status,
          refreshedExistingSubscription: Boolean(existingSubscriptionId),
          organizationId: subscription.organizationId,
          priceId: target.priceId,
          billingModel: target.billingModel,
          unitAmountCents: target.unitAmountCents,
          currency: target.currency
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${subscription.organizationId},
        ${auditAction},
        'in_app',
        ${`Project subscription ${auditVerb}`},
        ${tx.json({
          projectSlug,
          skillSlug: subscription.skillSlug,
          displayName: subscription.displayName,
          status,
          refreshedExistingSubscription: Boolean(existingSubscriptionId),
          priceId: target.priceId,
          unitAmountCents: target.unitAmountCents,
          currency: target.currency,
          providerDeferred: true
        })},
        'queued'
      )
    `;

    return subscription;
  });
}

export async function updateProjectSubscriptionStatus(
  projectSlug: string,
  subscriptionId: string,
  nextStatus: string,
  organizationId?: string | null,
  reasonInput?: unknown,
  actorUserId?: string | null
) {
  const status = normalizeProjectManagedStatus(nextStatus);
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;
  const reason = normalizeProjectActionReason(
    reasonInput,
    `Project subscription changed to ${status}.`,
    status === "paused" || status === "canceled"
  );

  return sql.begin(async (tx: Sql) => {
    const currentRows = (await tx`
      select
        sub.id::text,
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        sub.status,
        sp.billing_model as "billingModel",
        sp.unit_amount_cents as "unitAmountCents",
        sp.currency,
        sub.current_period_start as "currentPeriodStart",
        sub.current_period_end as "currentPeriodEnd",
        sub.paused_at as "pausedAt",
        sub.canceled_at as "canceledAt",
        sub.updated_at as "updatedAt",
        sub.created_at as "createdAt"
      from subscriptions sub
      join projects p on p.id = sub.project_id
      join skills s on s.id = sub.skill_id
      left join skill_prices sp on sp.id = sub.price_id
      where sub.id = ${subscriptionId}
        and p.slug = ${projectSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      for update
    `) as ProjectSubscriptionRow[];
    const current = currentRows[0];

    if (!current) {
      throw new Error("Subscription not found for this project.");
    }

    validateSubscriptionTransition(current.status, status);

    const updatedRows = (await tx`
      update subscriptions sub
      set
        status = ${status},
        paused_at = case
          when ${status} = 'paused' and sub.paused_at is null then now()
          when ${status} = 'active' then null
          else sub.paused_at
        end,
        canceled_at = case
          when ${status} = 'canceled' and sub.canceled_at is null then now()
          when ${status} = 'active' then null
          else sub.canceled_at
        end,
        updated_at = now()
      from projects p, skills s
      where sub.project_id = p.id
        and sub.skill_id = s.id
        and sub.id = ${subscriptionId}
        and p.slug = ${projectSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      returning
        sub.id::text,
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        sub.status,
        (select sp.billing_model from skill_prices sp where sp.id = sub.price_id) as "billingModel",
        (select sp.unit_amount_cents from skill_prices sp where sp.id = sub.price_id) as "unitAmountCents",
        (select sp.currency from skill_prices sp where sp.id = sub.price_id) as currency,
        sub.current_period_start as "currentPeriodStart",
        sub.current_period_end as "currentPeriodEnd",
        sub.paused_at as "pausedAt",
        sub.canceled_at as "canceledAt",
        sub.updated_at as "updatedAt",
        sub.created_at as "createdAt"
    `) as ProjectSubscriptionRow[];
    const subscription = updatedRows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        ${`project_subscription.${status}`},
        'subscription',
        ${subscription.id},
        ${reason},
        ${tx.json({
          projectSlug,
          skillSlug: subscription.skillSlug,
          previousStatus: current.status,
          reason,
          status,
          organizationId: subscription.organizationId
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${subscription.organizationId},
        ${`project_subscription.${status}`},
        'in_app',
        ${`Project subscription ${status}`},
        ${tx.json({
          projectSlug,
          skillSlug: subscription.skillSlug,
          displayName: subscription.displayName,
          previousStatus: current.status,
          reason,
          status
        })},
        'queued'
      )
    `;

    return subscription;
  });
}

function normalizeProjectManagedStatus(value: string): ProjectManagedSubscriptionStatus {
  if (!projectManagedStatuses.includes(value as ProjectManagedSubscriptionStatus)) {
    throw new Error("Subscription status must be active, paused, or canceled.");
  }

  return value as ProjectManagedSubscriptionStatus;
}

function normalizeCreateStatus(value: unknown): ProjectSubscriptionCreateStatus {
  const normalized = String(value ?? "trialing").trim().toLowerCase();

  if (!projectCreateStatuses.includes(normalized as ProjectSubscriptionCreateStatus)) {
    throw new Error("Subscription status must be trialing or active.");
  }

  return normalized as ProjectSubscriptionCreateStatus;
}

function normalizeTrialDays(value: unknown, status: ProjectSubscriptionCreateStatus) {
  const fallback = status === "trialing" ? 14 : 30;
  const parsed = Number(value ?? fallback);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 90);
}

function normalizeRequiredText(value: unknown, fieldName: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }

  return text.slice(0, maxLength);
}

function normalizeProjectActionReason(value: unknown, fallback: string, required: boolean) {
  const reason = String(value ?? "").trim();

  if (required && reason.length < 6) {
    throw new Error("A reason is required before this project operation.");
  }

  return (reason || fallback).slice(0, 600);
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function validateSubscriptionTransition(current: ProjectSubscriptionStatus, next: ProjectManagedSubscriptionStatus) {
  if (current === next) {
    return;
  }

  if (current === "canceled") {
    throw new Error("Canceled subscriptions cannot be restored from the project console.");
  }

  if (next === "active" && !["trialing", "active", "past_due", "paused"].includes(current)) {
    throw new Error(`Cannot restore a subscription while status is ${current}.`);
  }

  if (next === "paused" && !["trialing", "active", "past_due"].includes(current)) {
    throw new Error(`Cannot pause a subscription while status is ${current}.`);
  }

  if (next === "canceled" && !["trialing", "active", "past_due", "paused"].includes(current)) {
    throw new Error(`Cannot cancel a subscription while status is ${current}.`);
  }
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for project subscription operations.");
  }

  return sql;
}
