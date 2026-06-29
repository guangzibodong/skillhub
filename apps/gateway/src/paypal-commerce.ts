import { getSql } from "./registry.js";
import {
  resolvePayPalConfig,
  type PayPalEnvironment,
  type PlatformConfigEnv,
} from "./platform-config.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

export type PayPalRuntimeEnv = PlatformConfigEnv & {
  NEXT_PUBLIC_APP_URL?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_ENVIRONMENT?: string;
  PAYPAL_WEBHOOK_ID?: string;
  SKILLHUB_PAYPAL_CANCEL_URL?: string;
  SKILLHUB_PAYPAL_RETURN_URL?: string;
};

type CheckoutSessionInput = {
  cancelUrl?: unknown;
  priceId?: unknown;
  projectSlug?: unknown;
  quantity?: unknown;
  skillSlug?: unknown;
  successUrl?: unknown;
};

type PayPalPriceContext = {
  billingModel: "free" | "per_call" | "subscription";
  currency: string;
  displayName: string;
  paypalPlanId: string | null;
  priceId: string;
  projectId: string;
  projectOrganizationId: string;
  projectSlug: string;
  skillId: string;
  skillSlug: string;
  unitAmountCents: number;
};

type PayPalTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type PayPalAmount = {
  currency_code?: string;
  value?: string;
};

type PayPalCapture = {
  amount?: PayPalAmount;
  custom_id?: string;
  id: string;
  invoice_id?: string;
  status?: string;
};

type PayPalLink = {
  href?: string;
  rel?: string;
};

type PayPalOrder = {
  id: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: PayPalCapture[];
    };
    reference_id?: string;
  }>;
  status?: string;
};

type PayPalSubscription = {
  id: string;
  links?: PayPalLink[];
  status?: string;
};

type PayPalWebhookEvent = {
  event_type?: string;
  id?: string;
  resource?: Record<string, unknown>;
};

export async function createPayPalCheckoutSession(
  input: CheckoutSessionInput,
  organizationId: string | null | undefined,
  env?: PayPalRuntimeEnv,
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const priceId = optionalUuid(input.priceId);
  const projectSlug = normalizeRequiredText(input.projectSlug, "projectSlug", 120);
  const skillSlug = normalizeOptionalText(input.skillSlug, 120);
  const quantity = normalizeQuantity(input.quantity);
  const context = await getPayPalPriceContext(sql, priceId, projectSlug, skillSlug, scopedOrganizationId);

  if (context.billingModel === "free") {
    throw new Error("Free skills do not require PayPal checkout.");
  }

  const paypalConfig = await requirePayPalConfig(env);
  const returnUrl = normalizeCheckoutUrl(
    input.successUrl,
    paypalConfig.returnUrl ?? defaultAppUrl(env, "/checkout/paypal/return"),
    "successUrl",
  );
  const cancelUrl = normalizeCheckoutUrl(
    input.cancelUrl,
    paypalConfig.cancelUrl ?? defaultAppUrl(env, `/skills/${context.skillSlug}?checkout=paypal-canceled`),
    "cancelUrl",
  );
  const metadata = {
    organizationId: scopedOrganizationId,
    priceId: context.priceId,
    projectId: context.projectId,
    projectSlug: context.projectSlug,
    quantity: String(quantity),
    skillId: context.skillId,
    skillSlug: context.skillSlug,
  };

  if (context.billingModel === "subscription") {
    if (!context.paypalPlanId) {
      throw new Error("Skill price is not linked to a PayPal plan.");
    }

    const subscription = await paypalRequest<PayPalSubscription>(
      "POST",
      "/v1/billing/subscriptions",
      {
        application_context: {
          brand_name: "SkillHub",
          cancel_url: cancelUrl,
          return_url: returnUrl,
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
        },
        custom_id: JSON.stringify(metadata),
        plan_id: context.paypalPlanId,
        quantity: String(quantity),
      },
      env,
    );
    const approvalUrl = approvalLink(subscription.links);

    await sql`
      insert into paypal_subscriptions (
        paypal_subscription_id,
        paypal_plan_id,
        organization_id,
        project_id,
        skill_id,
        price_id,
        status,
        metadata,
        updated_at
      )
      values (
        ${subscription.id},
        ${context.paypalPlanId},
        ${scopedOrganizationId},
        ${context.projectId},
        ${context.skillId},
        ${context.priceId},
        ${subscription.status ?? "APPROVAL_PENDING"},
        ${sql.json(metadata)},
        now()
      )
      on conflict (paypal_subscription_id) do update set
        status = excluded.status,
        metadata = excluded.metadata,
        updated_at = now()
    `;

    return {
      checkoutSessionId: subscription.id,
      mode: "subscription",
      provider: "paypal",
      url: approvalUrl,
    };
  }

  const grossCents = context.unitAmountCents * quantity;
  const order = await paypalRequest<PayPalOrder>(
    "POST",
    "/v2/checkout/orders",
    {
      application_context: {
        brand_name: "SkillHub",
        cancel_url: cancelUrl,
        return_url: returnUrl,
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: context.currency.toUpperCase(),
            value: centsToDecimal(grossCents),
          },
          custom_id: JSON.stringify(metadata),
          description: context.displayName,
          reference_id: context.priceId,
        },
      ],
    },
    env,
  );
  const approvalUrl = approvalLink(order.links);

  await sql`
    insert into paypal_orders (
      paypal_order_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      status,
      amount_total_cents,
      currency,
      approval_url,
      metadata,
      updated_at
    )
    values (
      ${order.id},
      ${scopedOrganizationId},
      ${context.projectId},
      ${context.skillId},
      ${context.priceId},
      ${order.status ?? "CREATED"},
      ${grossCents},
      ${context.currency},
      ${approvalUrl},
      ${sql.json(metadata)},
      now()
    )
    on conflict (paypal_order_id) do update set
      status = excluded.status,
      approval_url = excluded.approval_url,
      updated_at = now()
  `;

  return {
    checkoutSessionId: order.id,
    mode: "payment",
    provider: "paypal",
    url: approvalUrl,
  };
}

