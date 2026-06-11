export type JsonSchema = {
  type?: string;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: string[];
  format?: string;
  minimum?: number;
  minLength?: number;
  description?: string;
  [key: string]: unknown;
};

export type SkillRuntime =
  | {
      type: "http";
      entrypoint: string;
    }
  | {
      type: "mcp";
      serverUrl: string;
    }
  | {
      type: "local";
      command: string;
      args?: string[];
    };

export type SkillBillingModel = "free" | "per_call" | "subscription";

export type SkillPermissions = {
  network: boolean;
  browser: boolean;
  filesystem: "none" | "read" | "write";
  secrets: string[];
};

export type SkillManifest = {
  schemaVersion: "0.1";
  name: string;
  displayName: string;
  version: string;
  description: string;
  author?: {
    name: string;
    url?: string;
  };
  tags: string[];
  runtime: SkillRuntime;
  permissions: SkillPermissions;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
};

export type SkillSummary = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  tags: string[];
  version: string;
  verificationStatus: "draft" | "submitted" | "verified" | "deprecated" | "rejected" | "suspended";
  permissionLevel: "low" | "medium" | "high";
  runtimeType?: SkillRuntime["type"];
  billingModel?: SkillBillingModel;
  installCount?: number;
  invocationCount?: number;
  successRate?: number | null;
  avgLatencyMs?: number | null;
  averageRating?: number | null;
  feedbackCount?: number;
  updatedAt?: string;
};

export const skillManifestJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://useskillhub.com/schemas/skillhub.schema.json",
  title: "SkillHub Manifest",
  type: "object",
  required: [
    "schemaVersion",
    "name",
    "displayName",
    "version",
    "description",
    "tags",
    "runtime",
    "permissions",
    "inputSchema",
    "outputSchema"
  ],
  properties: {
    schemaVersion: { const: "0.1" },
    name: {
      type: "string",
      pattern: "^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$"
    },
    displayName: { type: "string", minLength: 2 },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.-]+)?$" },
    description: { type: "string", minLength: 10 },
    author: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        url: { type: "string", format: "uri" }
      }
    },
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 1
    },
    runtime: {
      oneOf: [
        {
          type: "object",
          required: ["type", "entrypoint"],
          properties: {
            type: { const: "http" },
            entrypoint: { type: "string", format: "uri" }
          }
        },
        {
          type: "object",
          required: ["type", "serverUrl"],
          properties: {
            type: { const: "mcp" },
            serverUrl: { type: "string", format: "uri" }
          }
        },
        {
          type: "object",
          required: ["type", "command"],
          properties: {
            type: { const: "local" },
            command: { type: "string" },
            args: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      ]
    },
    permissions: {
      type: "object",
      required: ["network", "browser", "filesystem", "secrets"],
      properties: {
        network: { type: "boolean" },
        browser: { type: "boolean" },
        filesystem: { enum: ["none", "read", "write"] },
        secrets: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    inputSchema: { type: "object" },
    outputSchema: { type: "object" }
  },
  additionalProperties: false
} as const;

export function getPermissionLevel(permissions: SkillPermissions): SkillSummary["permissionLevel"] {
  if (permissions.filesystem === "write" || permissions.secrets.length > 0) {
    return "high";
  }

  if (permissions.browser || permissions.filesystem === "read") {
    return "medium";
  }

  return permissions.network ? "medium" : "low";
}

export function assertSkillManifest(value: unknown): asserts value is SkillManifest {
  if (!value || typeof value !== "object") {
    throw new Error("Manifest must be an object.");
  }

  const manifest = value as Partial<SkillManifest>;
  const required: Array<keyof SkillManifest> = [
    "schemaVersion",
    "name",
    "displayName",
    "version",
    "description",
    "tags",
    "runtime",
    "permissions",
    "inputSchema",
    "outputSchema"
  ];

  for (const key of required) {
    if (manifest[key] === undefined) {
      throw new Error(`Manifest is missing required field: ${key}`);
    }
  }

  if (manifest.schemaVersion !== "0.1") {
    throw new Error("Unsupported schemaVersion. Expected 0.1.");
  }

  // Type validations
  if (typeof manifest.name !== "string" || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(manifest.name)) {
    throw new Error("Manifest name must be a lowercase slug (a-z, 0-9, hyphens, no leading/trailing hyphen).");
  }

  if (typeof manifest.displayName !== "string" || manifest.displayName.trim().length === 0) {
    throw new Error("Manifest displayName must be a non-empty string.");
  }

  if (typeof manifest.version !== "string" || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    throw new Error("Manifest version must follow semver (e.g. 1.0.0).");
  }

  if (typeof manifest.description !== "string" || manifest.description.trim().length === 0) {
    throw new Error("Manifest description must be a non-empty string.");
  }

  if (!Array.isArray(manifest.tags) || manifest.tags.length === 0) {
    throw new Error("Manifest tags must contain at least one tag.");
  }

  for (const tag of manifest.tags) {
    if (typeof tag !== "string") {
      throw new Error("Each manifest tag must be a string.");
    }
  }

  // Runtime validation
  const runtime = manifest.runtime as Record<string, unknown> | undefined;
  if (!runtime || typeof runtime !== "object") {
    throw new Error("Manifest runtime must be an object.");
  }
  const validRuntimeTypes = ["http", "mcp", "local"];
  if (!validRuntimeTypes.includes(runtime.type as string)) {
    throw new Error(`Manifest runtime.type must be one of: ${validRuntimeTypes.join(", ")}.`);
  }
  if (runtime.type === "http" && typeof runtime.entrypoint !== "string") {
    throw new Error("HTTP runtime requires a string entrypoint.");
  }
  if (runtime.type === "mcp" && typeof runtime.serverUrl !== "string") {
    throw new Error("MCP runtime requires a string serverUrl.");
  }
  if (runtime.type === "local" && typeof runtime.command !== "string") {
    throw new Error("Local runtime requires a string command.");
  }

  // Permissions validation
  const permissions = manifest.permissions as Record<string, unknown> | undefined;
  if (!permissions || typeof permissions !== "object") {
    throw new Error("Manifest permissions must be an object.");
  }
  if (typeof permissions.network !== "boolean") {
    throw new Error("Manifest permissions.network must be a boolean.");
  }
  if (typeof permissions.browser !== "boolean") {
    throw new Error("Manifest permissions.browser must be a boolean.");
  }
  const validFs = ["none", "read", "write"];
  if (!validFs.includes(permissions.filesystem as string)) {
    throw new Error(`Manifest permissions.filesystem must be one of: ${validFs.join(", ")}.`);
  }
  if (!Array.isArray(permissions.secrets)) {
    throw new Error("Manifest permissions.secrets must be an array.");
  }

  // Schema validations
  if (!manifest.inputSchema || typeof manifest.inputSchema !== "object") {
    throw new Error("Manifest inputSchema must be a JSON Schema object.");
  }
  if (!manifest.outputSchema || typeof manifest.outputSchema !== "object") {
    throw new Error("Manifest outputSchema must be a JSON Schema object.");
  }
}
