import { getSql } from "./registry.js";
import { resolveStripeConfig, type PlatformConfigEnv } from "./platform-config.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

export type StripeRuntimeEnv = PlatformConfigEnv & {
  NEXT_PUBLIC_APP_URL?: string;
  SKILLHUB_STRIPE_CANCEL_URL?: string;
  SKILLHUB_STRIPE_REFRESH_URL?: string;
  SKILLHUB_STRIPE_RETURN_URL?: string;
  SKILLHUB_STRIPE_SUCCESS_URL?: string;
  STRIPE_CONNECT_CLIENT_ID?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

type CheckoutSessionInput = {
  priceId?: unknown;
  projectSlug?: unknown;
  quantity?: unknown;
  skillSlug?: unknown;
  successUrl?: unknown;
  cancelUrl?: unknown;
};

type StripeCheckoutSession = {
  id: string;
  url: string | null;
  mode: "payment" | "subscription";
  status: string | null;
  payment_status: string | null;
  amount_total: number | null;
  currency: string | null;
  customer: string | null;
};

type StripeAccount = {
  id: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements?: {
    currently_due?: string[];
  };
};

type StripeAccountLink = {
  created: number;
  expires_at: number;
  object: "account_link";
  url: string;
};

type StripeProduct = {
  id: string;
};

type StripePrice = {
  id: string;
  product: string;
};

type StripeRefundInput = {
  amountCents?: unknown;
  chargeId?: unknown;
  metadata?: unknown;
  paymentIntentId?: unknown;
  reason?: unknown;
};

type StripeRefund = {
  id: string;
  amount: number | null;
  charge: string | null;
  currency: string | null;
  metadata?: Record<string, unknown>;
  payment_intent: string | null;
  reason: string | null;
  status: string | null;
};

type StripeCatalogPriceInput = {
  billingModel: "per_call" | "subscription";
  currency: string;
  displayName: string;
  skillId: string;
  skillSlug: string;
  unitAmountCents: number;
};

type StripeWebhookEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  data?: {
    object?: Record<string, unknown>;
  };
};

type StripePriceContext = {
  billingModel: "free" | "per_call" | "subscription";
  currency: string;
  displayName: string;
  priceId: string;
  projectId: string;
  projectOrganizationId: string;
  projectSlug: string;
  skillId: string;
  skillSlug: string;
  stripePriceId: string;
  unitAmountCents: number;
};

type StripeDestinationContext = {
  applicationFeeAmountCents: number;
  platformFeeBps: number;
  publisherProfileId: string;
  publisherShareCents: number;
  stripeConnectedAccountId: string;
};

