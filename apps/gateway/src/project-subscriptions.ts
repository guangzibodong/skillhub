import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectSubscriptionStatus = "trialing" | "active" | "past_due" | "paused" | "canceled";
type ProjectManagedSubscriptionStatus = "active" | "paused" | "canceled";

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

export async function updateProjectSubscriptionStatus(
  projectSlug: string,
  subscriptionId: string,
  nextStatus: string,
  organizationId?: string | null
) {
  const status = normalizeProjectManagedStatus(nextStatus);
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;

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
      insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
      values (
        ${`project_subscription.${status}`},
        'subscription',
        ${subscription.id},
        ${`Project subscription changed from ${current.status} to ${status}.`},
        ${tx.json({
          projectSlug,
          skillSlug: subscription.skillSlug,
          previousStatus: current.status,
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
