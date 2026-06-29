import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

export type PlatformConfigEnv = {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  DATABASE_URL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV?: string;
  POSTHOG_KEY?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_ENVIRONMENT?: string;
  PAYPAL_WEBHOOK_ID?: string;
  RESEND_API_KEY?: string;
  SENTRY_DSN?: string;
  SESSION_SECRET?: string;
  SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET?: string;
  SKILLHUB_ANALYTICS_TIME_ZONE?: string;
  SKILLHUB_API_KEY_SALT?: string;
  SKILLHUB_AUTH_BASE_URL?: string;
  SKILLHUB_AUTH_CALLBACK_BASE_URL?: string;
  SKILLHUB_AUTH_COOKIE_DOMAIN?: string;
  SKILLHUB_CONFIG_ENCRYPTION_SECRET?: string;
  SKILLHUB_DISABLE_PUBLIC_SIGNUP?: string;
  SKILLHUB_EMAIL_FROM?: string;
  SKILLHUB_EMAIL_PROVIDER?: string;
  SKILLHUB_ENV?: string;
  SKILLHUB_GITHUB_CLIENT_ID?: string;
  SKILLHUB_GITHUB_CLIENT_SECRET?: string;
  SKILLHUB_GOOGLE_CLIENT_ID?: string;
  SKILLHUB_GOOGLE_CLIENT_SECRET?: string;
  SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS?: string;
  SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS?: string;
  SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK?: string;
  SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS?: string;
  SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS?: string;
  SKILLHUB_MIN_PAYOUT_CENTS?: string;
  SKILLHUB_OAUTH_STATE_SECRET?: string;
  SKILLHUB_PAYOUT_REVIEW_THRESHOLD_CENTS?: string;
  SKILLHUB_PAYPAL_CANCEL_URL?: string;
  SKILLHUB_PAYPAL_RETURN_URL?: string;
  SKILLHUB_R2_BUCKET?: string;
  SKILLHUB_SERVER_API_URL?: string;
  SKILLHUB_SMTP_HOST?: string;
  SKILLHUB_SMTP_PASSWORD?: string;
  SKILLHUB_SMTP_PORT?: string;
  SKILLHUB_SMTP_SECURE?: string;
  SKILLHUB_SMTP_USER?: string;
  SKILLHUB_STRIPE_CANCEL_URL?: string;
  SKILLHUB_STRIPE_REFRESH_URL?: string;
  SKILLHUB_STRIPE_RETURN_URL?: string;
  SKILLHUB_STRIPE_SUCCESS_URL?: string;
  SKILLHUB_WEBHOOK_MAX_ATTEMPTS?: string;
  SKILLHUB_WEBHOOK_TIMEOUT_MS?: string;
  STRIPE_CONNECT_CLIENT_ID?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VERCEL_ENV?: string;
};

export type OAuthProviderKey = "github" | "google";
export type EmailProviderKey = "resend" | "smtp" | "unconfigured";
export type ConfigSource = "database" | "environment" | "default" | "none";
export type ProviderStatus = "active" | "disabled";

export type ResolvedOAuthProviderConfig = {
  callbackBaseUrl: string | null;
  clientId: string | null;
  clientSecret: string | null;
  clientSecretConfigured: boolean;
  clientSecretLast4: string | null;
  provider: OAuthProviderKey;
  source: ConfigSource;
  status: ProviderStatus;
  updatedAt: string | null;
};

export type ResolvedEmailProviderConfig = {
  from: string | null;
  provider: EmailProviderKey;
  resendApiKey: string | null;
  resendApiKeyConfigured: boolean;
  resendApiKeyLast4: string | null;
  smtpHost: string | null;
  smtpPassword: string | null;
  smtpPasswordConfigured: boolean;
  smtpPasswordLast4: string | null;
  smtpPort: string | null;
  smtpSecure: string | null;
  smtpUser: string | null;
  source: ConfigSource;
  status: ProviderStatus;
  updatedAt: string | null;
};

export type ResolvedStripeConfig = {
  cancelUrl: string | null;
  connectClientId: string | null;
  connectClientIdConfigured: boolean;
  connectClientIdLast4: string | null;
  refreshUrl: string | null;
  returnUrl: string | null;
  secretKey: string | null;
  secretKeyConfigured: boolean;
  secretKeyLast4: string | null;
  source: ConfigSource;
  status: ProviderStatus;
  successUrl: string | null;
  updatedAt: string | null;
  webhookSecret: string | null;
  webhookSecretConfigured: boolean;
  webhookSecretLast4: string | null;
};

export type PayPalEnvironment = "live" | "sandbox";

export type ResolvedPayPalConfig = {
  cancelUrl: string | null;
  clientId: string | null;
  clientIdConfigured: boolean;
  clientIdLast4: string | null;
  clientSecret: string | null;
  clientSecretConfigured: boolean;
  clientSecretLast4: string | null;
  environment: PayPalEnvironment;
  returnUrl: string | null;
  source: ConfigSource;
  status: ProviderStatus;
  updatedAt: string | null;
  webhookId: string | null;
  webhookIdConfigured: boolean;
  webhookIdLast4: string | null;
};

export type RuntimeSettingValue = {
  source: ConfigSource;
  updatedAt: string | null;
};

export type ResolvedWebhookSettings = RuntimeSettingValue & {
  maxAttempts: number;
  timeoutMs: number;
};

export type ResolvedPayoutSettings = RuntimeSettingValue & {
  minPayoutCents: number;
  payoutReviewThresholdCents: number;
};

export type ResolvedLaunchSettings = RuntimeSettingValue & {
  activeProjects: number;
  activePublishers: number;
  publishedFeedback: number;
  successfulInvocations: number;
  verifiedSkills: number;
};

export type ResolvedRuntimeSettings = RuntimeSettingValue & {
  disablePublicSignup: boolean;
};

export type AdminOAuthProviderConfig = Omit<ResolvedOAuthProviderConfig, "clientSecret">;
export type AdminEmailProviderConfig = Omit<ResolvedEmailProviderConfig, "resendApiKey" | "smtpPassword">;
export type AdminStripeConfig = Omit<ResolvedStripeConfig, "connectClientId" | "secretKey" | "webhookSecret">;
export type AdminPayPalConfig = Omit<ResolvedPayPalConfig, "clientId" | "clientSecret" | "webhookId">;

export type AdminPlatformProviderConfig = {
  email: AdminEmailProviderConfig;
  oauth: AdminOAuthProviderConfig[];
};

export type PublicPaymentProviderStatus = {
  configured: boolean;
  environment: "live" | "sandbox" | "test" | "unknown";
  label: string;
  provider: "paypal" | "stripe";
  source: ConfigSource;
  status: ProviderStatus;
};

export type AdminPlatformConfig = AdminPlatformProviderConfig & {
  bootstrap: {
    appUrlConfigured: boolean;
    apiUrlConfigured: boolean;
    databaseConfigured: boolean;
    encryptionSecretConfigured: boolean;
    encryptionSecretSource: "agent_legacy" | "config" | "session_fallback" | "none";
    encryptionSecretValid: boolean;
    r2Configured: boolean;
    serverApiUrlConfigured: boolean;
    sessionSecretConfigured: boolean;
    stripeLiveModeHint: "live" | "test" | "unknown";
    supabaseConfigured: boolean;
  };
  launch: ResolvedLaunchSettings;
  payouts: ResolvedPayoutSettings;
  runtime: ResolvedRuntimeSettings;
  paypal: AdminPayPalConfig;
  stripe: AdminStripeConfig;
  webhooks: ResolvedWebhookSettings;
};

type EncryptedSecret = {
  ciphertext: string;
  iv: string;
  last4: string;
  tag: string;
};

type PlatformConfigRow = {
  config: Record<string, unknown>;
  secretCiphertext: string | null;
  secretIv: string | null;
  secretLast4: string | null;
  secretTag: string | null;
  status: ProviderStatus;
  updatedAt: string;
};