export async function createStripeCheckoutSession(
  input: CheckoutSessionInput,
  organizationId: string | null | undefined,
  env?: StripeRuntimeEnv,
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const priceId = optionalUuid(input.priceId);
  const projectSlug = normalizeRequiredText(input.projectSlug, "projectSlug", 120);
  const skillSlug = normalizeOptionalText(input.skillSlug, 120);
  const quantity = normalizeQuantity(input.quantity);
  const context = await getStripePriceContext(
    sql,
    priceId,
    projectSlug,
    skillSlug,
    scopedOrganizationId,
  );

  if (context.billingModel === "free") {
    throw new Error("Free skills do not require Stripe Checkout.");
  }

  if (!context.stripePriceId) {
    throw new Error("Skill price is not linked to a Stripe Price.");
  }

  const stripeConfig = await requireStripeConfig(env);
  const destination = await getStripeDestinationContext(sql, context, quantity);
  const successUrl = normalizeCheckoutUrl(
    input.successUrl,
    stripeConfig.successUrl ??
      defaultAppUrl(env, `/dashboard/projects/${context.projectSlug}?checkout=success`),
    "successUrl",
  );
  const cancelUrl = normalizeCheckoutUrl(
    input.cancelUrl,
    stripeConfig.cancelUrl ??
      defaultAppUrl(env, `/skills/${context.skillSlug}?checkout=canceled`),
    "cancelUrl",
  );
  const mode = context.billingModel === "subscription" ? "subscription" : "payment";
  const metadata = {
    organizationId: scopedOrganizationId,
    priceId: context.priceId,
    projectId: context.projectId,
    projectSlug: context.projectSlug,
    publisherProfileId: destination.publisherProfileId,
    applicationFeeAmountCents: String(destination.applicationFeeAmountCents),
    platformFeeBps: String(destination.platformFeeBps),
    publisherShareCents: String(destination.publisherShareCents),
    skillId: context.skillId,
    skillSlug: context.skillSlug,
    stripeConnectedAccountId: destination.stripeConnectedAccountId,
  };
  const body = new URLSearchParams({
    cancel_url: cancelUrl,
    mode,
    success_url: successUrl,
  });
  body.set("line_items[0][price]", context.stripePriceId);
  body.set("line_items[0][quantity]", String(quantity));
  body.set("metadata[organizationId]", metadata.organizationId);
  body.set("metadata[projectId]", metadata.projectId);
  body.set("metadata[projectSlug]", metadata.projectSlug);
  body.set("metadata[skillId]", metadata.skillId);
  body.set("metadata[skillSlug]", metadata.skillSlug);
  body.set("metadata[priceId]", metadata.priceId);
  body.set("metadata[publisherProfileId]", metadata.publisherProfileId);
  body.set("metadata[applicationFeeAmountCents]", metadata.applicationFeeAmountCents);
  body.set("metadata[platformFeeBps]", metadata.platformFeeBps);
  body.set("metadata[stripeConnectedAccountId]", metadata.stripeConnectedAccountId);
  body.set("metadata[publisherShareCents]", metadata.publisherShareCents);

  if (mode === "payment") {
    body.set(
      "payment_intent_data[application_fee_amount]",
      String(destination.applicationFeeAmountCents),
    );
    body.set(
      "payment_intent_data[transfer_data][destination]",
      destination.stripeConnectedAccountId,
    );
  } else {
    body.set(
      "subscription_data[application_fee_percent]",
      percentageFromBasisPoints(destination.platformFeeBps),
    );
    body.set(
      "subscription_data[transfer_data][destination]",
      destination.stripeConnectedAccountId,
    );
  }

  const session = await stripeRequest<StripeCheckoutSession>(
    "POST",
    "/v1/checkout/sessions",
    body,
    env,
  );

  await sql`
    insert into stripe_checkout_sessions (
      stripe_session_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      stripe_customer_id,
      mode,
      status,
      payment_status,
      amount_total_cents,
      currency,
      url,
      stripe_connected_account_id,
      application_fee_amount_cents,
      publisher_share_cents,
      metadata,
      updated_at
    )
    values (
      ${session.id},
      ${scopedOrganizationId},
      ${context.projectId},
      ${context.skillId},
      ${context.priceId},
      ${session.customer},
      ${session.mode},
      ${session.status ?? "created"},
      ${session.payment_status},
      ${session.amount_total},
      ${session.currency},
      ${session.url},
      ${destination.stripeConnectedAccountId},
      ${destination.applicationFeeAmountCents},
      ${destination.publisherShareCents},
      ${sql.json(metadata)},
      now()
    )
    on conflict (stripe_session_id) do update set
      status = excluded.status,
      payment_status = excluded.payment_status,
      amount_total_cents = excluded.amount_total_cents,
      currency = excluded.currency,
      url = excluded.url,
      stripe_connected_account_id = excluded.stripe_connected_account_id,
      application_fee_amount_cents = excluded.application_fee_amount_cents,
      publisher_share_cents = excluded.publisher_share_cents,
      updated_at = now()
  `;

  return {
    checkoutSessionId: session.id,
    mode,
    url: session.url,
  };
}

export async function createStripeCatalogPrice(
  input: StripeCatalogPriceInput,
  env?: StripeRuntimeEnv,
) {
  if (input.unitAmountCents <= 0) {
    throw new Error("Paid Stripe prices require a positive unit amount.");
  }

  const productBody = new URLSearchParams({
    active: "true",
    name: input.displayName,
  });
  productBody.set("metadata[skillId]", input.skillId);
  productBody.set("metadata[skillSlug]", input.skillSlug);

  const product = await stripeRequest<StripeProduct>(
    "POST",
    "/v1/products",
    productBody,
    env,
  );
  const priceBody = new URLSearchParams({
    currency: input.currency,
    product: product.id,
    unit_amount: String(input.unitAmountCents),
  });
  priceBody.set("metadata[skillId]", input.skillId);
  priceBody.set("metadata[skillSlug]", input.skillSlug);
  priceBody.set("metadata[billingModel]", input.billingModel);

  if (input.billingModel === "subscription") {
    priceBody.set("recurring[interval]", "month");
  }

  const price = await stripeRequest<StripePrice>(
    "POST",
    "/v1/prices",
    priceBody,
    env,
  );

  return {
    stripePriceId: price.id,
    stripeProductId: product.id,
  };
}

