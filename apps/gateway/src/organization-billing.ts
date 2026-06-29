import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type BillingProfileInput = {
  addressLine1?: unknown;
  addressLine2?: unknown;
  billingEmail?: unknown;
  billingName?: unknown;
  city?: unknown;
  country?: unknown;
  invoiceNotes?: unknown;
  postalCode?: unknown;
  region?: unknown;
  taxId?: unknown;
};

type PaymentMethodInput = {
  brand?: unknown;
  expMonth?: unknown;
  expYear?: unknown;
  isDefault?: unknown;
  last4?: unknown;
  methodType?: unknown;
  provider?: unknown;
  providerCustomerId?: unknown;
  providerPaymentMethodId?: unknown;
  status?: unknown;
};

type PaymentMethodStatus = "not_configured" | "pending" | "ready" | "requires_action" | "failed" | "disabled";
type PaymentMethodType = "bank_account" | "card" | "external" | "invoice";

type BillingProfileRow = {
  id: string;
  organizationId: string;
  billingName: string;
  billingEmail: string | null;
  taxId: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  invoiceNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type PaymentMethodRow = {
  id: string;
  organizationId: string;
  provider: string;
  providerCustomerId: string | null;
  providerPaymentMethodId: string | null;
  methodType: PaymentMethodType;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  status: PaymentMethodStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
};

const methodTypes: PaymentMethodType[] = ["bank_account", "card", "external", "invoice"];
const paymentStatuses: PaymentMethodStatus[] = ["not_configured", "pending", "ready", "requires_action", "failed", "disabled"];

export async function getOrganizationBillingSummary(organizationId: string | null | undefined) {
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const sql = await getSql();

  if (!sql) {
    return toBillingSummary(null, []);
  }

  const [billingProfile, paymentMethods] = await Promise.all([
    getBillingProfile(sql, scopedOrganizationId),
    listPaymentMethods(sql, scopedOrganizationId)
  ]);

  return toBillingSummary(billingProfile, paymentMethods);
}

export async function upsertOrganizationBillingProfile(organizationId: string | null | undefined, input: BillingProfileInput) {
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const sql = await requireSql();
  const organization = await getOrganization(sql, scopedOrganizationId);
  const billingName = normalizeRequiredText(input.billingName, organization.name, "billingName");

  const rows = (await sql`
    insert into organization_billing_profiles (
      organization_id,
      billing_name,
      billing_email,
      tax_id,
      country,
      address_line1,
      address_line2,
      city,
      region,
      postal_code,
      invoice_notes,
      updated_at
    )
    values (
      ${organization.id},
      ${billingName},
      ${normalizeEmail(input.billingEmail)},
      ${normalizeNullableText(input.taxId, 80)},
      ${normalizeCountry(input.country)},
      ${normalizeNullableText(input.addressLine1, 160)},
      ${normalizeNullableText(input.addressLine2, 160)},
      ${normalizeNullableText(input.city, 120)},
      ${normalizeNullableText(input.region, 120)},
      ${normalizeNullableText(input.postalCode, 40)},
      ${normalizeNullableText(input.invoiceNotes, 1000)},
      now()
    )
    on conflict (organization_id) do update set
      billing_name = excluded.billing_name,
      billing_email = excluded.billing_email,
      tax_id = excluded.tax_id,
      country = excluded.country,
      address_line1 = excluded.address_line1,
      address_line2 = excluded.address_line2,
      city = excluded.city,
      region = excluded.region,
      postal_code = excluded.postal_code,
      invoice_notes = excluded.invoice_notes,
      updated_at = now()
    returning
      id::text,
      organization_id::text as "organizationId",
      billing_name as "billingName",
      billing_email as "billingEmail",
      tax_id as "taxId",
      country,
      address_line1 as "addressLine1",
      address_line2 as "addressLine2",
      city,
      region,
      postal_code as "postalCode",
      invoice_notes as "invoiceNotes",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `) as BillingProfileRow[];
  const profile = rows[0];

  await recordBillingAudit(sql, organization.id, "organization_billing.profile_updated", "organization_billing_profile", profile.id, {
    billingEmail: profile.billingEmail,
    billingName: profile.billingName
  });

  return profile;
}

export async function upsertOrganizationPaymentMethod(organizationId: string | null | undefined, input: PaymentMethodInput) {
  const provider = normalizeRequiredText(input.provider, "manual", "provider");
  const methodType = normalizeMethodType(input.methodType);
  const status = normalizePaymentStatus(input.status);
  const providerPaymentMethodId = normalizeNullableText(input.providerPaymentMethodId, 160) ?? `manual_${methodType}`;
  const isDefault = normalizeBoolean(input.isDefault, true);
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    if (isDefault) {
      await tx`
        update organization_payment_methods
        set is_default = false, updated_at = now()
        where organization_id = ${scopedOrganizationId}
      `;
    }

    const rows = (await tx`
      insert into organization_payment_methods (
        organization_id,
        provider,
        provider_customer_id,
        provider_payment_method_id,
        method_type,
        brand,
        last4,
        exp_month,
        exp_year,
        status,
        is_default,
        updated_at
      )
      values (
        ${scopedOrganizationId},
        ${provider},
        ${normalizeNullableText(input.providerCustomerId, 160)},
        ${providerPaymentMethodId},
        ${methodType},
        ${normalizeNullableText(input.brand, 40)},
        ${normalizeLast4(input.last4)},
        ${normalizeMonth(input.expMonth)},
        ${normalizeYear(input.expYear)},
        ${status},
        ${isDefault},
        now()
      )
      on conflict (organization_id, provider, provider_payment_method_id)
      where provider_payment_method_id is not null
      do update set
        provider_customer_id = excluded.provider_customer_id,
        method_type = excluded.method_type,
        brand = excluded.brand,
        last4 = excluded.last4,
        exp_month = excluded.exp_month,
        exp_year = excluded.exp_year,
        status = excluded.status,
        is_default = excluded.is_default,
        updated_at = now()
      returning
        id::text,
        organization_id::text as "organizationId",
        provider,
        provider_customer_id as "providerCustomerId",
        provider_payment_method_id as "providerPaymentMethodId",
        method_type as "methodType",
        brand,
        last4,
        exp_month as "expMonth",
        exp_year as "expYear",
        status,
        is_default as "isDefault",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as PaymentMethodRow[];
    const paymentMethod = rows[0];

    await recordBillingAudit(tx, scopedOrganizationId, "organization_billing.payment_method_added", "organization_payment_method", paymentMethod.id, {
      methodType: paymentMethod.methodType,
      provider: paymentMethod.provider,
      status: paymentMethod.status
    });

    return paymentMethod;
  });
}

export async function updateOrganizationPaymentMethodStatus(
  organizationId: string | null | undefined,
  paymentMethodId: string,
  input: { isDefault?: unknown; status?: unknown }
) {
  const status = input.status === undefined ? null : normalizePaymentStatus(input.status);
  const isDefault = input.isDefault === undefined ? null : normalizeBoolean(input.isDefault, false);
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    if (isDefault) {
      await tx`
        update organization_payment_methods
        set is_default = false, updated_at = now()
        where organization_id = ${scopedOrganizationId}
      `;
    }

    const rows = (await tx`
      update organization_payment_methods
      set
        status = case when ${status}::text is null then status else ${status} end,
        is_default = case when ${isDefault}::boolean is null then is_default else ${isDefault} end,
        updated_at = now()
      where id = ${paymentMethodId}
        and organization_id = ${scopedOrganizationId}
      returning
        id::text,
        organization_id::text as "organizationId",
        provider,
        provider_customer_id as "providerCustomerId",
        provider_payment_method_id as "providerPaymentMethodId",
        method_type as "methodType",
        brand,
        last4,
        exp_month as "expMonth",
        exp_year as "expYear",
        status,
        is_default as "isDefault",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as PaymentMethodRow[];
    const paymentMethod = rows[0];

    if (!paymentMethod) {
      throw new Error("Payment method not found for this organization.");
    }

    await recordBillingAudit(tx, scopedOrganizationId, "organization_billing.payment_method_updated", "organization_payment_method", paymentMethod.id, {
      isDefault: paymentMethod.isDefault,
      status: paymentMethod.status
    });

    return paymentMethod;
  });
}