type RuntimeSettingRow = {
  updatedAt: string;
  value: Record<string, unknown>;
};

export async function getAdminPlatformProviderConfig(
  env?: PlatformConfigEnv,
): Promise<AdminPlatformProviderConfig> {
  const config = await getAdminPlatformConfig(env);
  return {
    email: config.email,
    oauth: config.oauth,
  };
}

export async function getAdminPlatformConfig(env?: PlatformConfigEnv): Promise<AdminPlatformConfig> {
  await assertPlatformConfigSchema();

  const [google, github, email, stripe, paypal, webhooks, payouts, launch, runtime] = await Promise.all([
    resolveOAuthProviderConfig("google", env, { includeSecret: false }),
    resolveOAuthProviderConfig("github", env, { includeSecret: false }),
    resolveEmailProviderConfig(env, { includeSecrets: false }),
    resolveStripeConfig(env, { includeSecrets: false }),
    resolvePayPalConfig(env, { includeSecrets: false }),
    resolveWebhookSettings(env),
    resolvePayoutSettings(env),
    resolveLaunchSettings(env),
    resolveRuntimeSettings(env),
  ]);

  return {
    bootstrap: bootstrapStatus(env, stripe),
    email: toAdminEmailConfig(email),
    launch,
    oauth: [toAdminOAuthConfig(google), toAdminOAuthConfig(github)],
    paypal: toAdminPayPalConfig(paypal),
    payouts,
    runtime,
    stripe: toAdminStripeConfig(stripe),
    webhooks,
  };
}

export async function getPublicAuthProviderReadiness(env?: PlatformConfigEnv) {
  const [google, github] = await Promise.all([
    resolveOAuthProviderConfig("google", env, { includeSecret: false }),
    resolveOAuthProviderConfig("github", env, { includeSecret: false }),
  ]);

  return { github, google };
}

export async function getPublicPaymentProviderStatuses(env?: PlatformConfigEnv) {
  const [stripe, paypal] = await Promise.all([
    resolveStripeConfig(env, { includeSecrets: false }),
    resolvePayPalConfig(env, { includeSecrets: false }),
  ]);

  return [
    {
      configured:
        stripe.secretKeyConfigured &&
        stripe.webhookSecretConfigured &&
        stripe.connectClientIdConfigured &&
        Boolean(stripe.successUrl && stripe.cancelUrl),
      environment:
        stripe.source === "none"
          ? "unknown"
          : bootstrapStatus(env, stripe).stripeLiveModeHint,
      label: "Stripe",
      provider: "stripe",
      source: stripe.source,
      status: stripe.status,
    },
    {
      configured:
        paypal.clientIdConfigured &&
        paypal.clientSecretConfigured &&
        paypal.webhookIdConfigured &&
        Boolean(paypal.returnUrl && paypal.cancelUrl),
      environment: paypal.environment,
      label: "PayPal",
      provider: "paypal",
      source: paypal.source,
      status: paypal.status,
    },
  ] satisfies PublicPaymentProviderStatus[];
}

export async function assertPlatformConfigSchema() {
  const sql = await requireSql();
  const rows = (await sql`
    select
      exists (
        select 1 from information_schema.tables
        where table_schema = 'public'
          and table_name = 'platform_provider_configs'
      ) as "providerConfigs",
      exists (
        select 1 from information_schema.tables
        where table_schema = 'public'
          and table_name = 'platform_runtime_settings'
      ) as "runtimeSettings"
  `) as Array<{ providerConfigs: boolean; runtimeSettings: boolean }>;

  if (!rows[0]?.providerConfigs || !rows[0]?.runtimeSettings) {
    throw new Error("Platform configuration database migration is required before editing platform settings.");
  }
}

export async function saveAdminOAuthProviderConfig(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
  env?: PlatformConfigEnv,
): Promise<AdminOAuthProviderConfig> {
  const sql = await requireSql();
  const provider = normalizeOAuthProvider(input.provider);
  const status = normalizeStatus(input.status);
  const callbackBaseUrl = normalizeNullableText(input.callbackBaseUrl, 300);
  const clientId = normalizeNullableText(input.clientId, 300);
  const clientSecret = normalizeNullableText(input.clientSecret, 2000);
  const existing = await readConfigRow(sql, "oauth", provider);
  const encryptedSecret = clientSecret
    ? await encryptSecret(clientSecret, env)
    : encryptedFromExisting(existing);

  if (status === "active" && (!callbackBaseUrl || !clientId || !encryptedSecret)) {
    throw new Error("Active OAuth providers require callbackBaseUrl, clientId, and clientSecret.");
  }

  await upsertConfigRow(sql, {
    actorUserId,
    config: {
      callbackBaseUrl,
      clientId,
    },
    entityKey: provider,
    encryptedSecret,
    providerType: "oauth",
    status,
  });

  return toAdminOAuthConfig(await resolveOAuthProviderConfig(provider, env, { includeSecret: false }));
}

export async function saveAdminEmailProviderConfig(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
  env?: PlatformConfigEnv,
): Promise<AdminEmailProviderConfig> {
  const sql = await requireSql();
  const provider = normalizeEmailProvider(input.provider);
  const status = normalizeStatus(input.status);
  const from = normalizeNullableText(input.from, 300);
  const resendApiKey = normalizeNullableText(input.resendApiKey, 2000);
  const smtpHost = normalizeNullableText(input.smtpHost, 300);
  const smtpUser = normalizeNullableText(input.smtpUser, 300);
  const smtpPassword = normalizeNullableText(input.smtpPassword, 2000);
  const smtpPort = normalizeSmtpPortText(input.smtpPort);
  const smtpSecure = normalizeSmtpSecureText(input.smtpSecure);
  const existingResend = await readConfigRow(sql, "email", "resend");
  const existingSmtp = await readConfigRow(sql, "email", "smtp");
  const encryptedResendKey = resendApiKey
    ? await encryptSecret(resendApiKey, env)
    : encryptedFromExisting(existingResend);
  const encryptedSmtpPassword = smtpPassword
    ? await encryptSecret(smtpPassword, env)
    : encryptedFromExisting(existingSmtp);

  if (status === "active" && provider === "resend" && (!from || !encryptedResendKey)) {
    throw new Error("Active Resend email requires from and resendApiKey.");
  }

  if (status === "active" && provider === "smtp" && (!from || !smtpHost || !smtpUser || !encryptedSmtpPassword)) {
    throw new Error("Active SMTP email requires from, smtpHost, smtpUser, and smtpPassword.");
  }

  await sql.begin(async (tx: Sql) => {
    if (provider === "resend") {
      await upsertConfigRow(tx, {
        actorUserId,
        config: { from },
        entityKey: "resend",
        encryptedSecret: encryptedResendKey,
        providerType: "email",
        status,
      });
      await setConfigStatus(tx, "email", "smtp", "disabled");
    } else if (provider === "smtp") {
      await upsertConfigRow(tx, {
        actorUserId,
        config: {
          from,
          smtpHost,
          smtpPort,
          smtpSecure,
          smtpUser,
        },
        entityKey: "smtp",
        encryptedSecret: encryptedSmtpPassword,
        providerType: "email",
        status,
      });
      await setConfigStatus(tx, "email", "resend", "disabled");
    } else {
      await setConfigStatus(tx, "email", "resend", "disabled");
      await setConfigStatus(tx, "email", "smtp", "disabled");
      await recordAudit(tx, actorUserId, "platform_provider.email.disabled", "platform_provider_config", "email", {
        provider: "unconfigured",
      });
    }
  });

  return toAdminEmailConfig(await resolveEmailProviderConfig(env, { includeSecrets: false }));
}