export async function createStripeRefund(
  input: StripeRefundInput,
  env?: StripeRuntimeEnv,
) {
  const sql = await requireSql();
  const paymentIntentId = normalizeOptionalStripeId(
    input.paymentIntentId,
    "paymentIntentId",
  );
  const chargeId = normalizeOptionalStripeId(input.chargeId, "chargeId");
  const amountCents = normalizeOptionalPositiveInteger(
    input.amountCents,
    "amountCents",
  );
  const reason = normalizeStripeRefundReason(input.reason);
  const metadata = metadataInputValue(input.metadata);

  if (!paymentIntentId && !chargeId) {
    throw new Error("paymentIntentId or chargeId is required for Stripe refunds.");
  }

  const body = new URLSearchParams();

  if (paymentIntentId) {
    body.set("payment_intent", paymentIntentId);
  }

  if (chargeId) {
    body.set("charge", chargeId);
  }

  if (amountCents !== null) {
    body.set("amount", String(amountCents));
  }

  if (reason) {
    body.set("reason", reason);
  }

  for (const [key, value] of Object.entries(metadata)) {
    body.set(`metadata[${key}]`, value);
  }

  const refund = await stripeRequest<StripeRefund>(
    "POST",
    "/v1/refunds",
    body,
    env,
  );

  await sql`
    insert into stripe_refunds (
      stripe_refund_id,
      stripe_payment_intent_id,
      stripe_charge_id,
      amount_cents,
      currency,
      status,
      reason,
      metadata,
      updated_at
    )
    values (
      ${refund.id},
      ${refund.payment_intent ?? paymentIntentId},
      ${refund.charge ?? chargeId},
      ${refund.amount},
      ${refund.currency},
      ${refund.status},
      ${refund.reason ?? reason},
      ${sql.json(metadataValue(refund.metadata ?? metadata))},
      now()
    )
    on conflict (stripe_refund_id) do update set
      stripe_payment_intent_id = excluded.stripe_payment_intent_id,
      stripe_charge_id = excluded.stripe_charge_id,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      status = excluded.status,
      reason = excluded.reason,
      metadata = excluded.metadata,
      updated_at = now()
  `;

  return {
    amountCents: refund.amount,
    chargeId: refund.charge ?? chargeId,
    currency: refund.currency,
    paymentIntentId: refund.payment_intent ?? paymentIntentId,
    reason: refund.reason ?? reason,
    status: refund.status,
    stripeRefundId: refund.id,
  };
}

