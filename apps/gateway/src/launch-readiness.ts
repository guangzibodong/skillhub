import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

const expectedLatestMigrationFilename = "026_skill_feedback_publisher_responses.sql";
const expectedLatestMigrationNumber = 26;

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
  SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
  SKILLHUB_EMAIL_AUTH_SECRET?: string;
  SKILLHUB_EMAIL_FROM?: string;
  SKILLHUB_EMAIL_PROVIDER?: string;
  SKILLHUB_ENABLE_DEMO_FALLBACK?: string;
  SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN?: string;
  SKILLHUB_ENV?: string;
  SKILLHUB_GITHUB_CLIENT_ID?: string;
  SKILLHUB_GITHUB_CLIENT_SECRET?: string;
  SKILLHUB_GOOGLE_CLIENT_ID?: string;
  SKILLHUB_GOOGLE_CLIENT_SECRET?: string;
  SKILLHUB_OAUTH_STATE_SECRET?: string;
  SKILLHUB_WEBHOOK_MAX_ATTEMPTS?: string;
  SKILLHUB_WEBHOOK_TIMEOUT_MS?: string;
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
  databaseConnected: boolean;
  emailChallenges: boolean;
  migrationHistoryCount: number | null;
  migrationLatestAppliedAt: string | null;
  migrationLatestFilename: string | null;
  migrationLatestNumber: number | null;
  notificationDeliveryColumns: boolean;
  operationsTables: boolean;
  payoutTables: boolean;
  publisherFeedbackResponseColumns: boolean;
  publisherTermsAcceptanceColumns: boolean;
  schemaMigrations: boolean;
  userAuthIdentities: boolean;
  webhookDeliveryWorker: boolean;
};