function toBillingSummary(billingProfile: BillingProfileRow | null, paymentMethods: PaymentMethodRow[]) {
  const defaultPaymentMethod = paymentMethods.find((method) => method.isDefault) ?? paymentMethods[0] ?? null;
  const profileComplete = Boolean(billingProfile?.billingName && billingProfile.billingEmail);
  const defaultPaymentMethodStatus = defaultPaymentMethod?.status ?? "not_configured";

  return {
    billingProfile,
    paymentMethods,
    summary: {
      defaultPaymentMethodStatus,
      invoiceReady: profileComplete && ["ready", "pending"].includes(defaultPaymentMethodStatus),
      paymentMethodCount: paymentMethods.length,
      profileComplete
    }
  };
}

async function getBillingProfile(sql: Sql, organizationId: string) {
  const rows = (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      billing_name as "billingName",
      billing_email as "billingEmail",
      tax_id as "taxId",
      country,
      address_line1 as "addressLine1",
      address_line2 as "addressLine2",
      city,
      region,
      postal_code as "postalCode",
      invoice_notes as "invoiceNotes",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from organization_billing_profiles
    where organization_id = ${organizationId}
    limit 1
  `) as BillingProfileRow[];

  return rows[0] ?? null;
}

async function listPaymentMethods(sql: Sql, organizationId: string) {
  return (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      provider,
      provider_customer_id as "providerCustomerId",
      provider_payment_method_id as "providerPaymentMethodId",
      method_type as "methodType",
      brand,
      last4,
      exp_month as "expMonth",
      exp_year as "expYear",
      status,
      is_default as "isDefault",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from organization_payment_methods
    where organization_id = ${organizationId}
    order by is_default desc, updated_at desc
  `) as PaymentMethodRow[];
}