export async function saveAdminStripeConfig(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
  env?: PlatformConfigEnv,
): Promise<AdminStripeConfig> {
  const sql = await requireSql();
  const status = normalizeStatus(input.status);
  const existing = await readConfigRow(sql, "stripe", "commerce");
  const existingSecrets = stripeSecretsFromExisting(existing);
  const secretKey = normalizeNullableText(input.secretKey, 2000);
  const webhookSecret = normalizeNullableText(input.webhookSecret, 2000);
  const connectClientId = normalizeNullableText(input.connectClientId, 500);
  const secrets = {
    connectClientId: connectClientId ? await encryptSecret(connectClientId, env) : existingSecrets.connectClientId,
    secretKey: secretKey ? await encryptSecret(secretKey, env) : existingSecrets.secretKey,
    webhookSecret: webhookSecret ? await encryptSecret(webhookSecret, env) : existingSecrets.webhookSecret,
  };
  const config = {
    cancelUrl: normalizeNullableUrl(input.cancelUrl, "cancelUrl"),
    connectClientIdConfigured: Boolean(secrets.connectClientId),
    connectClientIdSecret: secretReference(secrets.connectClientId),
    refreshUrl: normalizeNullableUrl(input.refreshUrl, "refreshUrl"),
    returnUrl: normalizeNullableUrl(input.returnUrl, "returnUrl"),
    secretKeyConfigured: Boolean(secrets.secretKey),
    secretKeySecret: secretReference(secrets.secretKey),
    successUrl: normalizeNullableUrl(input.successUrl, "successUrl"),
    webhookSecretConfigured: Boolean(secrets.webhookSecret),
    webhookSecretSecret: secretReference(secrets.webhookSecret),
  };

  if (
    status === "active" &&
    (!config.successUrl || !config.cancelUrl || !config.returnUrl || !config.refreshUrl || !secrets.secretKey || !secrets.webhookSecret || !secrets.connectClientId)
  ) {
    throw new Error("Active Stripe commerce requires secretKey, webhookSecret, connectClientId, and all return URLs.");
  }

  await upsertConfigRow(sql, {
    actorUserId,
    config,
    entityKey: "commerce",
    encryptedSecret: secrets.secretKey,
    providerType: "stripe",
    status,
  });

  return toAdminStripeConfig(await resolveStripeConfig(env, { includeSecrets: false }));
}

export async function saveAdminPayPalConfig(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
  env?: PlatformConfigEnv,
): Promise<AdminPayPalConfig> {
  const sql = await requireSql();
  const status = normalizeStatus(input.status);
  const environment = normalizePayPalEnvironment(input.environment);
  const existing = await readConfigRow(sql, "paypal", "commerce");
  const existingSecrets = paypalSecretsFromExisting(existing);
  const clientId = normalizeNullableText(input.clientId, 500);
  const clientSecret = normalizeNullableText(input.clientSecret, 2000);
  const webhookId = normalizeNullableText(input.webhookId, 500);
  const secrets = {
    clientId: clientId ? await encryptSecret(clientId, env) : existingSecrets.clientId,
    clientSecret: clientSecret ? await encryptSecret(clientSecret, env) : existingSecrets.clientSecret,
    webhookId: webhookId ? await encryptSecret(webhookId, env) : existingSecrets.webhookId,
  };
  const config = {
    cancelUrl: normalizeNullableUrl(input.cancelUrl, "cancelUrl"),
    clientIdConfigured: Boolean(secrets.clientId),
    clientIdSecret: secretReference(secrets.clientId),
    environment,
    returnUrl: normalizeNullableUrl(input.returnUrl, "returnUrl"),
    webhookIdConfigured: Boolean(secrets.webhookId),
    webhookIdSecret: secretReference(secrets.webhookId),
  };

  if (status === "active" && (!secrets.clientId || !secrets.clientSecret || !secrets.webhookId || !config.returnUrl || !config.cancelUrl)) {
    throw new Error("Active PayPal commerce requires clientId, clientSecret, webhookId, returnUrl, and cancelUrl.");
  }

  await upsertConfigRow(sql, {
    actorUserId,
    config,
    entityKey: "commerce",
    encryptedSecret: secrets.clientSecret,
    providerType: "paypal",
    status,
  });

  return toAdminPayPalConfig(await resolvePayPalConfig(env, { includeSecrets: false }));
}

export async function saveAdminWebhookSettings(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
): Promise<ResolvedWebhookSettings> {
  const sql = await requireSql();
  await upsertRuntimeSetting(sql, {
    actorUserId,
    settingGroup: "webhooks",
    settingKey: "delivery",
    value: {
      maxAttempts: normalizeInteger(input.maxAttempts, "maxAttempts", 1, 20, 8),
      timeoutMs: normalizeInteger(input.timeoutMs, "timeoutMs", 1000, 30000, 8000),
    },
  });
  return resolveWebhookSettings();
}

export async function saveAdminPayoutSettings(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
): Promise<ResolvedPayoutSettings> {
  const sql = await requireSql();
  const minPayoutCents = normalizeInteger(input.minPayoutCents, "minPayoutCents", 0, 100000000, 5000);
  const payoutReviewThresholdCents = normalizeInteger(input.payoutReviewThresholdCents, "payoutReviewThresholdCents", 0, 1000000000, 100000);

  if (payoutReviewThresholdCents < minPayoutCents) {
    throw new Error("payoutReviewThresholdCents must be greater than or equal to minPayoutCents.");
  }

  await upsertRuntimeSetting(sql, {
    actorUserId,
    settingGroup: "payouts",
    settingKey: "thresholds",
    value: {
      minPayoutCents,
      payoutReviewThresholdCents,
    },
  });
  return resolvePayoutSettings();
}

export async function saveAdminLaunchSettings(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
): Promise<ResolvedLaunchSettings> {
  const sql = await requireSql();
  await upsertRuntimeSetting(sql, {
    actorUserId,
    settingGroup: "launch",
    settingKey: "thresholds",
    value: {
      activeProjects: normalizeInteger(input.activeProjects, "activeProjects", 0, 1000000, 3),
      activePublishers: normalizeInteger(input.activePublishers, "activePublishers", 0, 1000000, 2),
      publishedFeedback: normalizeInteger(input.publishedFeedback, "publishedFeedback", 0, 1000000, 5),
      successfulInvocations: normalizeInteger(input.successfulInvocations, "successfulInvocations", 0, 100000000, 20),
      verifiedSkills: normalizeInteger(input.verifiedSkills, "verifiedSkills", 0, 1000000, 5),
    },
  });
  return resolveLaunchSettings();
}

export async function saveAdminRuntimeSettings(
  input: Record<string, unknown>,
  actorUserId: string | null | undefined,
): Promise<ResolvedRuntimeSettings> {
  const sql = await requireSql();
  await upsertRuntimeSetting(sql, {
    actorUserId,
    settingGroup: "runtime",
    settingKey: "public_access",
    value: {
      disablePublicSignup: normalizeBoolean(input.disablePublicSignup),
    },
  });
  return resolveRuntimeSettings();
}

