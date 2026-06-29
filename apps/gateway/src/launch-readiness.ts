import { getSql } from "./registry.js";
import {
  getPublicAuthProviderReadiness,
  resolveEmailProviderConfig,
  resolveLaunchSettings,
  resolveRuntimeSettings,
  resolveStripeConfig,
  resolveWebhookSettings,
  type ResolvedLaunchSettings,
  type ResolvedRuntimeSettings,
  type ResolvedStripeConfig,
  type ResolvedWebhookSettings,
} from "./platform-config.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

const expectedLatestMigrationFilename = "040_platform_provider_configs.sql";
const expectedLatestMigrationNumber = 40;

type LaunchReadinessEnv = {
  DATABASE_URL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NODE_ENV?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  RESEND_API_KEY?: string;
  SESSION_SECRET?: string;
  SKILLHUB_ADMIN_TOKEN?: string;
  SKILLHUB_API_KEY_SALT?: string;
  SKILLHUB_AUTH_BASE_URL?: string;
  SKILLHUB_AUTH_CALLBACK_BASE_URL?: string;
  SKILLHUB_AUTH_COOKIE_DOMAIN?: string;
  SKILLHUB_DISABLE_PUBLIC_SIGNUP?: string;
  SKILLHUB_CONFIG_ENCRYPTION_SECRET?: string;
  SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET?: string;
  SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
  SKILLHUB_EMAIL_AUTH_SECRET?: string;
  SKILLHUB_EMAIL_FROM?: string;
  SKILLHUB_EMAIL_PROVIDER?: string;
  SKILLHUB_SMTP_HOST?: string;
  SKILLHUB_SMTP_PASSWORD?: string;
  SKILLHUB_SMTP_PORT?: string;
  SKILLHUB_SMTP_SECURE?: string;
  SKILLHUB_SMTP_USER?: string;
  SKILLHUB_ENABLE_DEMO_FALLBACK?: string;
  SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN?: string;
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
  SKILLHUB_OAUTH_STATE_SECRET?: string;
  SKILLHUB_STRIPE_CANCEL_URL?: string;
  SKILLHUB_STRIPE_REFRESH_URL?: string;
  SKILLHUB_STRIPE_RETURN_URL?: string;
  SKILLHUB_STRIPE_SUCCESS_URL?: string;
  SKILLHUB_WEBHOOK_MAX_ATTEMPTS?: string;
  SKILLHUB_WEBHOOK_TIMEOUT_MS?: string;
  STRIPE_CONNECT_CLIENT_ID?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  VERCEL_ENV?: string;
};

export type LaunchReadinessStatus = "blocker" | "deferred" | "ready" | "warning";

export type LaunchReadinessItem = {
  action: string;
  description: string;
  detail: string;
  key: string;
  label: string;
  status: LaunchReadinessStatus;
};

export type LaunchReadinessSection = {
  items: LaunchReadinessItem[];
  key: string;
  status: LaunchReadinessStatus;
  title: string;
};

export type LaunchReadinessReport = {
  checkedAt: string;
  environment: {
    appUrl: string | null;
    callbackBaseUrl: string | null;
    isProductionLike: boolean;
    runtime: string;
  };
  sections: LaunchReadinessSection[];
  summary: {
    blocker: number;
    deferred: number;
    ready: number;
    status: LaunchReadinessStatus;
    warning: number;
  };
};

type DatabaseReadiness = {
  activeCommissionRules: number | null;
  activeNotificationTemplates: number | null;
  activeProjectCount: number | null;
  activePublisherCount: number | null;
  agentKeyEncryptionColumns: boolean;
  agentTables: boolean;
  buyerRequestDeliveryColumns: boolean;
  databaseConnected: boolean;
  emailChallenges: boolean;
  migrationHistoryCount: number | null;
  migrationLatestAppliedAt: string | null;
  migrationLatestFilename: string | null;
  migrationLatestNumber: number | null;
  missingActiveNotificationTemplates: string[] | null;
  notificationDeliveryColumns: boolean;
  operationsTables: boolean;
  manualPayoutAccountColumns: boolean;
  passwordCredentials: boolean;
  payoutExplainabilityColumns: boolean;
  payoutOnboardingSessions: boolean;
  payoutTables: boolean;
  publishedFeedbackCount: number | null;
  publisherFeedbackResponseColumns: boolean;
  publisherTermsAcceptanceColumns: boolean;
  runtimeCheckRemediationColumns: boolean;
  schemaMigrations: boolean;
  successfulInvocationCount: number | null;
  stripeCheckoutTables: boolean;
  stripeCheckoutDestinationColumns: boolean;
  stripeConnectTables: boolean;
  stripeSkillPriceColumns: boolean;
  stripeSubscriptionColumns: boolean;
  stripeWebhookEvents: boolean;
  userAuthIdentities: boolean;
  verifiedSkillCount: number | null;
  webhookDeliveryWorker: boolean;
};

const requiredActiveNotificationTemplates = [
  ["auth.email.code.requested", "email", "en"],
  ["auth.email.code.requested", "email", "zh"],
  ["auth.email.login.verified", "in_app", "en"],
  ["auth.email.login.verified", "in_app", "zh"],
  ["auth.email.signup.verified", "in_app", "en"],
  ["auth.email.signup.verified", "in_app", "zh"],
  ["account.security.identity_disconnected", "in_app", "en"],
  ["account.security.identity_disconnected", "in_app", "zh"],
  ["account.security.session_revoked", "in_app", "en"],
  ["account.security.session_revoked", "in_app", "zh"],
  ["skill.review.submitted", "in_app", "en"],
  ["skill.review.submitted", "in_app", "zh"],
  ["skill.review.approved", "in_app", "en"],
  ["skill.review.approved", "in_app", "zh"],
  ["skill.review.approved", "email", "en"],
  ["skill.review.approved", "email", "zh"],
  ["skill.review.rejected", "in_app", "en"],
  ["skill.review.rejected", "in_app", "zh"],
  ["skill.review.blocked", "in_app", "en"],
  ["skill.review.blocked", "in_app", "zh"],
  ["runtime.incident.opened", "in_app", "en"],
  ["runtime.incident.opened", "in_app", "zh"],
  ["runtime.incident.opened", "email", "en"],
  ["runtime.incident.opened", "email", "zh"],
  ["runtime.incident.opened", "webhook", "en"],
  ["billing.usage_posted", "in_app", "en"],
  ["billing.usage_posted", "in_app", "zh"],
  ["billing.subscription_posted", "in_app", "en"],
  ["billing.subscription_posted", "in_app", "zh"],
  ["billing.subscription_posted", "webhook", "en"],
  ["billing.subscription_period.renewed", "in_app", "en"],
  ["billing.subscription_period.renewed", "in_app", "zh"],
  ["billing.subscription_period.renewed", "webhook", "en"],
  ["payout.requested", "in_app", "en"],
  ["payout.requested", "in_app", "zh"],
  ["payout.review", "in_app", "en"],
  ["payout.review", "in_app", "zh"],
  ["payout.approve", "in_app", "en"],
  ["payout.approve", "in_app", "zh"],
  ["payout.mark_paid", "in_app", "en"],
  ["payout.mark_paid", "in_app", "zh"],
  ["payout.fail", "in_app", "en"],
  ["payout.fail", "in_app", "zh"],
  ["payout.block", "in_app", "en"],
  ["payout.block", "in_app", "zh"],
  ["buyer_request.created", "in_app", "en"],
  ["buyer_request.created", "in_app", "zh"],
  ["buyer_request.submitted", "in_app", "en"],
  ["buyer_request.submitted", "in_app", "zh"],
  ["skill.feedback.created", "in_app", "en"],
  ["skill.feedback.created", "in_app", "zh"],
  ["skill.feedback.published", "in_app", "en"],
  ["skill.feedback.published", "in_app", "zh"],
  ["skill.feedback.publisher_response", "in_app", "en"],
  ["skill.feedback.publisher_response", "in_app", "zh"],
  ["trust.abuse_report.created", "in_app", "en"],
  ["trust.abuse_report.created", "in_app", "zh"],
  ["marketplace.curation.updated", "in_app", "en"],
  ["marketplace.curation.updated", "in_app", "zh"],
  ["marketplace.curation.appeal_created", "in_app", "en"],
  ["marketplace.curation.appeal_created", "in_app", "zh"],
  ["marketplace.curation.appeal_approved", "in_app", "en"],
  ["marketplace.curation.appeal_approved", "in_app", "zh"],
  ["platform.notification_template.updated", "in_app", "en"],
  ["platform.notification_template.updated", "in_app", "zh"],
  ["platform.notification_delivery.processed", "in_app", "en"],
  ["platform.notification_delivery.processed", "in_app", "zh"],
  ["platform.webhook_delivery.processed", "in_app", "en"],
  ["platform.webhook_delivery.processed", "in_app", "zh"]
] as const;