export async function capturePayPalOrder(
  orderId: string,
  organizationId: string | null | undefined,
  env?: PayPalRuntimeEnv,
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const paypalOrderId = normalizeRequiredText(orderId, "orderId", 120);
  const localOrder = await getLocalPayPalOrder(sql, paypalOrderId, scopedOrganizationId);

  if (!localOrder) {
    throw new Error("PayPal order not found for this organization.");
  }

  const existingCapture = await getCompletedLocalPayPalCapture(sql, paypalOrderId, scopedOrganizationId);

  if (existingCapture) {
    return {
      amountCents: existingCapture.amountCents,
      captureId: existingCapture.captureId,
      currency: existingCapture.currency,
      orderId: paypalOrderId,
      provider: "paypal",
      status: existingCapture.status,
    };
  }

  const order = await paypalRequest<PayPalOrder>(
    "POST",
    `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {},
    env,
  );
  const capture = firstPayPalCapture(order);

  if (!capture?.id) {
    throw new Error("PayPal capture response did not include a capture id.");
  }

  const metadata = {
    ...localOrder.metadata,
    paypalOrderId,
    provider: "paypal",
  };
  const amountCents = amountCentsFromAmountObject(capture.amount) ?? localOrder.amountTotalCents;
  const currency = currencyFromAmountObject(capture.amount) ?? localOrder.currency;

  await sql.begin(async (tx: Sql) => {
    await tx`
      update paypal_orders
      set status = ${order.status ?? "COMPLETED"},
          updated_at = now()
      where paypal_order_id = ${paypalOrderId}
        and organization_id = ${scopedOrganizationId}
    `;

    await upsertPayPalCapture(tx, {
      ...capture,
      custom_id: capture.custom_id ?? JSON.stringify(localOrder.metadata),
      supplementary_data: {
        related_ids: {
          order_id: paypalOrderId,
        },
      },
    });

    await postPayPalCaptureLedger(tx, {
      amountCents,
      captureId: capture.id,
      currency,
      metadata,
      priceId: localOrder.priceId,
      projectId: localOrder.projectId,
      skillId: localOrder.skillId,
    });
  });

  return {
    amountCents,
    captureId: capture.id,
    currency,
    orderId: paypalOrderId,
    provider: "paypal",
    status: capture.status ?? order.status ?? "COMPLETED",
  };
}

export async function handlePayPalWebhook(
  payload: string,
  headers: Record<string, string | null | undefined>,
  env?: PayPalRuntimeEnv,
) {
  const sql = await requireSql();
  const event = await verifyPayPalWebhook(payload, headers, env);

  try {
    await sql.begin(async (tx: Sql) => {
      await tx`
        insert into paypal_webhook_events (
          paypal_event_id,
          event_type,
          payload,
          processing_status,
          processed_at
        )
        values (
          ${event.id},
          ${event.event_type},
          ${tx.json(event)},
          'processed',
          now()
        )
        on conflict (paypal_event_id) do nothing
      `;

      await applyPayPalEvent(tx, event);
    });

    return {
      eventId: event.id,
      received: true,
      type: event.event_type,
    };
  } catch (error) {
    await sql`
      insert into paypal_webhook_events (
        paypal_event_id,
        event_type,
        payload,
        processing_status,
        error_message,
        processed_at
      )
      values (
        ${event.id},
        ${event.event_type},
        ${sql.json(event)},
        'failed',
        ${error instanceof Error ? error.message.slice(0, 1000) : "Unable to process PayPal webhook."},
        now()
      )
      on conflict (paypal_event_id) do update set
        processing_status = 'failed',
        error_message = excluded.error_message,
        processed_at = now()
    `;

    throw error;
  }
}

async function applyPayPalEvent(sql: Sql, event: PayPalWebhookEvent) {
  const resource = event.resource ?? {};
  const eventType = event.event_type ?? "";

  if (eventType.startsWith("CHECKOUT.ORDER.")) {
    await upsertPayPalOrder(sql, resource);
    return;
  }

  if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.REFUNDED") {
    await upsertPayPalCapture(sql, resource);
    return;
  }

  if (eventType.startsWith("BILLING.SUBSCRIPTION.")) {
    await upsertPayPalSubscription(sql, resource);
    return;
  }

  if (eventType.startsWith("PAYMENT.CAPTURE.REFUND") || eventType.startsWith("PAYMENT.REFUND.")) {
    await upsertPayPalRefund(sql, resource);
  }
}

async function upsertPayPalOrder(sql: Sql, resource: Record<string, unknown>) {
  const orderId = stringValue(resource.id);

  if (!orderId) {
    return;
  }

  const metadata = metadataFromPayPalResource(resource);
  await sql`
    insert into paypal_orders (
      paypal_order_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      paypal_payer_id,
      status,
      amount_total_cents,
      currency,
      metadata,
      updated_at
    )
    values (
      ${orderId},
      ${optionalUuid(metadata.organizationId)},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${paypalPayerId(resource)},
      ${stringValue(resource.status) ?? "UNKNOWN"},
      ${amountCentsFromPayPal(resource)},
      ${currencyFromPayPal(resource)},
      ${sql.json(metadata)},
      now()
    )
    on conflict (paypal_order_id) do update set
      paypal_payer_id = excluded.paypal_payer_id,
      status = excluded.status,
      amount_total_cents = excluded.amount_total_cents,
      currency = excluded.currency,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

async function upsertPayPalCapture(sql: Sql, resource: Record<string, unknown>) {
  const captureId = stringValue(resource.id);

  if (!captureId) {
    return;
  }

  const orderId = relatedPayPalOrderId(resource);
  const orderMetadata = orderId ? await metadataFromLocalPayPalOrder(sql, orderId) : {};
  const metadata = {
    ...orderMetadata,
    ...metadataFromPayPalResource(resource),
  };
  await sql`
    insert into paypal_captures (
      paypal_capture_id,
      paypal_order_id,
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
      ${captureId},
      ${orderId},
      ${optionalUuid(metadata.organizationId)},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${amountCentsFromAmountObject(resource.amount)},
      ${currencyFromAmountObject(resource.amount)},
      ${stringValue(resource.status)},
      ${sql.json(metadata)},
      now()
    )
    on conflict (paypal_capture_id) do update set
      paypal_order_id = excluded.paypal_order_id,
      organization_id = coalesce(excluded.organization_id, paypal_captures.organization_id),
      project_id = coalesce(excluded.project_id, paypal_captures.project_id),
      skill_id = coalesce(excluded.skill_id, paypal_captures.skill_id),
      price_id = coalesce(excluded.price_id, paypal_captures.price_id),
      status = excluded.status,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      metadata = excluded.metadata,
      updated_at = now()
  `;

  if (stringValue(resource.status)?.toUpperCase() === "COMPLETED" && metadata.projectId && metadata.skillId && metadata.priceId) {
    await postPayPalCaptureLedger(sql, {
      amountCents: amountCentsFromAmountObject(resource.amount),
      captureId,
      currency: currencyFromAmountObject(resource.amount),
      metadata: {
        ...metadata,
        paypalOrderId: orderId ?? "",
        provider: "paypal",
      },
      priceId: metadata.priceId,
      projectId: metadata.projectId,
      skillId: metadata.skillId,
    });
  }
}

async function upsertPayPalSubscription(sql: Sql, resource: Record<string, unknown>) {
  const subscriptionId = stringValue(resource.id);

  if (!subscriptionId) {
    return;
  }

  const metadata = metadataFromPayPalResource(resource);
  const status = mapPayPalSubscriptionStatus(stringValue(resource.status));
  await sql`
    insert into paypal_subscriptions (
      paypal_subscription_id,
      paypal_plan_id,
      organization_id,
      project_id,
      skill_id,
      price_id,
      status,
      metadata,
      updated_at
    )
    values (
      ${subscriptionId},
      ${stringValue(resource.plan_id)},
      ${optionalUuid(metadata.organizationId)},
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${stringValue(resource.status) ?? "UNKNOWN"},
      ${sql.json(metadata)},
      now()
    )
    on conflict (paypal_subscription_id) do update set
      status = excluded.status,
      metadata = excluded.metadata,
      updated_at = now()
  `;

  if (!metadata.projectId || !metadata.skillId || !metadata.priceId) {
    return;
  }

  await sql`
    insert into subscriptions (
      project_id,
      skill_id,
      price_id,
      status,
      paypal_subscription_id,
      current_period_start,
      current_period_end,
      canceled_at,
      updated_at
    )
    values (
      ${optionalUuid(metadata.projectId)},
      ${optionalUuid(metadata.skillId)},
      ${optionalUuid(metadata.priceId)},
      ${status},
      ${subscriptionId},
      now(),
      now() + interval '1 month',
      ${status === "canceled" ? new Date().toISOString() : null},
      now()
    )
    on conflict (project_id, skill_id) do update set
      price_id = excluded.price_id,
      status = excluded.status,
      paypal_subscription_id = excluded.paypal_subscription_id,
      canceled_at = case when excluded.status = 'canceled' then coalesce(subscriptions.canceled_at, now()) else null end,
      updated_at = now()
  `;
}

async function upsertPayPalRefund(sql: Sql, resource: Record<string, unknown>) {
  const refundId = stringValue(resource.id);

  if (!refundId) {
    return;
  }

  await sql`
    insert into paypal_refunds (
      paypal_refund_id,
      paypal_capture_id,
      amount_cents,
      currency,
      status,
      reason,
      metadata,
      updated_at
    )
    values (
      ${refundId},
      ${stringValue(resource.invoice_id) ?? stringValue(resource.capture_id)},
      ${amountCentsFromAmountObject(resource.amount)},
      ${currencyFromAmountObject(resource.amount)},
      ${stringValue(resource.status)},
      ${stringValue(resource.reason)},
      ${sql.json(metadataFromPayPalResource(resource))},
      now()
    )
    on conflict (paypal_refund_id) do update set
      status = excluded.status,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

async function getPayPalPriceContext(
  sql: Sql,
  priceId: string | null,
  projectSlug: string,
  skillSlug: string | null,
  organizationId: string,
): Promise<PayPalPriceContext> {
  const rows = (await sql`
    select
      sp.id::text as "priceId",
      sp.billing_model as "billingModel",
      sp.currency,
      sp.unit_amount_cents as "unitAmountCents",
      sp.paypal_plan_id as "paypalPlanId",
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
  `) as PayPalPriceContext[];
  const context = rows[0];

  if (!context) {
    throw new Error("Active skill price or project not found.");
  }

  return context;
}

async function getLocalPayPalOrder(sql: Sql, paypalOrderId: string, organizationId: string) {
  const rows = (await sql`
    select
      paypal_order_id as "paypalOrderId",
      organization_id::text as "organizationId",
      project_id::text as "projectId",
      skill_id::text as "skillId",
      price_id::text as "priceId",
      amount_total_cents as "amountTotalCents",
      currency,
      metadata
    from paypal_orders
    where paypal_order_id = ${paypalOrderId}
      and organization_id = ${organizationId}
    limit 1
  `) as Array<{
    amountTotalCents: number | null;
    currency: string | null;
    metadata: Record<string, string>;
    organizationId: string;
    paypalOrderId: string;
    priceId: string | null;
    projectId: string | null;
    skillId: string | null;
  }>;

  return rows[0] ?? null;
}

async function getCompletedLocalPayPalCapture(sql: Sql, paypalOrderId: string, organizationId: string) {
  const rows = (await sql`
    select
      pc.paypal_capture_id as "captureId",
      pc.amount_cents as "amountCents",
      pc.currency,
      pc.status
    from paypal_captures pc
    join paypal_orders po on po.paypal_order_id = pc.paypal_order_id
    where pc.paypal_order_id = ${paypalOrderId}
      and po.organization_id = ${organizationId}
      and upper(coalesce(pc.status, '')) = 'COMPLETED'
    order by pc.updated_at desc
    limit 1
  `) as Array<{
    amountCents: number | null;
    captureId: string;
    currency: string | null;
    status: string | null;
  }>;

  return rows[0] ?? null;
}

async function metadataFromLocalPayPalOrder(sql: Sql, paypalOrderId: string): Promise<Record<string, string>> {
  const rows = (await sql`
    select metadata
    from paypal_orders
    where paypal_order_id = ${paypalOrderId}
    limit 1
  `) as Array<{ metadata: Record<string, unknown> }>;
  const metadata = rows[0]?.metadata ?? {};

  return Object.entries(metadata).reduce<Record<string, string>>((result, [key, value]) => {
    result[key] = String(value ?? "");
    return result;
  }, {});
}

async function postPayPalCaptureLedger(
  sql: Sql,
  input: {
    amountCents: number | null;
    captureId: string;
    currency: string | null;
    metadata: Record<string, string>;
    priceId: string | null;
    projectId: string | null;
    skillId: string | null;
  },
) {
  if (!input.amountCents || input.amountCents <= 0 || !input.projectId || !input.skillId) {
    return;
  }

  const publisher = await getPublisherForSkill(sql, input.skillId);
  const commissionRule = await getActiveCommissionRule(sql);
  const platformFeeCents = Math.floor((input.amountCents * commissionRule.platformFeeBps) / 10000);
  const publisherShareCents = Math.max(input.amountCents - platformFeeCents, 0);
  const sourceReference = `paypal:capture:${input.captureId}`;

  const transactionRows = (await sql`
    insert into transactions (
      project_id,
      skill_id,
      price_id,
      source_type,
      source_reference,
      amount_cents,
      currency,
      status
    )
    values (
      ${input.projectId},
      ${input.skillId},
      ${input.priceId},
      'usage',
      ${sourceReference},
      ${input.amountCents},
      ${input.currency ?? "usd"},
      'posted'
    )
    on conflict do nothing
    returning id::text
  `) as Array<{ id: string }>;

  if (!transactionRows[0]) {
    return;
  }

  const splitRows = (await sql`
    insert into transaction_splits (
      transaction_id,
      commission_rule_id,
      publisher_profile_id,
      platform_fee_cents,
      publisher_share_cents,
      processing_fee_cents
    )
    values (
      ${transactionRows[0].id},
      ${commissionRule.id},
      ${publisher.id},
      ${platformFeeCents},
      ${publisherShareCents},
      0
    )
    returning id::text
  `) as Array<{ id: string }>;

  await sql`
    insert into publisher_balances (
      publisher_profile_id,
      transaction_split_id,
      amount_cents,
      currency,
      state,
      available_at
    )
    values (
      ${publisher.id},
      ${splitRows[0].id},
      ${publisherShareCents},
      ${input.currency ?? "usd"},
      'pending',
      now() + (14::int * interval '1 day')
    )
    on conflict do nothing
  `;
}

async function getPublisherForSkill(sql: Sql, skillId: string) {
  const rows = (await sql`
    select pp.id::text
    from skills s
    join publisher_profiles pp on pp.organization_id = s.organization_id
    where s.id = ${skillId}
      and pp.status = 'active'
    order by pp.created_at asc
    limit 1
  `) as Array<{ id: string }>;

  if (!rows[0]) {
    throw new Error("Active publisher profile is required before posting PayPal ledger entries.");
  }

  return rows[0];
}

async function getActiveCommissionRule(sql: Sql) {
  const existing = (await sql`
    select id::text, platform_fee_bps as "platformFeeBps"
    from commission_rules
    where starts_at <= now()
      and (ends_at is null or ends_at > now())
    order by starts_at desc
    limit 1
  `) as Array<{ id: string; platformFeeBps: number }>;

  if (existing[0]) {
    return existing[0];
  }

  const rows = (await sql`
    insert into commission_rules (
      name,
      platform_fee_bps,
      publisher_share_bps
    )
    values (
      'Default 20/80 split',
      2000,
      8000
    )
    returning id::text, platform_fee_bps as "platformFeeBps"
  `) as Array<{ id: string; platformFeeBps: number }>;

  return rows[0];
}

async function verifyPayPalWebhook(
  payload: string,
  headers: Record<string, string | null | undefined>,
  env?: PayPalRuntimeEnv,
): Promise<PayPalWebhookEvent> {
  const config = await requirePayPalConfig(env);
  const transmissionId = headers["paypal-transmission-id"];
  const transmissionTime = headers["paypal-transmission-time"];
  const certUrl = headers["paypal-cert-url"];
  const authAlgo = headers["paypal-auth-algo"];
  const transmissionSig = headers["paypal-transmission-sig"];

  if (!config.webhookId) {
    throw new Error("PayPal webhook id is required for PayPal webhooks.");
  }

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    throw new Error("PayPal webhook signature headers are required.");
  }

  const event = JSON.parse(payload) as PayPalWebhookEvent;
  const verification = await paypalRequest<{ verification_status?: string }>(
    "POST",
    "/v1/notifications/verify-webhook-signature",
    {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_event: event,
      webhook_id: config.webhookId,
    },
    env,
  );

  if (verification.verification_status !== "SUCCESS") {
    throw new Error("PayPal webhook signature verification failed.");
  }

  if (!event.id || !event.event_type) {
    throw new Error("PayPal webhook payload is missing event id or event_type.");
  }

  return event;
}

async function paypalRequest<T>(
  method: "GET" | "POST",
  path: string,
  body: Record<string, unknown> | undefined,
  env?: PayPalRuntimeEnv,
): Promise<T> {
  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(`${paypalApiBaseUrl((await requirePayPalConfig(env)).environment)}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    method,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    details?: Array<{ description?: string; issue?: string }>;
    message?: string;
    name?: string;
  };

  if (!response.ok) {
    throw new Error(payload.details?.[0]?.description ?? payload.message ?? payload.name ?? `PayPal API returned HTTP ${response.status}.`);
  }

  return payload as T;
}

async function getPayPalAccessToken(env?: PayPalRuntimeEnv) {
  const config = await requirePayPalConfig(env);

  if (!config.clientId || !config.clientSecret) {
    throw new Error("PayPal client id and secret are required for PayPal operations.");
  }

  const response = await fetch(`${paypalApiBaseUrl(config.environment)}/v1/oauth2/token`, {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${bytesToBase64(new TextEncoder().encode(`${config.clientId}:${config.clientSecret}`))}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as PayPalTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? `PayPal OAuth returned HTTP ${response.status}.`);
  }

  return payload.access_token;
}

async function requirePayPalConfig(env?: PayPalRuntimeEnv) {
  const config = await resolvePayPalConfig(env, { includeSecrets: true });

  if (config.status !== "active") {
    throw new Error("PayPal commerce is not active. Configure PayPal in admin platform settings.");
  }

  return config;
}

function paypalApiBaseUrl(environment: PayPalEnvironment) {
  return environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for PayPal commerce operations.");
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

function defaultAppUrl(env: PayPalRuntimeEnv | undefined, path: string) {
  const appUrl = configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  return new URL(path, appUrl).toString();
}

function configured(value: string | undefined | null, ...keys: string[]) {
  const direct = value?.trim();

  if (direct) {
    return direct;
  }

  for (const key of keys) {
    const fallback = typeof process === "undefined" ? undefined : process.env[key]?.trim();

    if (fallback) {
      return fallback;
    }
  }

  return null;
}

function approvalLink(links: PayPalLink[] | undefined) {
  return links?.find((link) => link.rel === "approve")?.href ?? null;
}

function firstPayPalCapture(order: PayPalOrder) {
  return order.purchase_units
    ?.flatMap((unit) => unit.payments?.captures ?? [])
    .find((capture) => capture.id);
}

function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

function amountCentsFromPayPal(resource: Record<string, unknown>) {
  const amount = resource.purchase_units && Array.isArray(resource.purchase_units)
    ? (resource.purchase_units[0] as Record<string, unknown> | undefined)?.amount
    : resource.amount;
  return amountCentsFromAmountObject(amount);
}

function currencyFromPayPal(resource: Record<string, unknown>) {
  const amount = resource.purchase_units && Array.isArray(resource.purchase_units)
    ? (resource.purchase_units[0] as Record<string, unknown> | undefined)?.amount
    : resource.amount;
  return currencyFromAmountObject(amount);
}

function amountCentsFromAmountObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = stringValue((value as Record<string, unknown>).value);
  const number = Number(raw);
  return Number.isFinite(number) ? Math.round(number * 100) : null;
}

function currencyFromAmountObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return stringValue((value as Record<string, unknown>).currency_code)?.toLowerCase() ?? null;
}