export async function getLaunchReadiness(env?: LaunchReadinessEnv): Promise<LaunchReadinessReport> {
  const database = await getDatabaseReadiness();
  const sections = [
    buildIdentitySection(env),
    buildEmailSection(env, database),
    buildWebhookSection(env, database),
    buildMarketplaceOperationsSection(env, database),
    buildCommercialSection(database),
    buildProductionGuardrailSection(env, database)
  ];
  const counts = summarizeSections(sections);

  return {
    checkedAt: new Date().toISOString(),
    environment: {
      appUrl: configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL"),
      callbackBaseUrl: configured(
        env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL,
        "SKILLHUB_AUTH_CALLBACK_BASE_URL",
        "SKILLHUB_AUTH_BASE_URL"
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

function buildIdentitySection(env: LaunchReadinessEnv | undefined): LaunchReadinessSection {
  const callbackBaseUrl = configured(
    env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL,
    "SKILLHUB_AUTH_CALLBACK_BASE_URL",
    "SKILLHUB_AUTH_BASE_URL"
  );
  const stateSecret = configured(env?.SKILLHUB_OAUTH_STATE_SECRET ?? env?.SESSION_SECRET, "SKILLHUB_OAUTH_STATE_SECRET", "SESSION_SECRET");
  const googleReady = hasAll(
    env?.SKILLHUB_GOOGLE_CLIENT_ID ?? env?.GOOGLE_CLIENT_ID,
    env?.SKILLHUB_GOOGLE_CLIENT_SECRET ?? env?.GOOGLE_CLIENT_SECRET,
    callbackBaseUrl,
    stateSecret
  );
  const githubReady = hasAll(
    env?.SKILLHUB_GITHUB_CLIENT_ID ?? env?.GITHUB_CLIENT_ID,
    env?.SKILLHUB_GITHUB_CLIENT_SECRET ?? env?.GITHUB_CLIENT_SECRET,
    callbackBaseUrl,
    stateSecret
  );
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

function buildEmailSection(env: LaunchReadinessEnv | undefined, database: DatabaseReadiness): LaunchReadinessSection {
  const emailSecret = configured(
    env?.SKILLHUB_EMAIL_AUTH_SECRET ?? env?.SKILLHUB_OAUTH_STATE_SECRET ?? env?.SESSION_SECRET,
    "SKILLHUB_EMAIL_AUTH_SECRET",
    "SKILLHUB_OAUTH_STATE_SECRET",
    "SESSION_SECRET"
  );
  const provider = (configured(env?.SKILLHUB_EMAIL_PROVIDER, "SKILLHUB_EMAIL_PROVIDER") ?? "provider_deferred").toLowerCase();
  const resendReady =
    provider === "resend" &&
    Boolean(configured(env?.RESEND_API_KEY, "RESEND_API_KEY")) &&
    Boolean(configured(env?.SKILLHUB_EMAIL_FROM, "SKILLHUB_EMAIL_FROM"));
  const debugEnabled = truthy(configured(env?.SKILLHUB_EMAIL_AUTH_DEBUG_CODES, "SKILLHUB_EMAIL_AUTH_DEBUG_CODES"));
  const production = isProductionLike(env);
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
      action: resendReady ? "Run an email delivery smoke test." : "Set SKILLHUB_EMAIL_PROVIDER=resend, RESEND_API_KEY, and SKILLHUB_EMAIL_FROM.",
      description: "Production email-code login needs provider delivery, not debug preview.",
      detail: resendReady ? "Resend delivery is configured." : `${provider} is not fully production-ready.`,
      key: "email_provider",
      label: "Email provider",
      status: resendReady ? "ready" : "warning"
    },
    {
      action: production && debugEnabled ? "Set SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false." : "No action needed.",
      description: "Production must not expose login codes in API responses.",
      detail: debugEnabled ? "Debug code preview is enabled." : "Debug code preview is disabled.",
      key: "email_debug_codes",
      label: "Email debug code preview",
      status: production && debugEnabled ? "blocker" : "ready"
    }
  ];

  return section("email", "Email access and delivery", items);
}

function buildWebhookSection(env: LaunchReadinessEnv | undefined, database: DatabaseReadiness): LaunchReadinessSection {
  const timeout = numberValue(configured(env?.SKILLHUB_WEBHOOK_TIMEOUT_MS, "SKILLHUB_WEBHOOK_TIMEOUT_MS"), 8000);
  const maxAttempts = numberValue(configured(env?.SKILLHUB_WEBHOOK_MAX_ATTEMPTS, "SKILLHUB_WEBHOOK_MAX_ATTEMPTS"), 8);
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
      action: "Tune SKILLHUB_WEBHOOK_TIMEOUT_MS only if endpoint latency requires it.",
      description: "Webhook HTTP delivery uses a bounded timeout so due batches cannot hang indefinitely.",
      detail: `Timeout ${timeout}ms.`,
      key: "webhook_timeout",
      label: "Webhook timeout",
      status: timeout >= 1000 && timeout <= 30000 ? "ready" : "warning"
    },
    {
      action: "Tune SKILLHUB_WEBHOOK_MAX_ATTEMPTS only after observing production failures.",
      description: "Webhook retries stop at the cap and remain visible as failed operations.",
      detail: `Max attempts ${maxAttempts}.`,
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
        database.activeNotificationTemplates && database.activeNotificationTemplates > 0
          ? "Review active template copy before launch."
          : "Create active notification templates for review, billing, payout, and account-security events.",
      description: "Templates make operational communication editable without code deploys.",
      detail:
        database.activeNotificationTemplates === null
          ? "Template count unavailable."
          : `${database.activeNotificationTemplates} active template(s).`,
      key: "notification_templates",
      label: "Notification templates",
      status: database.activeNotificationTemplates && database.activeNotificationTemplates > 0 ? "ready" : "warning"
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

function buildCommercialSection(database: DatabaseReadiness): LaunchReadinessSection {
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
      action: database.payoutTables ? "No action needed." : "Run payout and onboarding migrations.",
      description: "Publishers need payout-account and payout-request state before paid marketplace launch.",
      detail: database.payoutTables ? "Payout tables are available." : "Payout tables are missing.",
      key: "payout_state",
      label: "Payout state",
      status: database.payoutTables ? "ready" : "blocker"
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
    },
    {
      action: "Choose and connect the final payment provider after internal billing states are stable.",
      description: "Provider payment capture, connected payout onboarding, and tax/KYC automation remain intentionally deferred.",
      detail: "Provider API integration is deferred by product scope.",
      key: "payment_provider",
      label: "Payment provider",
      status: "deferred"
    }
  ];

  return section("commercial", "Commercial readiness", items);
}

function buildProductionGuardrailSection(env: LaunchReadinessEnv | undefined, database: DatabaseReadiness): LaunchReadinessSection {
  const production = isProductionLike(env);
  const appUrl = configured(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");
  const demoFallback = truthy(configured(env?.SKILLHUB_ENABLE_DEMO_FALLBACK, "SKILLHUB_ENABLE_DEMO_FALLBACK"));
  const legacySignup = truthy(configured(env?.SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN, "SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN"));
  const publicSignupDisabled = truthy(configured(env?.SKILLHUB_DISABLE_PUBLIC_SIGNUP, "SKILLHUB_DISABLE_PUBLIC_SIGNUP"));
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
      detail: publicSignupDisabled ? "Public signup is disabled." : "Public signup is open.",
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
      databaseConnected: false,
      emailChallenges: false,
      migrationHistoryCount: null,
      migrationLatestAppliedAt: null,
      migrationLatestFilename: null,
      migrationLatestNumber: null,
      notificationDeliveryColumns: false,
      operationsTables: false,
      payoutTables: false,
      publisherFeedbackResponseColumns: false,
      publisherTermsAcceptanceColumns: false,
      schemaMigrations: false,
      userAuthIdentities: false,
      webhookDeliveryWorker: false
    };
  }

  try {
    const tableRows = (await sql`
      select
        to_regclass('public.user_auth_identities') is not null as "userAuthIdentities",
        to_regclass('public.email_login_challenges') is not null as "emailChallenges",
        to_regclass('public.project_skill_installs') is not null as "projectSkillInstalls",
        to_regclass('public.skill_feedback') is not null as "skillFeedback",
        to_regclass('public.marketplace_curation_rules') is not null as "marketplaceCurationRules",
        to_regclass('public.organization_webhook_endpoints') is not null as "organizationWebhookEndpoints",
        to_regclass('public.webhook_delivery_events') is not null as "webhookDeliveryEvents",
        to_regclass('public.notification_events') is not null as "notificationEvents",
        to_regclass('public.notification_templates') is not null as "notificationTemplates",
        to_regclass('public.payout_accounts') is not null as "payoutAccounts",
        to_regclass('public.payouts') is not null as "payouts",
        to_regclass('public.commission_rules') is not null as "commissionRules",
        to_regclass('public.schema_migrations') is not null as "schemaMigrations"
    `) as Array<{
      commissionRules: boolean;
      emailChallenges: boolean;
      marketplaceCurationRules: boolean;
      notificationEvents: boolean;
      notificationTemplates: boolean;
      organizationWebhookEndpoints: boolean;
      payoutAccounts: boolean;
      payouts: boolean;
      projectSkillInstalls: boolean;
      schemaMigrations: boolean;
      skillFeedback: boolean;
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
        ) as "publisherRespondedByUserId"
    `) as Array<{
      notificationDeliveryColumns: boolean;
      publisherResponseBody: boolean;
      publisherRespondedAt: boolean;
      publisherRespondedByUserId: boolean;
      publisherTermsAcceptedAt: boolean;
      publisherTermsAcceptedByUserId: boolean;
      publisherTermsVersion: boolean;
      webhookLastAttemptedAt: boolean;
    }>;
    const columns = columnRows[0];
    const activeCommissionRules = tables.commissionRules ? await countActiveCommissionRules(sql) : null;
    const activeNotificationTemplates = tables.notificationTemplates ? await countActiveNotificationTemplates(sql) : null;
    const migrationHistory = tables.schemaMigrations ? await getMigrationHistory(sql) : null;

    return {
      activeCommissionRules,
      activeNotificationTemplates,
      databaseConnected: true,
      emailChallenges: tables.emailChallenges,
      migrationHistoryCount: migrationHistory?.count ?? null,
      migrationLatestAppliedAt: migrationHistory?.latestAppliedAt ?? null,
      migrationLatestFilename: migrationHistory?.latestFilename ?? null,
      migrationLatestNumber: migrationHistory?.latestNumber ?? null,
      notificationDeliveryColumns: columns.notificationDeliveryColumns,
      operationsTables:
        tables.projectSkillInstalls &&
        tables.skillFeedback &&
        tables.marketplaceCurationRules &&
        tables.organizationWebhookEndpoints &&
        tables.notificationEvents,
      payoutTables: tables.payoutAccounts && tables.payouts,
      publisherFeedbackResponseColumns:
        columns.publisherResponseBody &&
        columns.publisherRespondedAt &&
        columns.publisherRespondedByUserId,
      publisherTermsAcceptanceColumns:
        columns.publisherTermsAcceptedAt &&
        columns.publisherTermsVersion &&
        columns.publisherTermsAcceptedByUserId,
      schemaMigrations: tables.schemaMigrations,
      userAuthIdentities: tables.userAuthIdentities,
      webhookDeliveryWorker: tables.webhookDeliveryEvents && columns.webhookLastAttemptedAt
    };
  } catch {
    return {
      activeCommissionRules: null,
      activeNotificationTemplates: null,
      databaseConnected: false,
      emailChallenges: false,
      migrationHistoryCount: null,
      migrationLatestAppliedAt: null,
      migrationLatestFilename: null,
      migrationLatestNumber: null,
      notificationDeliveryColumns: false,
      operationsTables: false,
      payoutTables: false,
      publisherFeedbackResponseColumns: false,
      publisherTermsAcceptanceColumns: false,
      schemaMigrations: false,
      userAuthIdentities: false,
      webhookDeliveryWorker: false
    };
  }
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
  return (
    (configured(env?.SKILLHUB_ENV, "SKILLHUB_ENV") ?? configured(env?.NODE_ENV, "NODE_ENV") ?? "")
      .trim()
      .toLowerCase() === "production"
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