export async function getLaunchReadiness(env?: LaunchReadinessEnv): Promise<LaunchReadinessReport> {
  const database = await getDatabaseReadiness();
  const [
    authReadiness,
    emailProvider,
    launchSettings,
    runtimeSettings,
    stripeConfig,
    webhookSettings,
  ] = await Promise.all([
    getPublicAuthProviderReadiness(env),
    resolveEmailProviderConfig(env, { includeSecrets: false }),
    resolveLaunchSettings(env),
    resolveRuntimeSettings(env),
    resolveStripeConfig(env, { includeSecrets: false }),
    resolveWebhookSettings(env),
  ]);
  const sections = [
    buildIdentitySection(env, authReadiness),
    buildEmailSection(env, database, emailProvider),
    buildWebhookSection(database, webhookSettings),
    buildMarketplaceOperationsSection(env, database),
    buildAgentSection(env, database),
    buildLaunchCredibilitySection(database, launchSettings),
    buildCommercialSection(database, stripeConfig),
    buildProductionGuardrailSection(env, database, runtimeSettings)
  ];
  const counts = summarizeSections(sections);

  return {
    checkedAt: new Date().toISOString(),
    environment: {
      appUrl: configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL"),
      callbackBaseUrl: configured(
        env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL ?? env?.NEXT_PUBLIC_API_URL,
        "SKILLHUB_AUTH_CALLBACK_BASE_URL",
        "SKILLHUB_AUTH_BASE_URL",
        "NEXT_PUBLIC_API_URL"
      ),
      isProductionLike: isProductionLike(env),
      runtime: configured(env?.SKILLHUB_ENV, "SKILLHUB_ENV") ?? configured(env?.NODE_ENV, "NODE_ENV") ?? "development"
    },
    sections,
    summary: {
      ...counts,
      status: overallStatus(counts)
    }
  };
}

function buildIdentitySection(
  env: LaunchReadinessEnv | undefined,
  authReadiness: Awaited<ReturnType<typeof getPublicAuthProviderReadiness>>
): LaunchReadinessSection {
  const callbackBaseUrl = authReadiness.google.callbackBaseUrl ?? authReadiness.github.callbackBaseUrl ?? configured(
    env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL ?? env?.NEXT_PUBLIC_API_URL,
    "SKILLHUB_AUTH_CALLBACK_BASE_URL",
    "SKILLHUB_AUTH_BASE_URL",
    "NEXT_PUBLIC_API_URL"
  );
  const stateSecret = configured(env?.SKILLHUB_OAUTH_STATE_SECRET ?? env?.SESSION_SECRET, "SKILLHUB_OAUTH_STATE_SECRET", "SESSION_SECRET");
  const googleReady = hasAll(authReadiness.google.clientId, authReadiness.google.clientSecretConfigured ? "configured" : "", callbackBaseUrl, stateSecret);
  const githubReady = hasAll(authReadiness.github.clientId, authReadiness.github.clientSecretConfigured ? "configured" : "", callbackBaseUrl, stateSecret);
  const items: LaunchReadinessItem[] = [
    {
      action: callbackBaseUrl ? "Register the listed callback URLs in Google and GitHub." : "Set SKILLHUB_AUTH_CALLBACK_BASE_URL.",
      description: "OAuth redirects must return to the API callback base URL.",
      detail: callbackBaseUrl ? `${callbackBaseUrl.replace(/\/+$/, "")}/v1/auth/oauth/{provider}/callback` : "Missing callback base URL.",
      key: "oauth_callback_base_url",
      label: "OAuth callback base URL",
      status: callbackBaseUrl ? statusForHttpsUrl(callbackBaseUrl, env, "warning") : "blocker"
    },
    {
      action: stateSecret ? "Keep this secret stable across API deploys." : "Set SKILLHUB_OAUTH_STATE_SECRET.",
      description: "OAuth state protects provider redirects from forged callbacks.",
      detail: stateSecret ? "Configured" : "Missing state signing secret.",
      key: "oauth_state_secret",
      label: "OAuth state secret",
      status: stateSecret ? "ready" : "blocker"
    },
    {
      action: googleReady ? "Run a Google login smoke test from /login." : "Configure Google client id and secret.",
      description: "Google login is expected for normal buyer and publisher onboarding.",
      detail: googleReady ? "Google OAuth can start live redirects." : "Google OAuth is still configuration-required.",
      key: "google_oauth",
      label: "Google OAuth",
      status: googleReady ? "ready" : "warning"
    },
    {
      action: githubReady ? "Run a GitHub login smoke test from /login." : "Configure GitHub client id and secret.",
      description: "GitHub login is important for developer teams using agent tooling.",
      detail: githubReady ? "GitHub OAuth can start live redirects." : "GitHub OAuth is still configuration-required.",
      key: "github_oauth",
      label: "GitHub OAuth",
      status: githubReady ? "ready" : "warning"
    },
    {
      action: cookieDomainReady(env) ? "No action needed." : "Set SKILLHUB_AUTH_COOKIE_DOMAIN=.useskillhub.com.",
      description: "The API callback must set a session cookie usable by the app subdomain.",
      detail: cookieDomainReady(env) ? "Cookie domain is compatible with the current runtime." : "Cookie domain is not production-ready.",
      key: "session_cookie_domain",
      label: "Session cookie domain",
      status: cookieDomainReady(env) ? "ready" : "warning"
    }
  ];

  return section("identity", "Identity and sign-in", items);
}

function buildEmailSection(
  env: LaunchReadinessEnv | undefined,
  database: DatabaseReadiness,
  emailProviderConfig: Awaited<ReturnType<typeof resolveEmailProviderConfig>>
): LaunchReadinessSection {
  const emailSecret = configured(
    env?.SKILLHUB_EMAIL_AUTH_SECRET ?? env?.SKILLHUB_OAUTH_STATE_SECRET ?? env?.SESSION_SECRET,
    "SKILLHUB_EMAIL_AUTH_SECRET",
    "SKILLHUB_OAUTH_STATE_SECRET",
    "SESSION_SECRET"
  );
  const provider = emailProviderConfig.provider;
  const debugProvider = false;
  const resendReady =
    provider === "resend" &&
    emailProviderConfig.resendApiKeyConfigured &&
    Boolean(emailProviderConfig.from);
  const smtpReady =
    provider === "smtp" &&
    Boolean(emailProviderConfig.smtpHost) &&
    Boolean(emailProviderConfig.smtpUser) &&
    emailProviderConfig.smtpPasswordConfigured &&
    Boolean(emailProviderConfig.from) &&
    smtpPortReady(emailProviderConfig.smtpPort);
  const providerReady = resendReady || smtpReady;
  const debugEnabled = truthy(configured(env?.SKILLHUB_EMAIL_AUTH_DEBUG_CODES, "SKILLHUB_EMAIL_AUTH_DEBUG_CODES"));
  const production = isProductionLike(env);
  const emailProviderStatus: LaunchReadinessStatus = providerReady ? "ready" : production ? "blocker" : "warning";
  const items: LaunchReadinessItem[] = [
    {
      action: emailSecret ? "Keep this secret stable; changing it invalidates pending codes." : "Set SKILLHUB_EMAIL_AUTH_SECRET.",
      description: "Email login codes are HMAC-hashed and cannot verify without a stable secret.",
      detail: emailSecret ? "Configured" : "Missing email-code signing secret.",
      key: "email_auth_secret",
      label: "Email-code secret",
      status: emailSecret ? "ready" : "blocker"
    },
    {
      action: database.emailChallenges ? "No action needed." : "Run the email challenge migration.",
      description: "Email signup and login require persisted short-lived verification challenges.",
      detail: database.emailChallenges ? "email_login_challenges is available." : "email_login_challenges is not available.",
      key: "email_challenge_storage",
      label: "Email challenge storage",
      status: database.emailChallenges ? "ready" : "blocker"
    },
    {
      action: database.passwordCredentials ? "No action needed." : "Run migration 033_password_credentials.sql.",
      description: "Password login and registration require salted hash credential storage.",
      detail: database.passwordCredentials ? "user_password_credentials is available." : "Password credential storage is missing.",
      key: "password_credential_storage",
      label: "Password credential storage",
      status: database.passwordCredentials ? "ready" : "blocker"
    },
    {
      action:
        production && debugProvider
          ? "Replace SKILLHUB_EMAIL_PROVIDER=debug_preview with smtp or resend and configure production credentials."
          : providerReady
            ? "Run an email delivery smoke test."
            : "Set SKILLHUB_EMAIL_PROVIDER=smtp with SMTP credentials, or set SKILLHUB_EMAIL_PROVIDER=resend with RESEND_API_KEY and SKILLHUB_EMAIL_FROM.",
      description: "Production email-code login needs provider delivery, not debug preview.",
      detail:
        production && debugProvider
          ? "debug_preview is disabled for production delivery."
          : smtpReady
            ? "SMTP delivery is configured."
            : resendReady
              ? "Resend delivery is configured."
            : `${provider} is not fully production-ready.`,
      key: "email_provider",
      label: "Email provider",
      status: production && debugProvider ? "blocker" : emailProviderStatus
    },
    {
      action: production && debugEnabled ? "Set SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false." : "No action needed.",
      description: "Production must not expose login codes in API responses; the gateway suppresses previews even if this flag is misconfigured.",
      detail:
        production && debugEnabled
          ? "Debug preview is configured but blocked by the production gateway guard."
          : debugEnabled
            ? "Debug code preview is enabled."
            : "Debug code preview is disabled.",
      key: "email_debug_codes",
      label: "Email debug code preview",
      status: production && debugEnabled ? "blocker" : "ready"
    }
  ];

  return section("email", "Email access and delivery", items);
}