export async function createStripeConnectOnboarding(
  organizationId: string | null | undefined,
  env?: StripeRuntimeEnv,
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const stripeConfig = await requireStripeConfig(env);
  const publisher = await getPublisherProfile(sql, scopedOrganizationId);

  if (!publisher) {
    throw new Error("Publisher profile is required before Connect onboarding.");
  }

  const account = await getOrCreateStripeConnectedAccount(sql, publisher, env);
  const returnUrl =
    stripeConfig.returnUrl ??
    defaultAppUrl(env, "/publisher?stripe_connect=return");
  const refreshUrl =
    stripeConfig.refreshUrl ??
    defaultAppUrl(env, "/publisher?stripe_connect=refresh");
  const body = new URLSearchParams({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  const link = await stripeRequest<StripeAccountLink>(
    "POST",
    "/v1/account_links",
    body,
    env,
  );

  await sql`
    insert into payout_account_onboarding_sessions (
      publisher_profile_id,
      provider,
      provider_session_id,
      onboarding_url,
      return_url,
      refresh_url,
      status,
      expires_at,
      updated_at
    )
    values (
      ${publisher.id},
      'stripe_connect',
      ${`stripe_link_${account.id}_${link.created}`},
      ${link.url},
      ${returnUrl},
      ${refreshUrl},
      'created',
      to_timestamp(${link.expires_at}),
      now()
    )
  `;

  return {
    accountId: account.id,
    onboardingUrl: link.url,
    publisherProfileId: publisher.id,
  };
}

export async function getStripeConnectStatus(
  organizationId: string | null | undefined,
  env?: StripeRuntimeEnv,
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const publisher = await getPublisherProfile(sql, scopedOrganizationId);

  if (!publisher) {
    return {
      accountId: null,
      chargesEnabled: false,
      detailsSubmitted: false,
      payoutsEnabled: false,
      publisherProfileId: null,
      requirementsCurrentlyDue: [],
    };
  }

  const rows = (await sql`
    select
      stripe_account_id as "accountId",
      details_submitted as "detailsSubmitted",
      charges_enabled as "chargesEnabled",
      payouts_enabled as "payoutsEnabled",
      requirements_currently_due as "requirementsCurrentlyDue"
    from stripe_connect_accounts
    where publisher_profile_id = ${publisher.id}
    limit 1
  `) as Array<{
    accountId: string;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
    requirementsCurrentlyDue: string[];
  }>;
  const existing = rows[0];

  if (!existing) {
    return {
      accountId: null,
      chargesEnabled: false,
      detailsSubmitted: false,
      payoutsEnabled: false,
      publisherProfileId: publisher.id,
      requirementsCurrentlyDue: [],
    };
  }

  const account = await stripeRequest<StripeAccount>(
    "GET",
    `/v1/accounts/${encodeURIComponent(existing.accountId)}`,
    undefined,
    env,
  );
  await upsertStripeConnectAccount(sql, publisher.id, account);

  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled === true,
    detailsSubmitted: account.details_submitted === true,
    payoutsEnabled: account.payouts_enabled === true,
    publisherProfileId: publisher.id,
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
  };
}

export async function handleStripeWebhook(
  payload: string,
  signatureHeader: string | null,
  env?: StripeRuntimeEnv,
) {
  const sql = await requireSql();
  const event = await verifyStripeWebhook(payload, signatureHeader, env);

  try {
    await sql.begin(async (tx: Sql) => {
      await tx`
        insert into stripe_webhook_events (
          stripe_event_id,
          event_type,
          livemode,
          payload,
          processing_status,
          processed_at
        )
        values (
          ${event.id},
          ${event.type},
          ${event.livemode === true},
          ${tx.json(event)},
          'processed',
          now()
        )
        on conflict (stripe_event_id) do nothing
      `;

      await applyStripeEvent(tx, event);
    });

    return {
      eventId: event.id,
      received: true,
      type: event.type,
    };
  } catch (error) {
    await sql`
      insert into stripe_webhook_events (
        stripe_event_id,
        event_type,
        livemode,
        payload,
        processing_status,
        error_message,
        processed_at
      )
      values (
        ${event.id},
        ${event.type},
        ${event.livemode === true},
        ${sql.json(event)},
        'failed',
        ${error instanceof Error ? error.message.slice(0, 1000) : "Unable to process Stripe webhook."},
        now()
      )
      on conflict (stripe_event_id) do update set
        processing_status = 'failed',
        error_message = excluded.error_message,
        processed_at = now()
    `;

    throw error;
  }
}

async function getStripePriceContext(
  sql: Sql,
  priceId: string | null,
  projectSlug: string,
  skillSlug: string | null,
  organizationId: string,
): Promise<StripePriceContext> {
  const rows = (await sql`
    select
      sp.id::text as "priceId",
      sp.billing_model as "billingModel",
      sp.currency,
      sp.unit_amount_cents as "unitAmountCents",
      sp.stripe_price_id as "stripePriceId",
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "displayName",
      p.id::text as "projectId",
      p.slug as "projectSlug",
      p.organization_id::text as "projectOrganizationId"
    from skill_prices sp
    join skills s on s.id = sp.skill_id
    join projects p on p.slug = ${projectSlug}
    where (${priceId}::uuid is null or sp.id = ${priceId})
      and (${skillSlug}::text is null or s.slug = ${skillSlug})
      and sp.status = 'active'
      and p.organization_id = ${organizationId}
    order by sp.created_at desc
    limit 1
  `) as StripePriceContext[];
  const context = rows[0];

  if (!context) {
    throw new Error("Active skill price or project not found.");
  }

  return context;
}

async function getStripeDestinationContext(
  sql: Sql,
  context: StripePriceContext,
  quantity: number,
): Promise<StripeDestinationContext> {
  const rows = (await sql`
    select
      pp.id::text as "publisherProfileId",
      sca.stripe_account_id as "stripeConnectedAccountId",
      cr.platform_fee_bps as "platformFeeBps"
    from skills s
    join publisher_profiles pp on pp.organization_id = s.organization_id
    join stripe_connect_accounts sca on sca.publisher_profile_id = pp.id
    join commission_rules cr on cr.starts_at <= now()
      and (cr.ends_at is null or cr.ends_at > now())
    where s.id = ${context.skillId}
      and pp.status = 'active'
      and pp.payout_status = 'verified'
      and sca.payouts_enabled = true
    order by cr.starts_at desc
    limit 1
  `) as Array<{
    platformFeeBps: number;
    publisherProfileId: string;
    stripeConnectedAccountId: string;
  }>;
  const destination = rows[0];

  if (!destination) {
    throw new Error("Paid Checkout requires an active publisher with verified Stripe Connect payouts.");
  }

  const grossCents = context.unitAmountCents * quantity;
  const platformFeeBps = Math.trunc(Number(destination.platformFeeBps ?? 0));
  const applicationFeeAmountCents = Math.floor((grossCents * platformFeeBps) / 10000);

  return {
    applicationFeeAmountCents,
    platformFeeBps,
    publisherProfileId: destination.publisherProfileId,
    publisherShareCents: Math.max(grossCents - applicationFeeAmountCents, 0),
    stripeConnectedAccountId: destination.stripeConnectedAccountId,
  };
}

async function getPublisherProfile(sql: Sql, organizationId: string) {
  const rows = (await sql`
    select
      id::text,
      display_name as "displayName",
      organization_id::text as "organizationId"
    from publisher_profiles
    where organization_id = ${organizationId}
    limit 1
  `) as Array<{
    displayName: string;
    id: string;
    organizationId: string;
  }>;

  return rows[0] ?? null;
}

async function getOrCreateStripeConnectedAccount(
  sql: Sql,
  publisher: { displayName: string; id: string; organizationId: string },
  env?: StripeRuntimeEnv,
) {
  const existingRows = (await sql`
    select stripe_account_id as id
    from stripe_connect_accounts
    where publisher_profile_id = ${publisher.id}
    limit 1
  `) as Array<{ id: string }>;

  if (existingRows[0]) {
    return stripeRequest<StripeAccount>(
      "GET",
      `/v1/accounts/${encodeURIComponent(existingRows[0].id)}`,
      undefined,
      env,
    );
  }

  const body = new URLSearchParams({
    "business_profile[name]": publisher.displayName,
    "capabilities[card_payments][requested]": "true",
    "capabilities[transfers][requested]": "true",
    "metadata[organizationId]": publisher.organizationId,
    "metadata[publisherProfileId]": publisher.id,
    type: "express",
  });
  const account = await stripeRequest<StripeAccount>(
    "POST",
    "/v1/accounts",
    body,
    env,
  );
  await upsertStripeConnectAccount(sql, publisher.id, account);

  return account;
}

async function upsertStripeConnectAccount(
  sql: Sql,
  publisherProfileId: string,
  account: StripeAccount,
) {
  const requirements = account.requirements?.currently_due ?? [];
  await sql`
    insert into stripe_connect_accounts (
      publisher_profile_id,
      stripe_account_id,
      details_submitted,
      charges_enabled,
      payouts_enabled,
      requirements_currently_due,
      updated_at
    )
    values (
      ${publisherProfileId},
      ${account.id},
      ${account.details_submitted === true},
      ${account.charges_enabled === true},
      ${account.payouts_enabled === true},
      ${requirements},
      now()
    )
    on conflict (stripe_account_id) do update set
      details_submitted = excluded.details_submitted,
      charges_enabled = excluded.charges_enabled,
      payouts_enabled = excluded.payouts_enabled,
      requirements_currently_due = excluded.requirements_currently_due,
      updated_at = now()
  `;
  await sql`
    insert into payout_accounts (
      publisher_profile_id,
      provider,
      provider_account_id,
      stripe_account_id,
      status,
      updated_at
    )
    values (
      ${publisherProfileId},
      'stripe_connect',
      ${account.id},
      ${account.id},
      ${account.payouts_enabled === true ? "verified" : "verification_required"},
      now()
    )
    on conflict (provider, provider_account_id) do update set
      stripe_account_id = excluded.stripe_account_id,
      status = excluded.status,
      updated_at = now()
  `;
}

async function applyStripeEvent(sql: Sql, event: StripeWebhookEvent) {
  const object = event.data?.object ?? {};

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await upsertCheckoutSessionFromStripeObject(sql, object);
    await upsertSubscriptionFromCheckout(sql, object);
    return;
  }

  if (event.type.startsWith("customer.subscription.")) {
    await upsertStripeSubscription(sql, object);
    return;
  }

  if (event.type.startsWith("payment_intent.")) {
    await upsertPaymentIntent(sql, object);
    return;
  }

  if (event.type.startsWith("charge.dispute.")) {
    await upsertStripeDispute(sql, object);
    return;
  }

  if (event.type.startsWith("refund.")) {
    await upsertStripeRefund(sql, object);
    return;
  }

  if (event.type === "account.updated") {
    await updateConnectAccountFromWebhook(sql, object);
  }
}

