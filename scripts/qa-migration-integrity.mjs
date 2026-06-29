import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const migrationsDir = join(root, "supabase", "migrations");
const requiredMigrations = [
  "040_platform_provider_configs.sql",
  "041_paypal_commerce.sql",
];
const requiredSnippets = [
  ["040_platform_provider_configs.sql", "platform_provider_configs"],
  ["040_platform_provider_configs.sql", "platform_runtime_settings"],
  ["041_paypal_commerce.sql", "paypal_orders"],
  ["041_paypal_commerce.sql", "paypal_captures"],
  ["041_paypal_commerce.sql", "paypal_subscriptions"],
  ["041_paypal_commerce.sql", "paypal_webhook_events"],
  ["041_paypal_commerce.sql", "provider_type in ('oauth', 'email', 'stripe', 'paypal')"],
];

const files = new Set(readdirSync(migrationsDir));
const findings = [];

for (const migration of requiredMigrations) {
  if (!files.has(migration)) {
    findings.push(`Missing migration: ${migration}`);
  }
}

for (const [migration, snippet] of requiredSnippets) {
  const path = join(migrationsDir, migration);

  if (!existsSync(path)) {
    continue;
  }

  const source = readFileSync(path, "utf8");
  if (!source.includes(snippet)) {
    findings.push(`${migration}: missing ${snippet}`);
  }
}

if (findings.length > 0) {
  console.error("Migration integrity check failed.");
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Migration integrity check passed.");