function buildWebhookSection(
  database: DatabaseReadiness,
  settings: ResolvedWebhookSettings
): LaunchReadinessSection {
  const timeout = settings.timeoutMs;
  const maxAttempts = settings.maxAttempts;
  const items: LaunchReadinessItem[] = [
    {
      action: database.webhookDeliveryWorker ? "No action needed." : "Run migration 023_webhook_delivery_worker.sql.",
      description: "Webhook outbox delivery needs processing state, last-attempt timestamps, and due-event indexes.",
      detail: database.webhookDeliveryWorker ? "Webhook delivery worker schema is available." : "Webhook worker schema is missing.",
      key: "webhook_worker_schema",
      label: "Webhook worker schema",
      status: database.webhookDeliveryWorker ? "ready" : "blocker"
    },
    {
      action: "Tune webhook timeout in Admin > Platform Config only if endpoint latency requires it.",
      description: "Webhook HTTP delivery uses a bounded timeout so due batches cannot hang indefinitely.",
      detail: `Timeout ${timeout}ms from ${settings.source}.`,
      key: "webhook_timeout",
      label: "Webhook timeout",
      status: timeout >= 1000 && timeout <= 30000 ? "ready" : "warning"
    },
    {
      action: "Tune webhook max attempts in Admin > Platform Config only after observing production failures.",
      description: "Webhook retries stop at the cap and remain visible as failed operations.",
      detail: `Max attempts ${maxAttempts} from ${settings.source}.`,
      key: "webhook_retry_cap",
      label: "Webhook retry cap",
      status: maxAttempts >= 1 && maxAttempts <= 20 ? "ready" : "warning"
    }
  ];

  return section("webhook", "Webhook delivery", items);
}

function buildMarketplaceOperationsSection(
  env: LaunchReadinessEnv | undefined,
  database: DatabaseReadiness
): LaunchReadinessSection {
  const items: LaunchReadinessItem[] = [
    {
      action: database.databaseConnected ? "No action needed." : "Set DATABASE_URL and run all migrations.",
      description: "The operating product depends on database-backed accounts, skills, ledger, reviews, and notifications.",
      detail: database.databaseConnected ? "Database connection is available." : "Database connection is not available.",
      key: "database_connection",
      label: "Database connection",
      status: database.databaseConnected ? "ready" : "blocker"
    },
    {
      action: migrationHistoryAction(database),
      description: "Production updates should run the migration runner before rebuilding API and web containers.",
      detail: migrationHistoryDetail(database),
      key: "schema_migrations",
      label: "Migration history",
      status: migrationHistoryStatus(database)
    },
    {
      action: database.operationsTables ? "No action needed." : "Run retention, feedback, curation, team, and webhook migrations.",
      description: "Publisher/developer/admin dashboards require operational tables beyond the public registry.",
      detail: database.operationsTables ? "Core operations tables are available." : "One or more operations tables are missing.",
      key: "operations_tables",
      label: "Operations tables",
      status: database.operationsTables ? "ready" : "blocker"
    },
    {
      action: database.runtimeCheckRemediationColumns ? "No action needed." : "Run migration 028_runtime_check_remediation.sql.",
      description: "Automated review checks need structured repair metadata so publishers and reviewers can see blockers, target fields, and next actions.",
      detail: database.runtimeCheckRemediationColumns
        ? "Runtime check remediation columns are available."
        : "Runtime check remediation columns are missing.",
      key: "runtime_check_remediation",
      label: "Review check remediation",
      status: database.runtimeCheckRemediationColumns ? "ready" : "blocker"
    },
    {
      action: database.buyerRequestDeliveryColumns ? "No action needed." : "Run migration 029_buyer_request_delivery_package.sql.",
      description: "Buyer request submissions need an exact delivered skill version, delivery note, evidence URL, submitted time, and buyer decision record.",
      detail: database.buyerRequestDeliveryColumns
        ? "Buyer request delivery package columns are available."
        : "Buyer request delivery package columns are missing.",
      key: "buyer_request_delivery_package",
      label: "Buyer request delivery package",
      status: database.buyerRequestDeliveryColumns ? "ready" : "blocker"
    },
    {
      action: database.publisherFeedbackResponseColumns ? "No action needed." : "Run migration 026_skill_feedback_publisher_responses.sql.",
      description: "Publisher responses turn moderated buyer feedback into a public maintenance and trust loop.",
      detail: database.publisherFeedbackResponseColumns
        ? "Publisher feedback response columns are available."
        : "Publisher feedback response columns are missing.",
      key: "publisher_feedback_responses",
      label: "Publisher feedback responses",
      status: database.publisherFeedbackResponseColumns ? "ready" : "blocker"
    },
    {
      action: database.notificationDeliveryColumns ? "No action needed." : "Run migration 022_notification_delivery_operations.sql.",
      description: "External delivery queues need attempt, retry, provider, and error fields.",
      detail: database.notificationDeliveryColumns ? "Notification delivery columns are available." : "Notification delivery columns are missing.",
      key: "notification_delivery_schema",
      label: "Notification delivery schema",
      status: database.notificationDeliveryColumns ? "ready" : "blocker"
    },
    {
      action:
        database.missingActiveNotificationTemplates?.length === 0
          ? "Review active template copy before launch."
          : "Run migration 027_default_notification_templates.sql or create the missing active templates from /admin.",
      description: "Templates make operational communication editable without code deploys; launch needs the required account, review, runtime, billing, payout, buyer-request, feedback, trust, curation, and delivery-operation rows.",
      detail:
        database.activeNotificationTemplates === null
          ? "Template count unavailable."
          : notificationTemplateReadinessDetail(database),
      key: "notification_templates",
      label: "Notification templates",
      status: notificationTemplateReadinessStatus(database)
    },
    {
      action: configured(env?.SKILLHUB_API_KEY_SALT, "SKILLHUB_API_KEY_SALT") ? "No action needed." : "Set SKILLHUB_API_KEY_SALT.",
      description: "Runtime API key hashing needs a stable salt for production verification.",
      detail: configured(env?.SKILLHUB_API_KEY_SALT, "SKILLHUB_API_KEY_SALT") ? "Configured" : "Missing runtime API-key salt.",
      key: "api_key_salt",
      label: "Runtime API-key salt",
      status: configured(env?.SKILLHUB_API_KEY_SALT, "SKILLHUB_API_KEY_SALT") ? "ready" : "warning"
    }
  ];

  return section("marketplace_operations", "Marketplace operations", items);
}

