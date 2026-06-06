import type { PublishFormCopy } from "@/lib/publish-copy";

export type PreflightState = "passed" | "warning" | "blocked";
export type PermissionRisk = "low" | "medium" | "high";

export type ManifestPreflightCheck = {
  detail: string;
  id: "json" | "identity" | "runtime" | "schemas" | "permissions" | "commercial";
  label: string;
  state: PreflightState;
};

export type ManifestPreflightResult = {
  blockerCount: number;
  canSaveDraft: boolean;
  checks: ManifestPreflightCheck[];
  displayName: string;
  parsed: unknown;
  passedCount: number;
  permissionRisk: PermissionRisk;
  readinessLabel: string;
  runtime: string;
  score: number;
  slug: string;
  tagCount: number;
  version: string;
  warningCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toText(value: unknown, fallback: string) {
  return isNonEmptyString(value) ? value : fallback;
}

function isValidUrl(value: unknown) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isHttpsUrl(value: unknown) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function countSchemaProperties(schema: unknown) {
  if (!isRecord(schema)) {
    return 0;
  }

  const properties = isRecord(schema.properties) ? schema.properties : {};
  return Object.keys(properties).length;
}

function getPermissionRisk(permissions: Record<string, unknown>): PermissionRisk {
  const secrets = Array.isArray(permissions.secrets) ? permissions.secrets : [];

  if (permissions.filesystem === "write" || secrets.length > 0) {
    return "high";
  }

  if (permissions.filesystem === "read" || permissions.browser === true || permissions.network === true) {
    return "medium";
  }

  return "low";
}

function replaceTokens(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function parseManifest(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export function analyzeManifestPreflight(manifestText: string, labels: PublishFormCopy): ManifestPreflightResult {
  const parsed = parseManifest(manifestText);
  const manifest = isRecord(parsed) ? parsed : {};
  const runtime = isRecord(manifest.runtime) ? manifest.runtime : {};
  const permissions = isRecord(manifest.permissions) ? manifest.permissions : {};
  const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
  const secrets = Array.isArray(permissions.secrets) ? permissions.secrets : [];
  const runtimeType = toText(runtime.type, labels.unknown).toLowerCase();
  const runtimeEndpoint = runtimeType === "mcp" ? runtime.serverUrl : runtimeType === "local" ? runtime.command : runtime.entrypoint;
  const schemaPropertyCount = countSchemaProperties(manifest.inputSchema) + countSchemaProperties(manifest.outputSchema);
  const permissionRisk = getPermissionRisk(permissions);
  const invalidSecretHandles = secrets.some((secret) => !isNonEmptyString(secret) || secret.trim() === "*");

  const hasValidJson = parsed !== undefined && isRecord(parsed);
  const hasIdentity =
    hasValidJson &&
    manifest.schemaVersion === "0.1" &&
    isNonEmptyString(manifest.name) &&
    /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(manifest.name) &&
    isNonEmptyString(manifest.displayName) &&
    isNonEmptyString(manifest.description) &&
    isNonEmptyString(manifest.version) &&
    /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(manifest.version) &&
    tags.length > 0;
  const hasReviewableDescription = isNonEmptyString(manifest.description) && manifest.description.trim().length >= 40;
  const hasRuntime =
    (runtimeType === "http" && isValidUrl(runtime.entrypoint)) ||
    (runtimeType === "mcp" && isValidUrl(runtime.serverUrl)) ||
    (runtimeType === "local" && isNonEmptyString(runtime.command));
  const hasSchemas =
    isRecord(manifest.inputSchema) &&
    isRecord(manifest.outputSchema) &&
    manifest.inputSchema.type === "object" &&
    manifest.outputSchema.type === "object";
  const hasPermissions =
    isRecord(manifest.permissions) &&
    typeof permissions.network === "boolean" &&
    typeof permissions.browser === "boolean" &&
    ["none", "read", "write"].includes(String(permissions.filesystem)) &&
    Array.isArray(permissions.secrets);

  const checks: ManifestPreflightCheck[] = [
    {
      detail: hasValidJson ? labels.checks.validJson.ok : labels.checks.validJson.fail,
      id: "json",
      label: labels.checks.validJson.label,
      state: hasValidJson ? "passed" : "blocked"
    },
    {
      detail: hasIdentity ? (hasReviewableDescription ? labels.checks.identity.ok : labels.checks.identity.short) : labels.checks.identity.detail,
      id: "identity",
      label: labels.checks.identity.label,
      state: hasIdentity ? (hasReviewableDescription ? "passed" : "warning") : "blocked"
    },
    {
      detail: hasRuntime
        ? runtimeType === "local"
          ? labels.checks.runtime.local
          : isHttpsUrl(runtimeEndpoint)
            ? replaceTokens(labels.checks.runtime.ok, { runtime: runtimeType.toUpperCase() })
            : labels.checks.runtime.insecure
        : labels.checks.runtime.fallback,
      id: "runtime",
      label: labels.checks.runtime.label,
      state: hasRuntime ? (runtimeType === "local" || !isHttpsUrl(runtimeEndpoint) ? "warning" : "passed") : "blocked"
    },
    {
      detail: hasSchemas ? (schemaPropertyCount > 0 ? labels.checks.schemas.ok : labels.checks.schemas.empty) : labels.checks.schemas.detail,
      id: "schemas",
      label: labels.checks.schemas.label,
      state: hasSchemas ? (schemaPropertyCount > 0 ? "passed" : "warning") : "blocked"
    },
    {
      detail: hasPermissions
        ? invalidSecretHandles
          ? labels.checks.permissions.invalidSecrets
          : permissionRisk === "high"
            ? labels.checks.permissions.highRisk
            : replaceTokens(labels.checks.permissions.detail, {
                filesystem: String(permissions.filesystem ?? labels.unknown),
                secrets: String(secrets.length)
              })
        : labels.checks.permissions.missing,
      id: "permissions",
      label: labels.checks.permissions.label,
      state: hasPermissions ? (invalidSecretHandles || permissionRisk === "high" ? "warning" : "passed") : "blocked"
    },
    {
      detail: labels.checks.commercial.detail,
      id: "commercial",
      label: labels.checks.commercial.label,
      state: "warning"
    }
  ];

  const blockerCount = checks.filter((check) => check.state === "blocked").length;
  const warningCount = checks.filter((check) => check.state === "warning").length;
  const passedCount = checks.filter((check) => check.state === "passed").length;

  return {
    blockerCount,
    canSaveDraft: hasValidJson && blockerCount === 0,
    checks,
    displayName: toText(manifest.displayName, labels.untitledSkill),
    parsed,
    passedCount,
    permissionRisk,
    readinessLabel:
      blockerCount > 0 ? labels.readiness.blocked : warningCount > 0 ? labels.readiness.warning : labels.readiness.ready,
    runtime: runtimeType,
    score: Math.round((passedCount / checks.length) * 100),
    slug: toText(manifest.name, "missing-name"),
    tagCount: tags.length,
    version: toText(manifest.version, "0.0.0"),
    warningCount
  };
}
