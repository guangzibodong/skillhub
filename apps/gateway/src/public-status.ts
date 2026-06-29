import { getSql } from "./registry.js";
import {
  assertPlatformConfigSchema,
  getPublicPaymentProviderStatuses,
  resolveEmailProviderConfig,
  resolveOAuthProviderConfig,
  resolvePayPalConfig,
  resolveStripeConfig,
  type PlatformConfigEnv,
} from "./platform-config.js";
import { listPublicAgentModels } from "./agent-prompts.js";

export type PublicStatusLevel = "degraded" | "operational";

export type PublicStatusService = {
  description: string;
  key: string;
  status: PublicStatusLevel;
  title: string;
};

export async function getPublicStatus(env?: PlatformConfigEnv) {
  const [database, migrations, payments, oauth, email, prompts] = await Promise.all([
    checkDatabase(),
    checkMigrations(),
    checkPayments(env),
    checkOAuth(env),
    checkEmail(env),
    checkPrompts(),
  ]);
  const services: PublicStatusService[] = [
    {
      description: "Public web routes are served by the web deployment.",
      key: "web",
      status: "operational",
      title: "Public web",
    },
    database,
    migrations,
    payments,
    oauth,
    email,
    prompts,
  ];
  const overall = services.some((service) => service.status === "degraded")
    ? "degraded"
    : "operational";

  return {
    checkedAt: new Date().toISOString(),
    overall,
    services,
  };
}

async function checkDatabase(): Promise<PublicStatusService> {
  const sql = await getSql();

  if (!sql) {
    return {
      description: "DATABASE_URL is not configured for the gateway.",
      key: "database",
      status: "degraded",
      title: "Database",
    };
  }

  try {
    await sql`select 1`;
    return {
      description: "Gateway can query the primary Postgres database.",
      key: "database",
      status: "operational",
      title: "Database",
    };
  } catch (error) {
    return {
      description: error instanceof Error ? error.message : "Database health check failed.",
      key: "database",
      status: "degraded",
      title: "Database",
    };
  }
}

async function checkMigrations(): Promise<PublicStatusService> {
  try {
    await assertPlatformConfigSchema();
    return {
      description: "Required platform configuration migrations are present.",
      key: "migrations",
      status: "operational",
      title: "Database migrations",
    };
  } catch (error) {
    return {
      description: error instanceof Error ? error.message : "Migration check failed.",
      key: "migrations",
      status: "degraded",
      title: "Database migrations",
    };
  }
}

async function checkPayments(env?: PlatformConfigEnv): Promise<PublicStatusService> {
  try {
    const providers = await getPublicPaymentProviderStatuses(env);
    const active = providers.filter((provider) => provider.status === "active" && provider.configured);

    return {
      description: active.length > 0
        ? `Active provider(s): ${active.map((provider) => `${provider.label} ${provider.environment}`).join(", ")}.`
        : "No active payment provider is configured.",
      key: "payments",
      status: active.length > 0 ? "operational" : "degraded",
      title: "Payment providers",
    };
  } catch (error) {
    return {
      description: error instanceof Error ? error.message : "Payment provider check failed.",
      key: "payments",
      status: "degraded",
      title: "Payment providers",
    };
  }
}

async function checkOAuth(env?: PlatformConfigEnv): Promise<PublicStatusService> {
  const [google, github] = await Promise.all([
    resolveOAuthProviderConfig("google", env, { includeSecret: false }),
    resolveOAuthProviderConfig("github", env, { includeSecret: false }),
  ]);
  const active = [google, github].filter((provider) => provider.status === "active" && provider.clientId && provider.clientSecretConfigured);

  return {
    description: active.length > 0
      ? `Active OAuth provider(s): ${active.map((provider) => provider.provider).join(", ")}.`
      : "OAuth login providers are not active.",
    key: "oauth",
    status: active.length > 0 ? "operational" : "degraded",
    title: "OAuth login",
  };
}

async function checkEmail(env?: PlatformConfigEnv): Promise<PublicStatusService> {
  const email = await resolveEmailProviderConfig(env, { includeSecrets: false });
  const configured = email.status === "active" && email.provider !== "unconfigured";

  return {
    description: configured
      ? `Email provider active: ${email.provider}.`
      : "Email provider is not active.",
    key: "email",
    status: configured ? "operational" : "degraded",
    title: "Email delivery",
  };
}

async function checkPrompts(): Promise<PublicStatusService> {
  try {
    const models = await listPublicAgentModels();
    const activeCount = models.length;

    return {
      description: activeCount > 0
        ? `${activeCount} active prompt model(s) available.`
        : "No active prompt model is configured.",
      key: "prompts",
      status: activeCount > 0 ? "operational" : "degraded",
      title: "Prompt models",
    };
  } catch (error) {
    return {
      description: error instanceof Error ? error.message : "Prompt model check failed.",
      key: "prompts",
      status: "degraded",
      title: "Prompt models",
    };
  }
}