function buildLaunchCredibilitySection(
  database: DatabaseReadiness,
  thresholds: ResolvedLaunchSettings
): LaunchReadinessSection {
  const items: LaunchReadinessItem[] = [
    launchCredibilityItem({
      action: `Verify and publish at least ${thresholds.verifiedSkills} launch-quality public skill(s).`,
      count: database.verifiedSkillCount,
      description: "Public launch needs enough verified supply that buyers are not evaluating an empty marketplace.",
      key: "verified_skills_threshold",
      label: "Verified public skills",
      minimum: thresholds.verifiedSkills
    }),
    launchCredibilityItem({
      action: `Recruit at least ${thresholds.activePublishers} active publisher(s) with public supply.`,
      count: database.activePublisherCount,
      description: "Supplier diversity keeps SkillHub from looking like a single-team catalog.",
      key: "active_publishers_threshold",
      label: "Active publishers",
      minimum: thresholds.activePublishers
    }),
    launchCredibilityItem({
      action: `Create and operate at least ${thresholds.activeProjects} developer project(s) with installs or runtime activity.`,
      count: database.activeProjectCount,
      description: "Developer-side project state proves listings become governed agent workspace state.",
      key: "active_projects_threshold",
      label: "Active developer projects",
      minimum: thresholds.activeProjects
    }),
    launchCredibilityItem({
      action: `Run at least ${thresholds.successfulInvocations} successful governed invocation(s).`,
      count: database.successfulInvocationCount,
      description: "Successful invocations prove the runtime gateway, policy checks, logging, and metering path work.",
      key: "successful_invocations_threshold",
      label: "Successful invocations",
      minimum: thresholds.successfulInvocations
    }),
    launchCredibilityItem({
      action: `Moderate and publish at least ${thresholds.publishedFeedback} buyer feedback row(s).`,
      count: database.publishedFeedbackCount,
      description: "Published feedback gives buyers public trust evidence and gives publishers a reason to return.",
      key: "published_feedback_threshold",
      label: "Published feedback",
      minimum: thresholds.publishedFeedback
    })
  ];

  return section("launch_credibility", "Launch credibility thresholds", items);
}

function buildAgentSection(env: LaunchReadinessEnv | undefined, database: DatabaseReadiness): LaunchReadinessSection {
  const encryptionSecret = configured(
    env?.SKILLHUB_CONFIG_ENCRYPTION_SECRET ?? env?.SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET,
    "SKILLHUB_CONFIG_ENCRYPTION_SECRET",
    "SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET"
  );
  const secretReady = Boolean(encryptionSecret && encryptionSecret.length >= 32);
  const items: LaunchReadinessItem[] = [
    {
      action: database.agentTables ? "No action needed." : "Run migration 036_agent_prompt_assistant.sql.",
      description: "The agent prompt assistant needs model configuration and prompt generation history tables.",
      detail: database.agentTables ? "Agent prompt tables are available." : "Agent prompt tables are missing.",
      key: "agent_tables",
      label: "Agent tables",
      status: database.agentTables ? "ready" : "blocker"
    },
    {
      action: database.agentKeyEncryptionColumns ? "No action needed." : "Run migration 037_agent_model_key_encryption.sql.",
      description: "Model provider API keys must be encrypted at rest and exposed only as last4 metadata.",
      detail: database.agentKeyEncryptionColumns
        ? "Agent model key encryption columns are available."
        : "Agent model key encryption columns are missing.",
      key: "agent_key_encryption_schema",
      label: "Agent key encryption schema",
      status: database.agentKeyEncryptionColumns ? "ready" : "blocker"
    },
    {
      action: secretReady ? "No action needed." : "Set SKILLHUB_CONFIG_ENCRYPTION_SECRET to a stable 32+ character secret.",
      description: "The gateway needs a stable secret to encrypt and decrypt model provider keys.",
      detail: secretReady ? "Configured" : "Missing or too short.",
      key: "agent_key_encryption_secret",
      label: "Platform config encryption secret",
      status: secretReady ? "ready" : "blocker"
    }
  ];

  return section("agent", "Agent prompt assistant", items);
}

function buildCommercialSection(
  database: DatabaseReadiness,
  stripeConfig: ResolvedStripeConfig
): LaunchReadinessSection {
  const stripeSecret = stripeConfig.secretKeyConfigured;
  const stripeWebhookSecret = stripeConfig.webhookSecretConfigured;
  const stripeConnectClientId = stripeConfig.connectClientIdConfigured;
  const successUrl = stripeConfig.successUrl;
  const cancelUrl = stripeConfig.cancelUrl;
  const returnUrl = stripeConfig.returnUrl;
  const refreshUrl = stripeConfig.refreshUrl;
  const items: LaunchReadinessItem[] = [
    {
      action: database.activeCommissionRules && database.activeCommissionRules > 0 ? "No action needed." : "Create the default commission rule.",
      description: "Billable usage needs an active versioned rule before new ledger posting can split revenue.",
      detail:
        database.activeCommissionRules === null
          ? "Commission rule count unavailable."
          : `${database.activeCommissionRules} active commission rule(s).`,
      key: "commission_rules",
      label: "Commission rules",
      status: database.activeCommissionRules && database.activeCommissionRules > 0 ? "ready" : "warning"
    },
    {
      action: database.payoutTables ? "No action needed." : "Run payout and payout workflow migrations.",
      description: "Publishers need payout-account submission sessions and payout-request state before paid marketplace launch.",
      detail: database.payoutTables
        ? "Payout account, submission, and payout request tables are available."
        : database.payoutOnboardingSessions
          ? "Payout setup sessions are available, but one or more payout account/request tables are missing."
          : "Payout setup sessions or payout request tables are missing.",
      key: "payout_state",
      label: "Payout state",
      status: database.payoutTables ? "ready" : "blocker"
    },
    {
      action: database.stripeCheckoutTables && database.stripeCheckoutDestinationColumns && database.stripeSkillPriceColumns && database.stripeSubscriptionColumns
        ? "No action needed."
        : "Run migrations 038_stripe_commerce.sql and 039_stripe_connect_checkout_destination.sql, then link active prices to Stripe Price ids.",
      description: "Paid marketplace purchases must use Stripe Checkout, Stripe Connect destination charges, and durable Stripe customer/session/subscription records.",
      detail:
        database.stripeCheckoutTables && database.stripeCheckoutDestinationColumns && database.stripeSkillPriceColumns && database.stripeSubscriptionColumns
          ? "Stripe Checkout and Connect destination schema is available."
          : "Stripe Checkout tables, destination charge columns, or price/subscription columns are missing.",
      key: "stripe_checkout_schema",
      label: "Stripe Checkout schema",
      status: database.stripeCheckoutTables && database.stripeCheckoutDestinationColumns && database.stripeSkillPriceColumns && database.stripeSubscriptionColumns ? "ready" : "blocker"
    },
    {
      action: database.stripeConnectTables ? "No action needed." : "Run migration 038_stripe_commerce.sql.",
      description: "Publisher payouts require Stripe Connect account storage and payout account linkage.",
      detail: database.stripeConnectTables ? "Stripe Connect schema is available." : "Stripe Connect schema is missing.",
      key: "stripe_connect_schema",
      label: "Stripe Connect schema",
      status: database.stripeConnectTables ? "ready" : "blocker"
    },
    {
      action: database.stripeWebhookEvents ? "No action needed." : "Run migration 038_stripe_commerce.sql.",
      description: "Stripe webhooks must be stored idempotently before they drive subscriptions, refunds, disputes, and payout status.",
      detail: database.stripeWebhookEvents ? "Stripe webhook event table is available." : "Stripe webhook event table is missing.",
      key: "stripe_webhook_schema",
      label: "Stripe webhook schema",
      status: database.stripeWebhookEvents ? "ready" : "blocker"
    },
    {
      action: stripeSecret ? "No action needed." : "Configure Stripe secret key in Admin > Platform Config.",
      description: "Checkout, Connect onboarding, refunds, and status refreshes call Stripe directly.",
      detail: stripeSecret ? `Configured from ${stripeConfig.source}.` : "Missing Stripe secret key.",
      key: "stripe_secret_key",
      label: "Stripe secret key",
      status: stripeSecret ? "ready" : "blocker"
    },
    {
      action: stripeWebhookSecret ? "No action needed." : "Configure Stripe webhook secret in Admin > Platform Config.",
      description: "Webhook signature verification is required in every environment.",
      detail: stripeWebhookSecret ? `Configured from ${stripeConfig.source}.` : "Missing Stripe webhook secret.",
      key: "stripe_webhook_secret",
      label: "Stripe webhook secret",
      status: stripeWebhookSecret ? "ready" : "blocker"
    },
    {
      action: stripeConnectClientId ? "No action needed." : "Configure Stripe Connect client id in Admin > Platform Config.",
      description: "Publisher payout onboarding must be backed by Stripe Connect.",
      detail: stripeConnectClientId ? `Configured from ${stripeConfig.source}.` : "Missing Stripe Connect client id.",
      key: "stripe_connect_client_id",
      label: "Stripe Connect client id",
      status: stripeConnectClientId ? "ready" : "blocker"
    },
    {
      action: hasAll(successUrl, cancelUrl, returnUrl, refreshUrl)
        ? "No action needed."
        : "Configure Stripe Checkout and Connect return URLs in Admin > Platform Config.",
      description: "Stripe browser handoffs need explicit app URLs for Checkout and Connect.",
      detail: hasAll(successUrl, cancelUrl, returnUrl, refreshUrl) ? `Configured from ${stripeConfig.source}.` : "One or more Stripe return URLs are missing.",
      key: "stripe_return_urls",
      label: "Stripe return URLs",
      status: hasAll(successUrl, cancelUrl, returnUrl, refreshUrl) ? "ready" : "blocker"
    },
    {
      action: database.payoutExplainabilityColumns ? "No action needed." : "Run migration 030_payout_explainability.sql.",
      description: "Blocked or failed payouts need durable retry conditions and next-action state.",
      detail: database.payoutExplainabilityColumns
        ? "Payout explainability columns are available."
        : "Payout retry-condition and next-action columns are missing.",
      key: "payout_explainability",
      label: "Payout explainability",
      status: database.payoutExplainabilityColumns ? "ready" : "blocker"
    },
    {
      action: database.publisherTermsAcceptanceColumns ? "No action needed." : "Run migration 024_publisher_terms_acceptance.sql.",
      description: "Paid publishing needs a durable record of the accepted operating terms version and accepting user.",
      detail: database.publisherTermsAcceptanceColumns
        ? "Publisher terms acceptance columns are available."
        : "Publisher terms acceptance columns are missing.",
      key: "publisher_terms_acceptance",
      label: "Publisher terms acceptance",
      status: database.publisherTermsAcceptanceColumns ? "ready" : "blocker"
    }
  ];

  return section("commercial", "Commercial readiness", items);
}