function paypalPayerId(resource: Record<string, unknown>) {
  if (!resource.payer || typeof resource.payer !== "object" || Array.isArray(resource.payer)) {
    return null;
  }

  return stringValue((resource.payer as Record<string, unknown>).payer_id);
}

function relatedPayPalOrderId(resource: Record<string, unknown>) {
  const supplementary = resource.supplementary_data;

  if (!supplementary || typeof supplementary !== "object" || Array.isArray(supplementary)) {
    return null;
  }

  const relatedIds = (supplementary as Record<string, unknown>).related_ids;

  if (!relatedIds || typeof relatedIds !== "object" || Array.isArray(relatedIds)) {
    return null;
  }

  return stringValue((relatedIds as Record<string, unknown>).order_id);
}

function metadataFromPayPalResource(resource: Record<string, unknown>): Record<string, string> {
  const direct = stringValue(resource.custom_id);
  const purchaseUnitCustomId = resource.purchase_units && Array.isArray(resource.purchase_units)
    ? stringValue((resource.purchase_units[0] as Record<string, unknown> | undefined)?.custom_id)
    : null;
  const value = direct ?? purchaseUnitCustomId;

  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.entries(parsed).reduce<Record<string, string>>((result, [key, item]) => {
      result[key] = String(item ?? "");
      return result;
    }, {});
  } catch {
    return {};
  }
}

function mapPayPalSubscriptionStatus(status: string | null) {
  const normalized = String(status ?? "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "active";
  }

  if (normalized === "SUSPENDED") {
    return "paused";
  }

  if (normalized === "CANCELLED" || normalized === "EXPIRED") {
    return "canceled";
  }

  return "trialing";
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