export async function resolveOAuthProviderConfig(
  provider: OAuthProviderKey,
  env?: PlatformConfigEnv,
  options: { includeSecret?: boolean } = {},
): Promise<ResolvedOAuthProviderConfig> {
  const sql = await getSql();
  const row = sql ? await readConfigRow(sql, "oauth", provider) : null;

  if (row?.status === "active") {
    const clientSecret = options.includeSecret ? await decryptRowSecret(row, env) : null;

    return {
      callbackBaseUrl: textConfig(row.config.callbackBaseUrl),
      clientId: textConfig(row.config.clientId),
      clientSecret,
      clientSecretConfigured: hasRowSecret(row),
      clientSecretLast4: row.secretLast4,
      provider,
      source: "database",
      status: row.status,
      updatedAt: row.updatedAt,
    };
  }

  if (row?.status === "disabled") {
    return {
      callbackBaseUrl: textConfig(row.config.callbackBaseUrl),
      clientId: textConfig(row.config.clientId),
      clientSecret: null,
      clientSecretConfigured: hasRowSecret(row),
      clientSecretLast4: row.secretLast4,
      provider,
      source: "database",
      status: "disabled",
      updatedAt: row.updatedAt,
    };
  }

  const callbackBaseUrl = configured(
    env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL ?? env?.NEXT_PUBLIC_API_URL,
    "SKILLHUB_AUTH_CALLBACK_BASE_URL",
    "SKILLHUB_AUTH_BASE_URL",
    "NEXT_PUBLIC_API_URL",
  );

  if (provider === "google") {
    const clientId = configured(env?.SKILLHUB_GOOGLE_CLIENT_ID ?? env?.GOOGLE_CLIENT_ID, "SKILLHUB_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID");
    const clientSecret = configured(env?.SKILLHUB_GOOGLE_CLIENT_SECRET ?? env?.GOOGLE_CLIENT_SECRET, "SKILLHUB_GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET");
    return {
      callbackBaseUrl,
      clientId,
      clientSecret: options.includeSecret ? clientSecret : null,
      clientSecretConfigured: Boolean(clientSecret),
      clientSecretLast4: clientSecret ? clientSecret.slice(-4) : null,
      provider,
      source: callbackBaseUrl || clientId || clientSecret ? "environment" : "none",
      status: callbackBaseUrl && clientId && clientSecret ? "active" : "disabled",
      updatedAt: null,
    };
  }

  const clientId = configured(env?.SKILLHUB_GITHUB_CLIENT_ID ?? env?.GITHUB_CLIENT_ID, "SKILLHUB_GITHUB_CLIENT_ID", "GITHUB_CLIENT_ID");
  const clientSecret = configured(env?.SKILLHUB_GITHUB_CLIENT_SECRET ?? env?.GITHUB_CLIENT_SECRET, "SKILLHUB_GITHUB_CLIENT_SECRET", "GITHUB_CLIENT_SECRET");
  return {
    callbackBaseUrl,
    clientId,
    clientSecret: options.includeSecret ? clientSecret : null,
    clientSecretConfigured: Boolean(clientSecret),
    clientSecretLast4: clientSecret ? clientSecret.slice(-4) : null,
    provider,
    source: callbackBaseUrl || clientId || clientSecret ? "environment" : "none",
    status: callbackBaseUrl && clientId && clientSecret ? "active" : "disabled",
    updatedAt: null,
  };
}

export async function resolveEmailProviderConfig(
  env?: PlatformConfigEnv,
  options: { includeSecrets?: boolean } = {},
): Promise<ResolvedEmailProviderConfig> {
  const sql = await getSql();
  const [resendRow, smtpRow] = sql
    ? await Promise.all([readConfigRow(sql, "email", "resend"), readConfigRow(sql, "email", "smtp")])
    : [null, null];
  const activeRow = resendRow?.status === "active" ? resendRow : smtpRow?.status === "active" ? smtpRow : null;

  if (activeRow) {
    const secret = options.includeSecrets ? await decryptRowSecret(activeRow, env) : null;

    if (activeRow === resendRow) {
      return {
        from: textConfig(activeRow.config.from),
        provider: "resend",
        resendApiKey: secret,
        resendApiKeyConfigured: hasRowSecret(activeRow),
        resendApiKeyLast4: activeRow.secretLast4,
        smtpHost: null,
        smtpPassword: null,
        smtpPasswordConfigured: false,
        smtpPasswordLast4: null,
        smtpPort: null,
        smtpSecure: null,
        smtpUser: null,
        source: "database",
        status: activeRow.status,
        updatedAt: activeRow.updatedAt,
      };
    }

    return {
      from: textConfig(activeRow.config.from),
      provider: "smtp",
      resendApiKey: null,
      resendApiKeyConfigured: false,
      resendApiKeyLast4: null,
      smtpHost: textConfig(activeRow.config.smtpHost),
      smtpPassword: secret,
      smtpPasswordConfigured: hasRowSecret(activeRow),
      smtpPasswordLast4: activeRow.secretLast4,
      smtpPort: textConfig(activeRow.config.smtpPort) ?? "465",
      smtpSecure: textConfig(activeRow.config.smtpSecure) ?? "true",
      smtpUser: textConfig(activeRow.config.smtpUser),
      source: "database",
      status: activeRow.status,
      updatedAt: activeRow.updatedAt,
    };
  }

  if (resendRow || smtpRow) {
    return {
      from: textConfig(resendRow?.config.from) ?? textConfig(smtpRow?.config.from),
      provider: "unconfigured",
      resendApiKey: null,
      resendApiKeyConfigured: hasRowSecret(resendRow),
      resendApiKeyLast4: resendRow?.secretLast4 ?? null,
      smtpHost: textConfig(smtpRow?.config.smtpHost),
      smtpPassword: null,
      smtpPasswordConfigured: hasRowSecret(smtpRow),
      smtpPasswordLast4: smtpRow?.secretLast4 ?? null,
      smtpPort: textConfig(smtpRow?.config.smtpPort) ?? "465",
      smtpSecure: textConfig(smtpRow?.config.smtpSecure) ?? "true",
      smtpUser: textConfig(smtpRow?.config.smtpUser),
      source: "database",
      status: "disabled",
      updatedAt: resendRow?.updatedAt ?? smtpRow?.updatedAt ?? null,
    };
  }

  const envProvider = configured(env?.SKILLHUB_EMAIL_PROVIDER, "SKILLHUB_EMAIL_PROVIDER")?.toLowerCase();

  if (envProvider === "resend") {
    const resendApiKey = configured(env?.RESEND_API_KEY, "RESEND_API_KEY");
    return {
      from: configured(env?.SKILLHUB_EMAIL_FROM, "SKILLHUB_EMAIL_FROM"),
      provider: "resend",
      resendApiKey: options.includeSecrets ? resendApiKey : null,
      resendApiKeyConfigured: Boolean(resendApiKey),
      resendApiKeyLast4: resendApiKey ? resendApiKey.slice(-4) : null,
      smtpHost: null,
      smtpPassword: null,
      smtpPasswordConfigured: false,
      smtpPasswordLast4: null,
      smtpPort: null,
      smtpSecure: null,
      smtpUser: null,
      source: "environment",
      status: resendApiKey && configured(env?.SKILLHUB_EMAIL_FROM, "SKILLHUB_EMAIL_FROM") ? "active" : "disabled",
      updatedAt: null,
    };
  }

  if (envProvider === "smtp") {
    const smtpPassword = configured(env?.SKILLHUB_SMTP_PASSWORD, "SKILLHUB_SMTP_PASSWORD");
    return {
      from: configured(env?.SKILLHUB_EMAIL_FROM, "SKILLHUB_EMAIL_FROM"),
      provider: "smtp",
      resendApiKey: null,
      resendApiKeyConfigured: false,
      resendApiKeyLast4: null,
      smtpHost: configured(env?.SKILLHUB_SMTP_HOST, "SKILLHUB_SMTP_HOST"),
      smtpPassword: options.includeSecrets ? smtpPassword : null,
      smtpPasswordConfigured: Boolean(smtpPassword),
      smtpPasswordLast4: smtpPassword ? smtpPassword.slice(-4) : null,
      smtpPort: configured(env?.SKILLHUB_SMTP_PORT, "SKILLHUB_SMTP_PORT") ?? "465",
      smtpSecure: configured(env?.SKILLHUB_SMTP_SECURE, "SKILLHUB_SMTP_SECURE") ?? "true",
      smtpUser: configured(env?.SKILLHUB_SMTP_USER, "SKILLHUB_SMTP_USER"),
      source: "environment",
      status:
        configured(env?.SKILLHUB_SMTP_HOST, "SKILLHUB_SMTP_HOST") &&
        configured(env?.SKILLHUB_SMTP_USER, "SKILLHUB_SMTP_USER") &&
        smtpPassword &&
        configured(env?.SKILLHUB_EMAIL_FROM, "SKILLHUB_EMAIL_FROM")
          ? "active"
          : "disabled",
      updatedAt: null,
    };
  }

  return {
    from: null,
    provider: "unconfigured",
    resendApiKey: null,
    resendApiKeyConfigured: false,
    resendApiKeyLast4: null,
    smtpHost: null,
    smtpPassword: null,
    smtpPasswordConfigured: false,
    smtpPasswordLast4: null,
    smtpPort: "465",
    smtpSecure: "true",
    smtpUser: null,
    source: "none",
    status: "disabled",
    updatedAt: null,
  };
}