function buildProductionGuardrailSection(
  env: LaunchReadinessEnv | undefined,
  database: DatabaseReadiness,
  runtimeSettings: ResolvedRuntimeSettings
): LaunchReadinessSection {
  const production = isProductionLike(env);
  const appUrl = configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");
  const demoFallback = truthy(configured(env?.SKILLHUB_ENABLE_DEMO_FALLBACK, "SKILLHUB_ENABLE_DEMO_FALLBACK"));
  const legacySignup = truthy(configured(env?.SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN, "SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN"));
  const publicSignupDisabled = runtimeSettings.disablePublicSignup;
  const items: LaunchReadinessItem[] = [
    {
      action: appUrl ? "No action needed." : "Set NEXT_PUBLIC_APP_URL.",
      description: "OAuth returns, docs links, and product navigation need the public app URL.",
      detail: appUrl ?? "Missing app URL.",
      key: "app_url",
      label: "Public app URL",
      status: appUrl ? statusForHttpsUrl(appUrl, env, "warning") : "warning"
    },
    {
      action: production && demoFallback ? "Set SKILLHUB_ENABLE_DEMO_FALLBACK=false or remove it." : "No action needed.",
      description: "Production operations should not silently show bundled demo data when APIs fail.",
      detail: demoFallback ? "Demo fallback is enabled." : "Demo fallback is disabled unless non-production.",
      key: "demo_fallback",
      label: "Demo fallback",
      status: production && demoFallback ? "blocker" : "ready"
    },
    {
      action: production && legacySignup ? "Disable SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN." : "No action needed.",
      description: "Direct public token signup should stay disabled after email-code signup exists.",
      detail: legacySignup ? "Legacy direct-token signup is enabled." : "Legacy direct-token signup is disabled.",
      key: "legacy_signup",
      label: "Legacy signup token",
      status: production && legacySignup ? "blocker" : "ready"
    },
    {
      action: configured(env?.SKILLHUB_ADMIN_TOKEN, "SKILLHUB_ADMIN_TOKEN") ? "Store it securely and rotate if exposed." : "Set SKILLHUB_ADMIN_TOKEN for bootstrap and recovery.",
      description: "The service token remains a controlled recovery path for initial operators.",
      detail: configured(env?.SKILLHUB_ADMIN_TOKEN, "SKILLHUB_ADMIN_TOKEN") ? "Configured" : "Missing service token.",
      key: "service_token",
      label: "Service token",
      status: configured(env?.SKILLHUB_ADMIN_TOKEN, "SKILLHUB_ADMIN_TOKEN") ? "ready" : "blocker"
    },
    {
      action: publicSignupDisabled ? "Confirm invite-only launch policy." : "Confirm open workspace signup policy.",
      description: "Signup policy is a launch decision, not a code default.",
      detail: publicSignupDisabled
        ? `Public signup is disabled from ${runtimeSettings.source}.`
        : `Public signup is open from ${runtimeSettings.source}.`,
      key: "public_signup_policy",
      label: "Public signup policy",
      status: "warning"
    },
    {
      action: database.userAuthIdentities ? "No action needed." : "Run migration 020_user_auth_identities.sql.",
      description: "Connected login identity storage supports Google, GitHub, email, and account center security.",
      detail: database.userAuthIdentities ? "Auth identity storage is available." : "Auth identity storage is missing.",
      key: "auth_identity_storage",
      label: "Auth identity storage",
      status: database.userAuthIdentities ? "ready" : "blocker"
    }
  ];

  return section("guardrails", "Production guardrails", items);
}