async function upsertCheckoutSessionFromStripeObject(
  sql: Sql,
  object: Record<string, unknown>,
) {
  const sessionId = stringValue(object.id);
  const metadata = metadataValue(object.metadata);
  const organizationId = optionalUuid(metadata.organizationId);

  if (!sessionId || !organizationId) {
    return;
  }

  await sql`
    insert into stripe_checkout_sessions (
      stripe_session_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      stripe_customer_id,
      mode,
      status,
      payment_status,
      amount_total_cents,
      currency,
      stripe_connected_account_id,
      application_fee_amount_cents,
      publisher_share_cents,
      metadata,
      updated_at
    )
    values (
      ${sessionId},
      ${organizationId},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${stringValue(object.customer)},
      ${stringValue(object.mode) || "payment"},
      ${stringValue(object.status) || "completed"},
      ${stringValue(object.payment_status)},
      ${integerValue(object.amount_total)},
      ${stringValue(object.currency)},
      ${stringValue(metadata.stripeConnectedAccountId)},
      ${integerValue(metadata.applicationFeeAmountCents)},
      ${integerValue(metadata.publisherShareCents)},
      ${sql.json(metadata)},
      now()
    )
    on conflict (stripe_session_id) do update set
      status = excluded.status,
      payment_status = excluded.payment_status,
      amount_total_cents = excluded.amount_total_cents,
      currency = excluded.currency,
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_connected_account_id = excluded.stripe_connected_account_id,
      application_fee_amount_cents = excluded.application_fee_amount_cents,
      publisher_share_cents = excluded.publisher_share_cents,
      updated_at = now()
  `;
}