export async function resolveStripeConfig(
  env?: PlatformConfigEnv,
  options: { includeSecrets?: boolean } = {},
): Promise<ResolvedStripeConfig> {
  const sql = await getSql();
  const row = sql ? await readConfigRow(sql, "stripe", "commerce") : null;

  if (row?.status === "active") {
    const secretKey = options.includeSecrets ? await decryptRowSecret(row, env) : null;
    const webhookSecret = options.includeSecrets ? await decryptSecretReference(row.config.webhookSecretSecret, env) : null;
    const connectClientId = options.includeSecrets ? await decryptSecretReference(row.config.connectClientIdSecret, env) : null;

    return {
      cancelUrl: textConfig(row.config.cancelUrl),
      connectClientId,
      connectClientIdConfigured: Boolean(row.config.connectClientIdConfigured),
      connectClientIdLast4: secretReferenceLast4(row.config.connectClientIdSecret),
      refreshUrl: textConfig(row.config.refreshUrl),
      returnUrl: textConfig(row.config.returnUrl),
      secretKey,
      secretKeyConfigured: hasRowSecret(row),
      secretKeyLast4: row.secretLast4,
      source: "database",
      status: row.status,
      successUrl: textConfig(row.config.successUrl),
      updatedAt: row.updatedAt,
      webhookSecret,
      webhookSecretConfigured: Boolean(row.config.webhookSecretConfigured),
      webhookSecretLast4: secretReferenceLast4(row.config.webhookSecretSecret),
    };
  }

  if (row?.status === "disabled") {
    return {
      cancelUrl: textConfig(row.config.cancelUrl),
      connectClientId: null,
      connectClientIdConfigured: Boolean(row.config.connectClientIdConfigured),
      connectClientIdLast4: secretReferenceLast4(row.config.connectClientIdSecret),
      refreshUrl: textConfig(row.config.refreshUrl),
      returnUrl: textConfig(row.config.returnUrl),
      secretKey: null,
      secretKeyConfigured: hasRowSecret(row),
      secretKeyLast4: row.secretLast4,
      source: "database",
      status: "disabled",
      successUrl: textConfig(row.config.successUrl),
      updatedAt: row.updatedAt,
      webhookSecret: null,
      webhookSecretConfigured: Boolean(row.config.webhookSecretConfigured),
      webhookSecretLast4: secretReferenceLast4(row.config.webhookSecretSecret),
    };
  }

  const secretKey = configured(env?.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
  const webhookSecret = configured(env?.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET");
  const connectClientId = configured(env?.STRIPE_CONNECT_CLIENT_ID, "STRIPE_CONNECT_CLIENT_ID");
  const successUrl = configured(env?.SKILLHUB_STRIPE_SUCCESS_URL, "SKILLHUB_STRIPE_SUCCESS_URL");
  const cancelUrl = configured(env?.SKILLHUB_STRIPE_CANCEL_URL, "SKILLHUB_STRIPE_CANCEL_URL");
  const returnUrl = configured(env?.SKILLHUB_STRIPE_RETURN_URL, "SKILLHUB_STRIPE_RETURN_URL");
  const refreshUrl = configured(env?.SKILLHUB_STRIPE_REFRESH_URL, "SKILLHUB_STRIPE_REFRESH_URL");

  return {
    cancelUrl,
    connectClientId: options.includeSecrets ? connectClientId : null,
    connectClientIdConfigured: Boolean(connectClientId),
    connectClientIdLast4: connectClientId ? connectClientId.slice(-4) : null,
    refreshUrl,
    returnUrl,
    secretKey: options.includeSecrets ? secretKey : null,
    secretKeyConfigured: Boolean(secretKey),
    secretKeyLast4: secretKey ? secretKey.slice(-4) : null,
    source: secretKey || webhookSecret || connectClientId || successUrl || cancelUrl || returnUrl || refreshUrl ? "environment" : "none",
    status: secretKey && webhookSecret && connectClientId && successUrl && cancelUrl && returnUrl && refreshUrl ? "active" : "disabled",
    successUrl,
    updatedAt: null,
    webhookSecret: options.includeSecrets ? webhookSecret : null,
    webhookSecretConfigured: Boolean(webhookSecret),
    webhookSecretLast4: webhookSecret ? webhookSecret.slice(-4) : null,
  };
}

export async function resolvePayPalConfig(
  env?: PlatformConfigEnv,
  options: { includeSecrets?: boolean } = {},
): Promise<ResolvedPayPalConfig> {
  const sql = await getSql();
  const row = sql ? await readConfigRow(sql, "paypal", "commerce") : null;

  if (row?.status === "active") {
    const clientSecret = options.includeSecrets ? await decryptRowSecret(row, env) : null;
    const clientId = options.includeSecrets ? await decryptSecretReference(row.config.clientIdSecret, env) : null;
    const webhookId = options.includeSecrets ? await decryptSecretReference(row.config.webhookIdSecret, env) : null;

    return {
      cancelUrl: textConfig(row.config.cancelUrl),
      clientId,
      clientIdConfigured: Boolean(row.config.clientIdConfigured),
      clientIdLast4: secretReferenceLast4(row.config.clientIdSecret),
      clientSecret,
      clientSecretConfigured: hasRowSecret(row),
      clientSecretLast4: row.secretLast4,
      environment: normalizePayPalEnvironment(row.config.environment),
      returnUrl: textConfig(row.config.returnUrl),
      source: "database",
      status: row.status,
      updatedAt: row.updatedAt,
      webhookId,
      webhookIdConfigured: Boolean(row.config.webhookIdConfigured),
      webhookIdLast4: secretReferenceLast4(row.config.webhookIdSecret),
    };
  }

  if (row?.status === "disabled") {
    return {
      cancelUrl: textConfig(row.config.cancelUrl),
      clientId: null,
      clientIdConfigured: Boolean(row.config.clientIdConfigured),
      clientIdLast4: secretReferenceLast4(row.config.clientIdSecret),
      clientSecret: null,
      clientSecretConfigured: hasRowSecret(row),
      clientSecretLast4: row.secretLast4,
      environment: normalizePayPalEnvironment(row.config.environment),
      returnUrl: textConfig(row.config.returnUrl),
      source: "database",
      status: "disabled",
      updatedAt: row.updatedAt,
      webhookId: null,
      webhookIdConfigured: Boolean(row.config.webhookIdConfigured),
      webhookIdLast4: secretReferenceLast4(row.config.webhookIdSecret),
    };
  }

  const clientId = configured(env?.PAYPAL_CLIENT_ID, "PAYPAL_CLIENT_ID");
  const clientSecret = configured(env?.PAYPAL_CLIENT_SECRET, "PAYPAL_CLIENT_SECRET");
  const webhookId = configured(env?.PAYPAL_WEBHOOK_ID, "PAYPAL_WEBHOOK_ID");
  const returnUrl = configured(env?.SKILLHUB_PAYPAL_RETURN_URL, "SKILLHUB_PAYPAL_RETURN_URL");
  const cancelUrl = configured(env?.SKILLHUB_PAYPAL_CANCEL_URL, "SKILLHUB_PAYPAL_CANCEL_URL");
  const environment = normalizePayPalEnvironment(configured(env?.PAYPAL_ENVIRONMENT, "PAYPAL_ENVIRONMENT"));

  return {
    cancelUrl,
    clientId: options.includeSecrets ? clientId : null,
    clientIdConfigured: Boolean(clientId),
    clientIdLast4: clientId ? clientId.slice(-4) : null,
    clientSecret: options.includeSecrets ? clientSecret : null,
    clientSecretConfigured: Boolean(clientSecret),
    clientSecretLast4: clientSecret ? clientSecret.slice(-4) : null,
    environment,
    returnUrl,
    source: clientId || clientSecret || webhookId || returnUrl || cancelUrl ? "environment" : "none",
    status: clientId && clientSecret && webhookId && returnUrl && cancelUrl ? "active" : "disabled",
    updatedAt: null,
    webhookId: options.includeSecrets ? webhookId : null,
    webhookIdConfigured: Boolean(webhookId),
    webhookIdLast4: webhookId ? webhookId.slice(-4) : null,
  };
}

export async function resolveWebhookSettings(env?: PlatformConfigEnv): Promise<ResolvedWebhookSettings> {
  const row = await readRuntimeSetting("webhooks", "delivery");
  if (row) {
    return {
      maxAttempts: normalizeInteger(row.value.maxAttempts, "maxAttempts", 1, 20, 8),
      source: "database",
      timeoutMs: normalizeInteger(row.value.timeoutMs, "timeoutMs", 1000, 30000, 8000),
      updatedAt: row.updatedAt,
    };
  }

  const envMaxAttempts = configured(env?.SKILLHUB_WEBHOOK_MAX_ATTEMPTS, "SKILLHUB_WEBHOOK_MAX_ATTEMPTS");
  const envTimeoutMs = configured(env?.SKILLHUB_WEBHOOK_TIMEOUT_MS, "SKILLHUB_WEBHOOK_TIMEOUT_MS");
  return {
    maxAttempts: normalizeInteger(envMaxAttempts, "maxAttempts", 1, 20, 8),
    source: envMaxAttempts || envTimeoutMs ? "environment" : "default",
    timeoutMs: normalizeInteger(envTimeoutMs, "timeoutMs", 1000, 30000, 8000),
    updatedAt: null,
  };
}

export async function resolvePayoutSettings(env?: PlatformConfigEnv): Promise<ResolvedPayoutSettings> {
  const row = await readRuntimeSetting("payouts", "thresholds");
  if (row) {
    const minPayoutCents = normalizeInteger(row.value.minPayoutCents, "minPayoutCents", 0, 100000000, 5000);
    return {
      minPayoutCents,
      payoutReviewThresholdCents: Math.max(
        normalizeInteger(row.value.payoutReviewThresholdCents, "payoutReviewThresholdCents", 0, 1000000000, 100000),
        minPayoutCents,
      ),
      source: "database",
      updatedAt: row.updatedAt,
    };
  }

  const envMin = configured(env?.SKILLHUB_MIN_PAYOUT_CENTS, "SKILLHUB_MIN_PAYOUT_CENTS");
  const envReview = configured(env?.SKILLHUB_PAYOUT_REVIEW_THRESHOLD_CENTS, "SKILLHUB_PAYOUT_REVIEW_THRESHOLD_CENTS");
  const minPayoutCents = normalizeInteger(envMin, "minPayoutCents", 0, 100000000, 5000);
  return {
    minPayoutCents,
    payoutReviewThresholdCents: Math.max(
      normalizeInteger(envReview, "payoutReviewThresholdCents", 0, 1000000000, 100000),
      minPayoutCents,
    ),
    source: envMin || envReview ? "environment" : "default",
    updatedAt: null,
  };
}

export async function resolveLaunchSettings(env?: PlatformConfigEnv): Promise<ResolvedLaunchSettings> {
  const row = await readRuntimeSetting("launch", "thresholds");
  if (row) {
    return {
      activeProjects: normalizeInteger(row.value.activeProjects, "activeProjects", 0, 1000000, 3),
      activePublishers: normalizeInteger(row.value.activePublishers, "activePublishers", 0, 1000000, 2),
      publishedFeedback: normalizeInteger(row.value.publishedFeedback, "publishedFeedback", 0, 1000000, 5),
      source: "database",
      successfulInvocations: normalizeInteger(row.value.successfulInvocations, "successfulInvocations", 0, 100000000, 20),
      updatedAt: row.updatedAt,
      verifiedSkills: normalizeInteger(row.value.verifiedSkills, "verifiedSkills", 0, 1000000, 5),
    };
  }

  const values = {
    activeProjects: configured(env?.SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS, "SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS"),
    activePublishers: configured(env?.SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS, "SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS"),
    publishedFeedback: configured(env?.SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK, "SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK"),
    successfulInvocations: configured(env?.SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS, "SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS"),
    verifiedSkills: configured(env?.SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS, "SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS"),
  };

  return {
    activeProjects: normalizeInteger(values.activeProjects, "activeProjects", 0, 1000000, 3),
    activePublishers: normalizeInteger(values.activePublishers, "activePublishers", 0, 1000000, 2),
    publishedFeedback: normalizeInteger(values.publishedFeedback, "publishedFeedback", 0, 1000000, 5),
    source: Object.values(values).some(Boolean) ? "environment" : "default",
    successfulInvocations: normalizeInteger(values.successfulInvocations, "successfulInvocations", 0, 100000000, 20),
    updatedAt: null,
    verifiedSkills: normalizeInteger(values.verifiedSkills, "verifiedSkills", 0, 1000000, 5),
  };
}

export async function resolveRuntimeSettings(env?: PlatformConfigEnv): Promise<ResolvedRuntimeSettings> {
  const row = await readRuntimeSetting("runtime", "public_access");
  if (row) {
    return {
      disablePublicSignup: normalizeBoolean(row.value.disablePublicSignup),
      source: "database",
      updatedAt: row.updatedAt,
    };
  }

  const value = configured(env?.SKILLHUB_DISABLE_PUBLIC_SIGNUP, "SKILLHUB_DISABLE_PUBLIC_SIGNUP");
  return {
    disablePublicSignup: truthy(value),
    source: value ? "environment" : "default",
    updatedAt: null,
  };
}

export async function testStripeConfig(env?: PlatformConfigEnv) {
  const config = await resolveStripeConfig(env, { includeSecrets: true });
  const secretKey = config.secretKey;

  if (config.status !== "active" || !secretKey) {
    throw new Error("Stripe commerce is not active or secretKey is missing.");
  }

  const response = await fetch("https://api.stripe.com/v1/account", {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    charges_enabled?: boolean;
    country?: string;
    error?: { message?: string };
    id?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Stripe API returned HTTP ${response.status}.`);
  }

  return {
    accountId: payload.id ?? null,
    chargesEnabled: payload.charges_enabled === true,
    country: payload.country ?? null,
    mode: secretKey.startsWith("sk_live_") ? "live" : "test",
  };
}

export async function testPayPalConfig(env?: PlatformConfigEnv) {
  const config = await resolvePayPalConfig(env, { includeSecrets: true });

  if (config.status !== "active" || !config.clientId || !config.clientSecret) {
    throw new Error("PayPal commerce is not active or credentials are missing.");
  }

  const response = await fetch(`${paypalApiBaseUrl(config.environment)}/v1/oauth2/token`, {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${bytesToBase64(new TextEncoder().encode(`${config.clientId}:${config.clientSecret}`))}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    app_id?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? `PayPal API returned HTTP ${response.status}.`);
  }

  return {
    appId: payload.app_id ?? null,
    environment: config.environment,
    tokenVerified: true,
  };
}

function paypalApiBaseUrl(environment: PayPalEnvironment) {
  return environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function upsertConfigRow(
  sql: Sql,
  input: {
    actorUserId: string | null | undefined;
    config: Record<string, unknown>;
    encryptedSecret: EncryptedSecret | null;
    entityKey: string;
    providerType: string;
    status: ProviderStatus;
  },
) {
  await sql`
    insert into platform_provider_configs (
      provider_type,
      provider_key,
      status,
      config,
      secret_ciphertext,
      secret_iv,
      secret_tag,
      secret_last4,
      created_by_user_id,
      updated_by_user_id,
      updated_at
    )
    values (
      ${input.providerType},
      ${input.entityKey},
      ${input.status},
      ${sql.json(input.config)},
      ${input.encryptedSecret?.ciphertext ?? null},
      ${input.encryptedSecret?.iv ?? null},
      ${input.encryptedSecret?.tag ?? null},
      ${input.encryptedSecret?.last4 ?? null},
      ${input.actorUserId ?? null},
      ${input.actorUserId ?? null},
      now()
    )
    on conflict (provider_type, provider_key) do update set
      status = excluded.status,
      config = excluded.config,
      secret_ciphertext = excluded.secret_ciphertext,
      secret_iv = excluded.secret_iv,
      secret_tag = excluded.secret_tag,
      secret_last4 = excluded.secret_last4,
      updated_by_user_id = excluded.updated_by_user_id,
      updated_at = now()
  `;

  await recordAudit(sql, input.actorUserId, `platform_provider.${input.providerType}.${input.entityKey}.saved`, "platform_provider_config", `${input.providerType}:${input.entityKey}`, {
    providerKey: input.entityKey,
    providerType: input.providerType,
    secretConfigured: Boolean(input.encryptedSecret),
    status: input.status,
  });
}

async function upsertRuntimeSetting(
  sql: Sql,
  input: {
    actorUserId: string | null | undefined;
    settingGroup: string;
    settingKey: string;
    value: Record<string, unknown>;
  },
) {
  await sql`
    insert into platform_runtime_settings (
      setting_group,
      setting_key,
      value,
      created_by_user_id,
      updated_by_user_id,
      updated_at
    )
    values (
      ${input.settingGroup},
      ${input.settingKey},
      ${sql.json(input.value)},
      ${input.actorUserId ?? null},
      ${input.actorUserId ?? null},
      now()
    )
    on conflict (setting_group, setting_key) do update set
      value = excluded.value,
      updated_by_user_id = excluded.updated_by_user_id,
      updated_at = now()
  `;

  await recordAudit(sql, input.actorUserId, `platform_setting.${input.settingGroup}.${input.settingKey}.saved`, "platform_runtime_setting", `${input.settingGroup}:${input.settingKey}`, {
    settingGroup: input.settingGroup,
    settingKey: input.settingKey,
    updatedKeys: Object.keys(input.value),
  });
}

async function setConfigStatus(sql: Sql, providerType: string, providerKey: string, status: ProviderStatus) {
  await sql`
    update platform_provider_configs
    set status = ${status},
        updated_at = now()
    where provider_type = ${providerType}
      and provider_key = ${providerKey}
  `;
}

async function readConfigRow(sql: Sql, providerType: string, providerKey: string): Promise<PlatformConfigRow | null> {
  try {
    const rows = (await sql`
      select
        config,
        secret_ciphertext as "secretCiphertext",
        secret_iv as "secretIv",
        secret_tag as "secretTag",
        secret_last4 as "secretLast4",
        status,
        updated_at as "updatedAt"
      from platform_provider_configs
      where provider_type = ${providerType}
        and provider_key = ${providerKey}
      limit 1
    `) as PlatformConfigRow[];

    return rows[0] ?? null;
  } catch (error) {
    if (isMissingPlatformConfigTable(error)) {
      return null;
    }

    throw error;
  }
}

async function readRuntimeSetting(settingGroup: string, settingKey: string): Promise<RuntimeSettingRow | null> {
  const sql = await getSql();

  if (!sql) {
    return null;
  }

  try {
    const rows = (await sql`
      select value, updated_at as "updatedAt"
      from platform_runtime_settings
      where setting_group = ${settingGroup}
        and setting_key = ${settingKey}
      limit 1
    `) as RuntimeSettingRow[];

    return rows[0] ?? null;
  } catch (error) {
    if (isMissingPlatformConfigTable(error)) {
      return null;
    }

    throw error;
  }
}

async function recordAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${actorUserId ?? null},
      ${action},
      ${entityType},
      ${entityId},
      'Platform configuration changed.',
      ${sql.json(metadata)}
    )
  `;
}

function toAdminOAuthConfig(config: ResolvedOAuthProviderConfig): AdminOAuthProviderConfig {
  return {
    callbackBaseUrl: config.callbackBaseUrl,
    clientId: config.clientId,
    clientSecretConfigured: config.clientSecretConfigured,
    clientSecretLast4: config.clientSecretLast4,
    provider: config.provider,
    source: config.source,
    status: config.status,
    updatedAt: config.updatedAt,
  };
}

function toAdminEmailConfig(config: ResolvedEmailProviderConfig): AdminEmailProviderConfig {
  return {
    from: config.from,
    provider: config.provider,
    resendApiKeyConfigured: config.resendApiKeyConfigured,
    resendApiKeyLast4: config.resendApiKeyLast4,
    smtpHost: config.smtpHost,
    smtpPasswordConfigured: config.smtpPasswordConfigured,
    smtpPasswordLast4: config.smtpPasswordLast4,
    smtpPort: config.smtpPort,
    smtpSecure: config.smtpSecure,
    smtpUser: config.smtpUser,
    source: config.source,
    status: config.status,
    updatedAt: config.updatedAt,
  };
}

function toAdminStripeConfig(config: ResolvedStripeConfig): AdminStripeConfig {
  return {
    cancelUrl: config.cancelUrl,
    connectClientIdConfigured: config.connectClientIdConfigured,
    connectClientIdLast4: config.connectClientIdLast4,
    refreshUrl: config.refreshUrl,
    returnUrl: config.returnUrl,
    secretKeyConfigured: config.secretKeyConfigured,
    secretKeyLast4: config.secretKeyLast4,
    source: config.source,
    status: config.status,
    successUrl: config.successUrl,
    updatedAt: config.updatedAt,
    webhookSecretConfigured: config.webhookSecretConfigured,
    webhookSecretLast4: config.webhookSecretLast4,
  };
}

function toAdminPayPalConfig(config: ResolvedPayPalConfig): AdminPayPalConfig {
  return {
    cancelUrl: config.cancelUrl,
    clientIdConfigured: config.clientIdConfigured,
    clientIdLast4: config.clientIdLast4,
    clientSecretConfigured: config.clientSecretConfigured,
    clientSecretLast4: config.clientSecretLast4,
    environment: config.environment,
    returnUrl: config.returnUrl,
    source: config.source,
    status: config.status,
    updatedAt: config.updatedAt,
    webhookIdConfigured: config.webhookIdConfigured,
    webhookIdLast4: config.webhookIdLast4,
  };
}

function encryptedFromExisting(row: PlatformConfigRow | null): EncryptedSecret | null {
  if (!row?.secretCiphertext || !row.secretIv || !row.secretTag || !row.secretLast4) {
    return null;
  }

  return {
    ciphertext: row.secretCiphertext,
    iv: row.secretIv,
    last4: row.secretLast4,
    tag: row.secretTag,
  };
}

function stripeSecretsFromExisting(row: PlatformConfigRow | null) {
  return {
    connectClientId: secretReferenceFromConfig(row?.config.connectClientIdSecret),
    secretKey: encryptedFromExisting(row),
    webhookSecret: secretReferenceFromConfig(row?.config.webhookSecretSecret),
  };
}

function paypalSecretsFromExisting(row: PlatformConfigRow | null) {
  return {
    clientId: secretReferenceFromConfig(row?.config.clientIdSecret),
    clientSecret: encryptedFromExisting(row),
    webhookId: secretReferenceFromConfig(row?.config.webhookIdSecret),
  };
}

function secretReference(secret: EncryptedSecret | null) {
  if (!secret) {
    return null;
  }

  return {
    ciphertext: secret.ciphertext,
    iv: secret.iv,
    last4: secret.last4,
    tag: secret.tag,
  };
}

function secretReferenceFromConfig(value: unknown): EncryptedSecret | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Partial<EncryptedSecret>;
  if (!record.ciphertext || !record.iv || !record.tag || !record.last4) {
    return null;
  }

  return {
    ciphertext: record.ciphertext,
    iv: record.iv,
    last4: record.last4,
    tag: record.tag,
  };
}

function secretReferenceLast4(value: unknown) {
  return secretReferenceFromConfig(value)?.last4 ?? null;
}

async function decryptSecretReference(value: unknown, env?: PlatformConfigEnv) {
  const secret = secretReferenceFromConfig(value);
  return secret ? decryptSecret(secret, env) : null;
}

function hasRowSecret(row: PlatformConfigRow | null | undefined) {
  return Boolean(row?.secretCiphertext && row.secretIv && row.secretTag);
}

async function decryptRowSecret(row: PlatformConfigRow, env?: PlatformConfigEnv) {
  const secret = encryptedFromExisting(row);
  return secret ? decryptSecret(secret, env) : null;
}

export async function encryptSecret(secret: string, env?: PlatformConfigEnv): Promise<EncryptedSecret> {
  const cryptoApi = requireCryptoApi();
  const iv = new Uint8Array(12);
  cryptoApi.getRandomValues(iv);
  const encoded = new TextEncoder().encode(secret);
  const encrypted = new Uint8Array(
    await cryptoApi.subtle.encrypt({ iv, name: "AES-GCM" }, await platformEncryptionKey(env), encoded),
  );
  const tagBytes = encrypted.slice(-16);
  const ciphertextBytes = encrypted.slice(0, -16);

  return {
    ciphertext: bytesToBase64(ciphertextBytes),
    iv: bytesToBase64(iv),
    last4: secret.slice(-4),
    tag: bytesToBase64(tagBytes),
  };
}

export async function decryptSecret(secret: EncryptedSecret, env?: PlatformConfigEnv) {
  const cryptoApi = requireCryptoApi();
  const ciphertext = base64ToBytes(secret.ciphertext);
  const tag = base64ToBytes(secret.tag);
  const iv = base64ToBytes(secret.iv);
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const decrypted = await cryptoApi.subtle.decrypt({ iv, name: "AES-GCM" }, await platformEncryptionKey(env), combined);
  return new TextDecoder().decode(decrypted);
}

let cachedEncryptionSecret: string | null = null;
let cachedEncryptionKey: CryptoKey | null = null;

async function platformEncryptionKey(env?: PlatformConfigEnv) {
  const secret = platformEncryptionSecret(env).value;

  if (!secret || secret.length < 32) {
    throw new Error("Platform configuration encryption secret is missing. Set SKILLHUB_CONFIG_ENCRYPTION_SECRET with at least 32 characters.");
  }

  if (cachedEncryptionKey && cachedEncryptionSecret === secret) {
    return cachedEncryptionKey;
  }

  const cryptoApi = requireCryptoApi();
  const digest = await cryptoApi.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  cachedEncryptionKey = await cryptoApi.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["decrypt", "encrypt"]);
  cachedEncryptionSecret = secret;
  return cachedEncryptionKey;
}

function platformEncryptionSecret(env?: PlatformConfigEnv): { source: AdminPlatformConfig["bootstrap"]["encryptionSecretSource"]; value: string | null } {
  const configSecret = configured(env?.SKILLHUB_CONFIG_ENCRYPTION_SECRET, "SKILLHUB_CONFIG_ENCRYPTION_SECRET");
  if (configSecret) {
    return { source: "config", value: configSecret };
  }

  const legacyAgentSecret = configured(env?.SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET, "SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET");
  if (legacyAgentSecret) {
    return { source: "agent_legacy", value: legacyAgentSecret };
  }

  const sessionSecret = configured(env?.SESSION_SECRET, "SESSION_SECRET");
  return sessionSecret ? { source: "session_fallback", value: sessionSecret } : { source: "none", value: null };
}

function requireCryptoApi(): Crypto {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto is required for platform provider secret encryption.");
  }

  return cryptoApi;
}

function normalizeOAuthProvider(value: unknown): OAuthProviderKey {
  const provider = String(value ?? "").trim().toLowerCase();

  if (provider === "google" || provider === "github") {
    return provider;
  }

  throw new Error("OAuth provider must be google or github.");
}

function normalizeEmailProvider(value: unknown): EmailProviderKey {
  const provider = String(value ?? "unconfigured").trim().toLowerCase();

  if (provider === "resend" || provider === "smtp" || provider === "unconfigured") {
    return provider;
  }

  throw new Error("Email provider must be resend, smtp, or unconfigured.");
}

function normalizePayPalEnvironment(value: unknown): PayPalEnvironment {
  const environment = String(value ?? "sandbox").trim().toLowerCase();

  if (environment === "live" || environment === "sandbox") {
    return environment;
  }

  throw new Error("PayPal environment must be sandbox or live.");
}

function normalizeStatus(value: unknown): ProviderStatus {
  const status = String(value ?? "active").trim().toLowerCase();

  if (status === "active" || status === "disabled") {
    return status;
  }

  throw new Error("Provider status must be active or disabled.");
}

function normalizeNullableText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (text.length > maxLength) {
    throw new Error(`Value must be ${maxLength} characters or fewer.`);
  }

  return text;
}