async function getDatabaseReadiness(): Promise<DatabaseReadiness> {
  const sql = await getSql();

  if (!sql) {
    return {
      activeCommissionRules: null,
      activeNotificationTemplates: null,
      activeProjectCount: null,
      activePublisherCount: null,
      agentKeyEncryptionColumns: false,
      agentTables: false,
      buyerRequestDeliveryColumns: false,
      databaseConnected: false,
      emailChallenges: false,
      migrationHistoryCount: null,
      migrationLatestAppliedAt: null,
      migrationLatestFilename: null,
      migrationLatestNumber: null,
      missingActiveNotificationTemplates: null,
      notificationDeliveryColumns: false,
      operationsTables: false,
      payoutExplainabilityColumns: false,
      manualPayoutAccountColumns: false,
      passwordCredentials: false,
      payoutOnboardingSessions: false,
      payoutTables: false,
      publishedFeedbackCount: null,
      publisherFeedbackResponseColumns: false,
      publisherTermsAcceptanceColumns: false,
      runtimeCheckRemediationColumns: false,
      schemaMigrations: false,
      successfulInvocationCount: null,
      stripeCheckoutTables: false,
      stripeCheckoutDestinationColumns: false,
      stripeConnectTables: false,
      stripeSkillPriceColumns: false,
      stripeSubscriptionColumns: false,
      stripeWebhookEvents: false,
      userAuthIdentities: false,
      verifiedSkillCount: null,
      webhookDeliveryWorker: false
    };
  }

  try {
    const tableRows = (await sql`
      select
        to_regclass('public.user_auth_identities') is not null as "userAuthIdentities",
        to_regclass('public.email_login_challenges') is not null as "emailChallenges",
        to_regclass('public.user_password_credentials') is not null as "passwordCredentials",
        to_regclass('public.skills') is not null as "skills",
        to_regclass('public.projects') is not null as "projects",
        to_regclass('public.skill_invocations') is not null as "skillInvocations",
        to_regclass('public.publisher_profiles') is not null as "publisherProfiles",
        to_regclass('public.project_skill_installs') is not null as "projectSkillInstalls",
        to_regclass('public.skill_feedback') is not null as "skillFeedback",
        to_regclass('public.marketplace_curation_rules') is not null as "marketplaceCurationRules",
        to_regclass('public.organization_webhook_endpoints') is not null as "organizationWebhookEndpoints",
        to_regclass('public.webhook_delivery_events') is not null as "webhookDeliveryEvents",
        to_regclass('public.notification_events') is not null as "notificationEvents",
        to_regclass('public.notification_templates') is not null as "notificationTemplates",
        to_regclass('public.agent_model_configs') is not null as "agentModelConfigs",
        to_regclass('public.agent_prompt_generations') is not null as "agentPromptGenerations",
        to_regclass('public.payout_accounts') is not null as "payoutAccounts",
        to_regclass('public.payout_account_onboarding_sessions') is not null as "payoutAccountOnboardingSessions",
        to_regclass('public.payouts') is not null as "payouts",
        to_regclass('public.stripe_checkout_sessions') is not null as "stripeCheckoutSessions",
        to_regclass('public.stripe_connect_accounts') is not null as "stripeConnectAccounts",
        to_regclass('public.stripe_customers') is not null as "stripeCustomers",
        to_regclass('public.stripe_payment_intents') is not null as "stripePaymentIntents",
        to_regclass('public.stripe_subscriptions') is not null as "stripeSubscriptions",
        to_regclass('public.stripe_webhook_events') is not null as "stripeWebhookEvents",
        to_regclass('public.commission_rules') is not null as "commissionRules",
        to_regclass('public.schema_migrations') is not null as "schemaMigrations"
    `) as Array<{
      agentModelConfigs: boolean;
      agentPromptGenerations: boolean;
      commissionRules: boolean;
      emailChallenges: boolean;
      passwordCredentials: boolean;
      marketplaceCurationRules: boolean;
      notificationEvents: boolean;
      notificationTemplates: boolean;
      organizationWebhookEndpoints: boolean;
      payoutAccounts: boolean;
      payoutAccountOnboardingSessions: boolean;
      payouts: boolean;
      projects: boolean;
      projectSkillInstalls: boolean;
      publisherProfiles: boolean;
      schemaMigrations: boolean;
      skillInvocations: boolean;
      skills: boolean;
      skillFeedback: boolean;
      stripeCheckoutSessions: boolean;
      stripeConnectAccounts: boolean;
      stripeCustomers: boolean;
      stripePaymentIntents: boolean;
      stripeSubscriptions: boolean;
      stripeWebhookEvents: boolean;
      userAuthIdentities: boolean;
      webhookDeliveryEvents: boolean;
    }>;
    const tables = tableRows[0];
    const columnRows = (await sql`
      select
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'agent_model_configs'
            and column_name = 'api_key_ciphertext'
        ) as "agentApiKeyCiphertext",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'agent_model_configs'
            and column_name = 'api_key_iv'
        ) as "agentApiKeyIv",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'agent_model_configs'
            and column_name = 'api_key_tag'
        ) as "agentApiKeyTag",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'agent_model_configs'
            and column_name = 'api_key_last4'
        ) as "agentApiKeyLast4",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_prices'
            and column_name = 'stripe_price_id'
        ) as "skillPriceStripePriceId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_prices'
            and column_name = 'stripe_product_id'
        ) as "skillPriceStripeProductId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'subscriptions'
            and column_name = 'stripe_subscription_id'
        ) as "subscriptionStripeSubscriptionId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'subscriptions'
            and column_name = 'stripe_checkout_session_id'
        ) as "subscriptionStripeCheckoutSessionId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payout_accounts'
            and column_name = 'stripe_account_id'
        ) as "payoutAccountStripeAccountId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'notification_events'
            and column_name = 'delivery_attempts'
        ) as "notificationDeliveryColumns",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'webhook_delivery_events'
            and column_name = 'last_attempted_at'
        ) as "webhookLastAttemptedAt",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'publisher_profiles'
            and column_name = 'terms_accepted_at'
        ) as "publisherTermsAcceptedAt",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'publisher_profiles'
            and column_name = 'terms_version'
        ) as "publisherTermsVersion",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'publisher_profiles'
            and column_name = 'terms_accepted_by_user_id'
        ) as "publisherTermsAcceptedByUserId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_feedback'
            and column_name = 'publisher_response_body'
        ) as "publisherResponseBody",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_feedback'
            and column_name = 'publisher_responded_at'
        ) as "publisherRespondedAt",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_feedback'
            and column_name = 'publisher_responded_by_user_id'
        ) as "publisherRespondedByUserId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_runtime_checks'
            and column_name = 'is_blocking'
        ) as "runtimeCheckIsBlocking",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_runtime_checks'
            and column_name = 'fix_category'
        ) as "runtimeCheckFixCategory",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_runtime_checks'
            and column_name = 'target_field'
        ) as "runtimeCheckTargetField",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'skill_runtime_checks'
            and column_name = 'next_action'
        ) as "runtimeCheckNextAction",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'submitted_skill_id'
        ) as "buyerRequestSubmittedSkillId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'submitted_skill_version_id'
        ) as "buyerRequestSubmittedSkillVersionId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'delivery_note'
        ) as "buyerRequestDeliveryNote",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'evidence_url'
        ) as "buyerRequestEvidenceUrl",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'submitted_at'
        ) as "buyerRequestSubmittedAt",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'decision_note'
        ) as "buyerRequestDecisionNote",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'buyer_requests'
            and column_name = 'decided_at'
        ) as "buyerRequestDecidedAt",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payouts'
            and column_name = 'retry_condition'
        ) as "payoutRetryCondition",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payouts'
            and column_name = 'next_action'
        ) as "payoutNextAction"
        ,
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payout_accounts'
            and column_name = 'manual_method'
        ) as "payoutAccountManualMethod",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payout_accounts'
            and column_name = 'manual_account'
        ) as "payoutAccountManualAccount",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payout_accounts'
            and column_name = 'manual_account_holder'
        ) as "payoutAccountManualAccountHolder",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'payout_accounts'
            and column_name = 'manual_notes'
        ) as "payoutAccountManualNotes",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'stripe_checkout_sessions'
            and column_name = 'stripe_connected_account_id'
        ) as "stripeCheckoutConnectedAccountId",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'stripe_checkout_sessions'
            and column_name = 'application_fee_amount_cents'
        ) as "stripeCheckoutApplicationFeeAmount",
        exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'stripe_checkout_sessions'
            and column_name = 'publisher_share_cents'
        ) as "stripeCheckoutPublisherShare"
    `) as Array<{
      agentApiKeyCiphertext: boolean;
      agentApiKeyIv: boolean;
      agentApiKeyLast4: boolean;
      agentApiKeyTag: boolean;
      buyerRequestDecidedAt: boolean;
      buyerRequestDecisionNote: boolean;
      buyerRequestDeliveryNote: boolean;
      buyerRequestEvidenceUrl: boolean;
      buyerRequestSubmittedAt: boolean;
      buyerRequestSubmittedSkillId: boolean;
      buyerRequestSubmittedSkillVersionId: boolean;
      notificationDeliveryColumns: boolean;
      payoutAccountManualAccount: boolean;
      payoutAccountManualAccountHolder: boolean;
      payoutAccountManualMethod: boolean;
      payoutAccountManualNotes: boolean;
      payoutAccountStripeAccountId: boolean;
      payoutNextAction: boolean;
      payoutRetryCondition: boolean;
      publisherResponseBody: boolean;
      publisherRespondedAt: boolean;
      publisherRespondedByUserId: boolean;
      publisherTermsAcceptedAt: boolean;
      publisherTermsAcceptedByUserId: boolean;
      publisherTermsVersion: boolean;
      runtimeCheckFixCategory: boolean;
      runtimeCheckIsBlocking: boolean;
      runtimeCheckNextAction: boolean;
      runtimeCheckTargetField: boolean;
      skillPriceStripePriceId: boolean;
      skillPriceStripeProductId: boolean;
      stripeCheckoutApplicationFeeAmount: boolean;
      stripeCheckoutConnectedAccountId: boolean;
      stripeCheckoutPublisherShare: boolean;
      subscriptionStripeCheckoutSessionId: boolean;
      subscriptionStripeSubscriptionId: boolean;
      webhookLastAttemptedAt: boolean;
    }>;
    const columns = columnRows[0];
    const activeCommissionRules = tables.commissionRules ? await countActiveCommissionRules(sql) : null;
    const activeNotificationTemplates = tables.notificationTemplates ? await countActiveNotificationTemplates(sql) : null;
    const missingActiveNotificationTemplates = tables.notificationTemplates ? await listMissingActiveNotificationTemplates(sql) : null;
    const migrationHistory = tables.schemaMigrations ? await getMigrationHistory(sql) : null;
    const launchCredibility = await countLaunchCredibilitySignals(sql, tables);

    return {
      activeCommissionRules,
      activeNotificationTemplates,
      activeProjectCount: launchCredibility.activeProjectCount,
      activePublisherCount: launchCredibility.activePublisherCount,
      agentKeyEncryptionColumns:
        columns.agentApiKeyCiphertext &&
        columns.agentApiKeyIv &&
        columns.agentApiKeyTag &&
        columns.agentApiKeyLast4,
      agentTables: tables.agentModelConfigs && tables.agentPromptGenerations,
      buyerRequestDeliveryColumns:
        columns.buyerRequestSubmittedSkillId &&
        columns.buyerRequestSubmittedSkillVersionId &&
        columns.buyerRequestDeliveryNote &&
        columns.buyerRequestEvidenceUrl &&
        columns.buyerRequestSubmittedAt &&
        columns.buyerRequestDecisionNote &&
        columns.buyerRequestDecidedAt,
      databaseConnected: true,
      emailChallenges: tables.emailChallenges,
      passwordCredentials: tables.passwordCredentials,
      migrationHistoryCount: migrationHistory?.count ?? null,
      migrationLatestAppliedAt: migrationHistory?.latestAppliedAt ?? null,
      migrationLatestFilename: migrationHistory?.latestFilename ?? null,
      migrationLatestNumber: migrationHistory?.latestNumber ?? null,
      missingActiveNotificationTemplates,
      notificationDeliveryColumns: columns.notificationDeliveryColumns,
      manualPayoutAccountColumns:
        columns.payoutAccountManualMethod &&
        columns.payoutAccountManualAccount &&
        columns.payoutAccountManualAccountHolder &&
        columns.payoutAccountManualNotes,
      operationsTables:
        tables.projectSkillInstalls &&
        tables.skillFeedback &&
        tables.marketplaceCurationRules &&
        tables.organizationWebhookEndpoints &&
        tables.notificationEvents,
      payoutExplainabilityColumns: columns.payoutRetryCondition && columns.payoutNextAction,
      payoutOnboardingSessions: tables.payoutAccountOnboardingSessions,
      payoutTables: tables.payoutAccounts && tables.payoutAccountOnboardingSessions && tables.payouts,
      publishedFeedbackCount: launchCredibility.publishedFeedbackCount,
      publisherFeedbackResponseColumns:
        columns.publisherResponseBody &&
        columns.publisherRespondedAt &&
        columns.publisherRespondedByUserId,
      publisherTermsAcceptanceColumns:
        columns.publisherTermsAcceptedAt &&
        columns.publisherTermsVersion &&
        columns.publisherTermsAcceptedByUserId,
      runtimeCheckRemediationColumns:
        columns.runtimeCheckIsBlocking &&
        columns.runtimeCheckFixCategory &&
        columns.runtimeCheckTargetField &&
        columns.runtimeCheckNextAction,
      schemaMigrations: tables.schemaMigrations,
      successfulInvocationCount: launchCredibility.successfulInvocationCount,
      stripeCheckoutTables:
        tables.stripeCustomers &&
        tables.stripeCheckoutSessions &&
        tables.stripePaymentIntents &&
        tables.stripeSubscriptions,
      stripeCheckoutDestinationColumns:
        columns.stripeCheckoutConnectedAccountId &&
        columns.stripeCheckoutApplicationFeeAmount &&
        columns.stripeCheckoutPublisherShare,
      stripeConnectTables: tables.stripeConnectAccounts && columns.payoutAccountStripeAccountId,
      stripeSkillPriceColumns: columns.skillPriceStripeProductId && columns.skillPriceStripePriceId,
      stripeSubscriptionColumns:
        columns.subscriptionStripeSubscriptionId &&
        columns.subscriptionStripeCheckoutSessionId,
      stripeWebhookEvents: tables.stripeWebhookEvents,
      userAuthIdentities: tables.userAuthIdentities,
      verifiedSkillCount: launchCredibility.verifiedSkillCount,
      webhookDeliveryWorker: tables.webhookDeliveryEvents && columns.webhookLastAttemptedAt
    };
  } catch {
    return {
      activeCommissionRules: null,
      activeNotificationTemplates: null,
      activeProjectCount: null,
      activePublisherCount: null,
      agentKeyEncryptionColumns: false,
      agentTables: false,
      buyerRequestDeliveryColumns: false,
      databaseConnected: false,
      emailChallenges: false,
      migrationHistoryCount: null,
      migrationLatestAppliedAt: null,
      migrationLatestFilename: null,
      migrationLatestNumber: null,
      missingActiveNotificationTemplates: null,
      notificationDeliveryColumns: false,
      operationsTables: false,
      payoutExplainabilityColumns: false,
      manualPayoutAccountColumns: false,
      passwordCredentials: false,
      payoutOnboardingSessions: false,
      payoutTables: false,
      publishedFeedbackCount: null,
      publisherFeedbackResponseColumns: false,
      publisherTermsAcceptanceColumns: false,
      runtimeCheckRemediationColumns: false,
      schemaMigrations: false,
      successfulInvocationCount: null,
      stripeCheckoutTables: false,
      stripeCheckoutDestinationColumns: false,
      stripeConnectTables: false,
      stripeSkillPriceColumns: false,
      stripeSubscriptionColumns: false,
      stripeWebhookEvents: false,
      userAuthIdentities: false,
      verifiedSkillCount: null,
      webhookDeliveryWorker: false
    };
  }
}