async function upsertSubscriptionFromCheckout(
  sql: Sql,
  object: Record<string, unknown>,
) {
  const subscriptionId = stringValue(object.subscription);
  const metadata = metadataValue(object.metadata);
  const projectId = optionalUuid(metadata.projectId);
  const skillId = optionalUuid(metadata.skillId);
  const priceId = optionalUuid(metadata.priceId);

  if (!subscriptionId || !projectId || !skillId || !priceId) {
    return;
  }

  await sql`
    insert into subscriptions (
      project_id,
      skill_id,
      price_id,
      status,
      stripe_subscription_id,
      stripe_customer_id,
      stripe_checkout_session_id,
      current_period_start,
      current_period_end,
      updated_at
    )
    values (
      ${projectId},
      ${skillId},
      ${priceId},
      'active',
      ${subscriptionId},
      ${stringValue(object.customer)},
      ${stringValue(object.id)},
      now(),
      now() + interval '1 month',
      now()
    )
    on conflict (project_id, skill_id) do update set
      price_id = excluded.price_id,
      status = excluded.status,
      stripe_subscription_id = excluded.stripe_subscription_id,
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_checkout_session_id = excluded.stripe_checkout_session_id,
      updated_at = now()
  `;
}

async function upsertStripeSubscription(sql: Sql, object: Record<string, unknown>) {
  const subscriptionId = stringValue(object.id);
  const metadata = metadataValue(object.metadata);

  if (!subscriptionId) {
    return;
  }

  await sql`
    insert into stripe_subscriptions (
      stripe_subscription_id,
      stripe_customer_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      metadata,
      updated_at
    )
    values (
      ${subscriptionId},
      ${stringValue(object.customer)},
      ${optionalUuid(metadata.organizationId)},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${stringValue(object.status) || "unknown"},
      ${timestampFromUnix(object.current_period_start)},
      ${timestampFromUnix(object.current_period_end)},
      ${object.cancel_at_period_end === true},
      ${sql.json(metadata)},
      now()
    )
    on conflict (stripe_subscription_id) do update set
      status = excluded.status,
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      metadata = excluded.metadata,
      updated_at = now()
  `;

  await upsertProjectSubscriptionFromStripeSubscription(sql, object, metadata);
}

async function upsertProjectSubscriptionFromStripeSubscription(
  sql: Sql,
  object: Record<string, unknown>,
  metadata: Record<string, string>,
) {
  const subscriptionId = stringValue(object.id);
  const projectId = optionalUuid(metadata.projectId);
  const skillId = optionalUuid(metadata.skillId);
  const priceId = optionalUuid(metadata.priceId);

  if (!subscriptionId || !projectId || !skillId || !priceId) {
    return;
  }

  const stripeStatus = stringValue(object.status) ?? "active";
  const status = mapStripeSubscriptionStatus(stripeStatus);

  await sql`
    insert into subscriptions (
      project_id,
      skill_id,
      price_id,
      status,
      stripe_subscription_id,
      stripe_customer_id,
      current_period_start,
      current_period_end,
      canceled_at,
      updated_at
    )
    values (
      ${projectId},
      ${skillId},
      ${priceId},
      ${status},
      ${subscriptionId},
      ${stringValue(object.customer)},
      ${timestampFromUnix(object.current_period_start)},
      ${timestampFromUnix(object.current_period_end)},
      ${status === "canceled" ? new Date().toISOString() : null},
      now()
    )
    on conflict (project_id, skill_id) do update set
      price_id = excluded.price_id,
      status = excluded.status,
      stripe_subscription_id = excluded.stripe_subscription_id,
      stripe_customer_id = excluded.stripe_customer_id,
      current_period_start = coalesce(excluded.current_period_start, subscriptions.current_period_start),
      current_period_end = coalesce(excluded.current_period_end, subscriptions.current_period_end),
      canceled_at = case when excluded.status = 'canceled' then coalesce(subscriptions.canceled_at, now()) else null end,
      updated_at = now()
  `;
}