function normalizeNullableUrl(value: unknown, label: string) {
  const text = normalizeNullableText(value, 600);

  if (!text) {
    return null;
  }

  try {
    const url = new URL(text);
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

function normalizeSmtpPortText(value: unknown) {
  const text = normalizeNullableText(value ?? "465", 8) ?? "465";
  const port = Number(text);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP port must be between 1 and 65535.");
  }

  return String(port);
}

function normalizeSmtpSecureText(value: unknown) {
  return normalizeBoolean(value) ? "true" : "false";
}

function normalizeInteger(value: unknown, label: string, min: number, max: number, fallback: number) {
  const raw = value === null || value === undefined || value === "" ? fallback : value;
  const number = Math.trunc(Number(raw));

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }

  return number;
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value ?? "").trim().toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "on";
}

function textConfig(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function configured(value: string | undefined | null, ...keys: string[]) {
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

function bootstrapStatus(env: PlatformConfigEnv | undefined, stripe: ResolvedStripeConfig): AdminPlatformConfig["bootstrap"] {
  const encryption = platformEncryptionSecret(env);
  const encryptionSecret = encryption.value;
  const stripeSecretLast4 = stripe.secretKeyLast4 ?? "";
  return {
    appUrlConfigured: Boolean(configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL")),
    apiUrlConfigured: Boolean(configured(env?.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL")),
    databaseConfigured: Boolean(configured(env?.DATABASE_URL, "DATABASE_URL")),
    encryptionSecretConfigured: Boolean(encryptionSecret),
    encryptionSecretSource: encryption.source,
    encryptionSecretValid: Boolean(encryptionSecret && encryptionSecret.length >= 32),
    r2Configured: Boolean(configured(env?.SKILLHUB_R2_BUCKET, "SKILLHUB_R2_BUCKET")),
    serverApiUrlConfigured: Boolean(configured(env?.SKILLHUB_SERVER_API_URL, "SKILLHUB_SERVER_API_URL")),
    sessionSecretConfigured: Boolean(configured(env?.SESSION_SECRET, "SESSION_SECRET")),
    stripeLiveModeHint: stripeSecretLast4 && stripe.secretKeyConfigured
      ? "unknown"
      : "unknown",
    supabaseConfigured: Boolean(configured(env?.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")),
  };
}

function truthy(value: string | undefined | null) {
  return normalizeBoolean(value);
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

function base64ToBytes(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for platform configuration.");
  }

  return sql;
}

function isMissingPlatformConfigTable(error: unknown) {
  return error instanceof Error && /platform_provider_configs|platform_runtime_settings|does not exist/i.test(error.message);
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