async function countLaunchCredibilitySignals(
  sql: Sql,
  tables: {
    projectSkillInstalls: boolean;
    projects: boolean;
    publisherProfiles: boolean;
    skillFeedback: boolean;
    skillInvocations: boolean;
    skills: boolean;
  }
) {
  const verifiedSkillCount = tables.skills ? await countPublicVerifiedSkills(sql) : null;
  const activePublisherCount = tables.publisherProfiles && tables.skills ? await countActivePublishers(sql) : null;
  const activeProjectCount =
    tables.projects && tables.projectSkillInstalls && tables.skillInvocations ? await countActiveDeveloperProjects(sql) : null;
  const successfulInvocationCount = tables.skillInvocations ? await countSuccessfulInvocations(sql) : null;
  const publishedFeedbackCount = tables.skillFeedback ? await countPublishedFeedback(sql) : null;

  return {
    activeProjectCount,
    activePublisherCount,
    publishedFeedbackCount,
    successfulInvocationCount,
    verifiedSkillCount
  };
}

async function countPublicVerifiedSkills(sql: Sql) {
  const rows = (await sql`
    select count(*)::int as count
    from skills
    where verification_status = 'verified'
      and visibility = 'public'
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function countActivePublishers(sql: Sql) {
  const rows = (await sql`
    select count(distinct publisher_profiles.id)::int as count
    from publisher_profiles
    where publisher_profiles.status = 'active'
      and exists (
        select 1
        from skills
        where skills.organization_id = publisher_profiles.organization_id
          and skills.visibility = 'public'
          and skills.verification_status in ('submitted', 'verified', 'deprecated')
      )
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function countActiveDeveloperProjects(sql: Sql) {
  const rows = (await sql`
    select count(distinct projects.id)::int as count
    from projects
    where exists (
        select 1
        from project_skill_installs
        where project_skill_installs.project_id = projects.id
          and project_skill_installs.status = 'installed'
      )
      or exists (
        select 1
        from skill_invocations
        where skill_invocations.project_id = projects.id
      )
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function countSuccessfulInvocations(sql: Sql) {
  const rows = (await sql`
    select count(*)::int as count
    from skill_invocations
    where status = 'success'
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function countPublishedFeedback(sql: Sql) {
  const rows = (await sql`
    select count(*)::int as count
    from skill_feedback
    where status = 'published'
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function getMigrationHistory(sql: Sql) {
  const rows = (await sql`
    select
      filename,
      coalesce((substring(filename from '^[0-9]+'))::int, 0) as "migrationNumber",
      applied_at::text as "appliedAt",
      count(*) over ()::int as count
    from schema_migrations
    order by coalesce((substring(filename from '^[0-9]+'))::int, 0) desc, filename desc
    limit 1
  `) as Array<{
    appliedAt: string;
    count: number;
    filename: string;
    migrationNumber: number;
  }>;
  const latest = rows[0];

  return {
    count: latest?.count ?? 0,
    latestAppliedAt: latest?.appliedAt ?? null,
    latestFilename: latest?.filename ?? null,
    latestNumber: latest?.migrationNumber ?? null
  };
}

async function countActiveCommissionRules(sql: Sql) {
  const rows = (await sql`
    select count(*)::int as count
    from commission_rules
    where starts_at <= now()
      and (ends_at is null or ends_at > now())
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function countActiveNotificationTemplates(sql: Sql) {
  const rows = (await sql`
    select count(*)::int as count
    from notification_templates
    where status = 'active'
  `) as Array<{ count: number }>;

  return rows[0]?.count ?? 0;
}

async function listMissingActiveNotificationTemplates(sql: Sql) {
  const rows = (await sql`
    select
      template_key as "templateKey",
      channel,
      locale
    from notification_templates
    where status = 'active'
  `) as Array<{ channel: string; locale: string; templateKey: string }>;
  const activeTemplates = new Set(rows.map((row) => templateIdentity(row.templateKey, row.channel, row.locale)));

  return requiredActiveNotificationTemplates
    .map(([templateKey, channel, locale]) => templateIdentity(templateKey, channel, locale))
    .filter((identity) => !activeTemplates.has(identity));
}

function notificationTemplateReadinessStatus(database: DatabaseReadiness): LaunchReadinessStatus {
  if (!database.databaseConnected) {
    return "blocker";
  }

  if (database.activeNotificationTemplates === null || database.missingActiveNotificationTemplates === null) {
    return "warning";
  }

  if (database.missingActiveNotificationTemplates.length > 0) {
    return "blocker";
  }

  return "ready";
}

function notificationTemplateReadinessDetail(database: DatabaseReadiness) {
  const activeCount = database.activeNotificationTemplates ?? 0;
  const requiredCount = requiredActiveNotificationTemplates.length;
  const missing = database.missingActiveNotificationTemplates ?? [];

  if (missing.length === 0) {
    return `${activeCount} active template(s). Required launch coverage ${requiredCount}/${requiredCount}.`;
  }

  return `${activeCount} active template(s). Missing required ${missing.length}/${requiredCount}: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ", ..." : ""}.`;
}

function launchCredibilityItem({
  action,
  count,
  description,
  key,
  label,
  minimum
}: {
  action: string;
  count: number | null;
  description: string;
  key: string;
  label: string;
  minimum: number;
}): LaunchReadinessItem {
  const current = count ?? 0;
  const ready = count !== null && current >= minimum;

  return {
    action: ready ? "No action needed." : action,
    description,
    detail: count === null ? `Count unavailable. Target ${minimum}.` : `${current}/${minimum} target reached.`,
    key,
    label,
    status: ready ? "ready" : "warning"
  };
}

function getLaunchCredibilityThresholds(env: LaunchReadinessEnv | undefined) {
  return {
    activeProjects: launchThreshold(env?.SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS, "SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS", 3),
    activePublishers: launchThreshold(env?.SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS, "SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS", 2),
    publishedFeedback: launchThreshold(env?.SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK, "SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK", 5),
    successfulInvocations: launchThreshold(
      env?.SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS,
      "SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS",
      20
    ),
    verifiedSkills: launchThreshold(env?.SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS, "SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS", 5)
  };
}

function launchThreshold(value: string | undefined, key: string, fallback: number) {
  return Math.max(0, Math.floor(numberValue(configured(value, key), fallback)));
}

function templateIdentity(templateKey: string, channel: string, locale: string) {
  return `${templateKey.trim().toLowerCase()}::${channel.trim().toLowerCase()}::${locale.trim().toLowerCase()}`;
}

function migrationHistoryStatus(database: DatabaseReadiness): LaunchReadinessStatus {
  if (!database.databaseConnected) {
    return "blocker";
  }

  if (!database.schemaMigrations || database.migrationHistoryCount === null || database.migrationHistoryCount === 0) {
    return "warning";
  }

  if ((database.migrationLatestNumber ?? 0) < expectedLatestMigrationNumber) {
    return "blocker";
  }

  return "ready";
}

function migrationHistoryAction(database: DatabaseReadiness) {
  if (!database.databaseConnected) {
    return "Set DATABASE_URL, start Postgres, and run ./scripts/run-postgres-migrations.sh.";
  }

  if (!database.schemaMigrations || database.migrationHistoryCount === null || database.migrationHistoryCount === 0) {
    return "Run ./scripts/run-postgres-migrations.sh once from /opt/skillhub.";
  }

  if ((database.migrationLatestNumber ?? 0) < expectedLatestMigrationNumber) {
    return `Run ./scripts/run-postgres-migrations.sh; expected ${expectedLatestMigrationFilename}.`;
  }

  return "No action needed.";
}

function migrationHistoryDetail(database: DatabaseReadiness) {
  if (!database.databaseConnected) {
    return "Database connection is not available.";
  }

  if (!database.schemaMigrations) {
    return "schema_migrations is missing; migration runner has not recorded deployment history.";
  }

  if (database.migrationHistoryCount === null || database.migrationHistoryCount === 0) {
    return "schema_migrations exists but has no applied migration rows.";
  }

  const latest = database.migrationLatestFilename ?? "unknown";
  const appliedAt = database.migrationLatestAppliedAt ? ` at ${database.migrationLatestAppliedAt}` : "";

  return `${database.migrationHistoryCount} recorded migration(s). Latest: ${latest}${appliedAt}. Expected latest: ${expectedLatestMigrationFilename}.`;
}

function section(key: string, title: string, items: LaunchReadinessItem[]): LaunchReadinessSection {
  return {
    items,
    key,
    status: sectionStatus(items),
    title
  };
}

function sectionStatus(items: LaunchReadinessItem[]): LaunchReadinessStatus {
  if (items.some((item) => item.status === "blocker")) {
    return "blocker";
  }

  if (items.some((item) => item.status === "warning")) {
    return "warning";
  }

  if (items.every((item) => item.status === "deferred")) {
    return "deferred";
  }

  return "ready";
}

function summarizeSections(sections: LaunchReadinessSection[]) {
  return sections
    .flatMap((sectionItem) => sectionItem.items)
    .reduce(
      (summary, item) => ({
        ...summary,
        [item.status]: summary[item.status] + 1
      }),
      {
        blocker: 0,
        deferred: 0,
        ready: 0,
        warning: 0
      }
    );
}

function overallStatus(counts: { blocker: number; deferred: number; ready: number; warning: number }): LaunchReadinessStatus {
  if (counts.blocker > 0) {
    return "blocker";
  }

  if (counts.warning > 0) {
    return "warning";
  }

  if (counts.ready === 0 && counts.deferred > 0) {
    return "deferred";
  }

  return "ready";
}

function statusForHttpsUrl(value: string, env: LaunchReadinessEnv | undefined, fallback: LaunchReadinessStatus): LaunchReadinessStatus {
  try {
    const url = new URL(value);

    if (isProductionLike(env) && url.protocol !== "https:") {
      return fallback;
    }

    return "ready";
  } catch {
    return fallback;
  }
}

function cookieDomainReady(env: LaunchReadinessEnv | undefined) {
  const configuredDomain = configured(env?.SKILLHUB_AUTH_COOKIE_DOMAIN, "SKILLHUB_AUTH_COOKIE_DOMAIN");

  if (configuredDomain) {
    return true;
  }

  if (!isProductionLike(env)) {
    return true;
  }

  const appUrl = configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");

  if (!appUrl) {
    return false;
  }

  try {
    return !new URL(appUrl).hostname.endsWith("useskillhub.com");
  } catch {
    return false;
  }
}

function isProductionLike(env: LaunchReadinessEnv | undefined) {
  return [configured(env?.SKILLHUB_ENV, "SKILLHUB_ENV"), configured(env?.NODE_ENV, "NODE_ENV"), configured(env?.VERCEL_ENV, "VERCEL_ENV")].some(
    (value) => value?.trim().toLowerCase() === "production"
  );
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

function hasAll(...values: Array<string | null | undefined>) {
  return values.every((value) => Boolean(value?.trim()));
}

function smtpPortReady(value: string | null) {
  if (!value) {
    return true;
  }

  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535;
}

function truthy(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function numberValue(value: string | null | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