async function upsertPaymentIntent(sql: Sql, object: Record<string, unknown>) {
  const paymentIntentId = stringValue(object.id);
  const metadata = metadataValue(object.metadata);

  if (!paymentIntentId) {
    return;
  }

  await sql`
    insert into stripe_payment_intents (
      stripe_payment_intent_id,
      stripe_customer_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      amount_cents,
      currency,
      status,
      metadata,
      updated_at
    )
    values (
      ${paymentIntentId},
      ${stringValue(object.customer)},
      ${optionalUuid(metadata.organizationId)},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${integerValue(object.amount)},
      ${stringValue(object.currency)},
      ${stringValue(object.status)},
      ${sql.json(metadata)},
      now()
    )
    on conflict (stripe_payment_intent_id) do update set
      status = excluded.status,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

async function upsertStripeRefund(sql: Sql, object: Record<string, unknown>) {
  const refundId = stringValue(object.id);

  if (!refundId) {
    return;
  }

  await sql`
    insert into stripe_refunds (
      stripe_refund_id,
      stripe_payment_intent_id,
      stripe_charge_id,
      amount_cents,
      currency,
      status,
      reason,
      metadata,
      updated_at
    )
    values (
      ${refundId},
      ${stringValue(object.payment_intent)},
      ${stringValue(object.charge)},
      ${integerValue(object.amount)},
      ${stringValue(object.currency)},
      ${stringValue(object.status)},
      ${stringValue(object.reason)},
      ${sql.json(metadataValue(object.metadata))},
      now()
    )
    on conflict (stripe_refund_id) do update set
      stripe_payment_intent_id = excluded.stripe_payment_intent_id,
      stripe_charge_id = excluded.stripe_charge_id,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      status = excluded.status,
      reason = excluded.reason,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

async function upsertStripeDispute(sql: Sql, object: Record<string, unknown>) {
  const disputeId = stringValue(object.id);

  if (!disputeId) {
    return;
  }

  await sql`
    insert into stripe_disputes (
      stripe_dispute_id,
      stripe_payment_intent_id,
      amount_cents,
      currency,
      status,
      reason,
      metadata,
      updated_at
    )
    values (
      ${disputeId},
      ${stringValue(object.payment_intent)},
      ${integerValue(object.amount)},
      ${stringValue(object.currency)},
      ${stringValue(object.status)},
      ${stringValue(object.reason)},
      ${sql.json(metadataValue(object.metadata))},
      now()
    )
    on conflict (stripe_dispute_id) do update set
      status = excluded.status,
      reason = excluded.reason,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

async function updateConnectAccountFromWebhook(
  sql: Sql,
  object: Record<string, unknown>,
) {
  const accountId = stringValue(object.id);

  if (!accountId) {
    return;
  }

  const requirements = object.requirements && typeof object.requirements === "object"
    ? (object.requirements as { currently_due?: unknown }).currently_due
    : undefined;
  const currentlyDue = Array.isArray(requirements) ? requirements.map(String) : [];

  await sql`
    update stripe_connect_accounts
    set
      details_submitted = ${object.details_submitted === true},
      charges_enabled = ${object.charges_enabled === true},
      payouts_enabled = ${object.payouts_enabled === true},
      requirements_currently_due = ${currentlyDue},
      updated_at = now()
    where stripe_account_id = ${accountId}
  `;
  await sql`
    update payout_accounts
    set
      status = ${object.payouts_enabled === true ? "verified" : "verification_required"},
      updated_at = now()
    where provider = 'stripe_connect'
      and provider_account_id = ${accountId}
  `;
}

async function verifyStripeWebhook(
  payload: string,
  signatureHeader: string | null,
  env?: StripeRuntimeEnv,
): Promise<StripeWebhookEvent> {
  const stripeConfig = await requireStripeConfig(env);
  const secret = stripeConfig.webhookSecret;

  if (!secret) {
    throw new Error("Stripe webhook secret is required for Stripe webhooks.");
  }

  if (!signatureHeader) {
    throw new Error("Stripe-Signature header is required.");
  }

  const signatures = parseStripeSignatureHeader(signatureHeader);
  const timestamp = signatures.t;
  const expectedSignatures = signatures.v1;

  if (!timestamp || expectedSignatures.length === 0) {
    throw new Error("Stripe webhook signature is invalid.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = await hmacSha256Hex(secret, signedPayload);

  if (!expectedSignatures.some((signature) => timingSafeEqualHex(signature, expected))) {
    throw new Error("Stripe webhook signature verification failed.");
  }

  const event = JSON.parse(payload) as StripeWebhookEvent;

  if (!event.id || !event.type) {
    throw new Error("Stripe webhook payload is missing event id or type.");
  }

  return event;
}

function parseStripeSignatureHeader(header: string) {
  return header.split(",").reduce(
    (result, part) => {
      const [key, value] = part.split("=", 2);
      if (key === "t") {
        result.t = value;
      } else if (key === "v1" && value) {
        result.v1.push(value);
      }
      return result;
    },
    { t: "", v1: [] as string[] },
  );
}

async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      hash: "SHA-256",
      name: "HMAC",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bytesToHex(new Uint8Array(signature));
}

function timingSafeEqualHex(first: string, second: string) {
  const a = hexToBytes(first);
  const b = hexToBytes(second);

  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }

  return difference === 0;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return new Uint8Array();
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  body: URLSearchParams | undefined,
  env?: StripeRuntimeEnv,
): Promise<T> {
  const stripeConfig = await requireStripeConfig(env);
  const secretKey = stripeConfig.secretKey;

  if (!secretKey) {
    throw new Error("Stripe secret key is required for Stripe operations.");
  }

  const response = await fetch(`https://api.stripe.com${path}`, {
    body,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    method,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Stripe API returned HTTP ${response.status}.`);
  }

  return payload as T;
}

async function requireStripeConfig(env?: StripeRuntimeEnv) {
  const config = await resolveStripeConfig(env, { includeSecrets: true });

  if (config.status !== "active") {
    throw new Error("Stripe commerce is not active. Configure Stripe in admin platform settings.");
  }

  return config;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for Stripe commerce operations.");
  }

  return sql;
}

function requireOrganizationId(value: string | null | undefined) {
  if (!value) {
    throw new Error("Organization-scoped authorization is required.");
  }

  return value;
}

function optionalUuid(value: unknown) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new Error("UUID value is invalid.");
  }

  return text;
}

function normalizeRequiredText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}

function normalizeQuantity(value: unknown) {
  const quantity = Math.trunc(Number(value ?? 1));

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("quantity must be between 1 and 99.");
  }

  return quantity;
}

function normalizeOptionalPositiveInteger(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Math.trunc(Number(value));

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return number;
}

function normalizeOptionalStripeId(value: unknown, label: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (!/^[a-z]+_[A-Za-z0-9_]+$/.test(text)) {
    throw new Error(`${label} must be a valid Stripe id.`);
  }

  return text;
}

function normalizeStripeRefundReason(value: unknown) {
  const reason = String(value ?? "").trim();

  if (!reason) {
    return null;
  }

  if (!["duplicate", "fraudulent", "requested_by_customer"].includes(reason)) {
    throw new Error("reason must be duplicate, fraudulent, or requested_by_customer.");
  }

  return reason;
}

function normalizeCheckoutUrl(value: unknown, fallback: string, label: string) {
  const raw = String(value ?? fallback).trim();

  try {
    const url = new URL(raw);

    if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      throw new Error(`${label} must use https.`);
    }

    return url.toString();
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must use https.")) {
      throw error;
    }

    throw new Error(`${label} must be a valid URL.`);
  }
}

function percentageFromBasisPoints(value: number) {
  return (value / 100).toFixed(2).replace(/\.?0+$/, "");
}

function defaultAppUrl(env: StripeRuntimeEnv | undefined, path: string) {
  const appUrl = configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  return new URL(path, appUrl).toString();
}

function metadataValue(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (result, [key, item]) => {
      result[key] = String(item ?? "");
      return result;
    },
    {},
  );
}

function metadataInputValue(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (result, [key, item]) => {
      if (/^[A-Za-z0-9_:-]{1,40}$/.test(key)) {
        result[key] = String(item ?? "").slice(0, 500);
      }
      return result;
    },
    {},
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function integerValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : null;
}

function timestampFromUnix(value: unknown) {
  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  return new Date(seconds * 1000).toISOString();
}

function mapStripeSubscriptionStatus(value: string): "active" | "canceled" | "past_due" | "trialing" {
  if (value === "trialing") {
    return "trialing";
  }

  if (value === "past_due" || value === "unpaid" || value === "incomplete" || value === "incomplete_expired") {
    return "past_due";
  }

  if (value === "canceled") {
    return "canceled";
  }

  return "active";
}

function configured(value: string | undefined, ...keys: string[]) {
  const direct = value?.trim();

  if (direct) {
    return direct;
  }

  for (const key of keys) {
    const fallback = getProcessEnv(key)?.trim();

    if (fallback) {
      return fallback;
    }
  }

  return null;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