async function getOrganization(sql: Sql, organizationId: string) {
  const rows = (await sql`
    select id::text, name, slug
    from organizations
    where id = ${organizationId}
    limit 1
  `) as OrganizationRow[];
  const organization = rows[0];

  if (!organization) {
    throw new Error("Organization not found.");
  }

  return organization;
}

async function recordBillingAudit(
  sql: Sql,
  organizationId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
    values (${action}, ${entityType}, ${entityId}, 'Organization billing state changed.', ${sql.json({ organizationId, ...metadata })})
  `;
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId}, ${action}, 'in_app', 'Organization billing updated', ${sql.json(metadata)}, 'queued')
  `;
}

function normalizeRequiredText(value: unknown, fallback: string, label: string) {
  const text = String(value ?? fallback).trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, 160);
}

function normalizeNullableText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeEmail(value: unknown) {
  const email = normalizeNullableText(value, 254);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("billingEmail must be a valid email address.");
  }

  return email;
}

function normalizeCountry(value: unknown) {
  const country = normalizeNullableText(value, 2);
  return country ? country.toUpperCase() : null;
}

function normalizeMethodType(value: unknown): PaymentMethodType {
  const methodType = String(value ?? "invoice").trim();

  if (!methodTypes.includes(methodType as PaymentMethodType)) {
    throw new Error("methodType must be card, bank_account, invoice, or external.");
  }

  return methodType as PaymentMethodType;
}

function normalizePaymentStatus(value: unknown): PaymentMethodStatus {
  const status = String(value ?? "pending").trim();

  if (!paymentStatuses.includes(status as PaymentMethodStatus)) {
    throw new Error("payment method status is invalid.");
  }

  return status as PaymentMethodStatus;
}

function normalizeLast4(value: unknown) {
  const last4 = normalizeNullableText(value, 4);

  if (last4 && !/^[a-zA-Z0-9]{2,4}$/.test(last4)) {
    throw new Error("last4 must be 2 to 4 alphanumeric characters.");
  }

  return last4;
}

function normalizeMonth(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const month = Math.trunc(Number(value));

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    throw new Error("expMonth must be between 1 and 12.");
  }

  return month;
}

function normalizeYear(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const year = Math.trunc(Number(value));

  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    throw new Error("expYear must be a four-digit year.");
  }

  return year;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value === true || value === "true" || value === "on" || value === "1";
}

function requireOrganizationId(organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error("Organization billing operations require an organization-scoped user token.");
  }

  return organizationId;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for organization billing operations.");
  }

  return sql;
}
