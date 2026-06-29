import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;
type RuntimeEnv = {
  SKILLHUB_CONFIG_ENCRYPTION_SECRET?: string;
  SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET?: string;
};

type AgentModelProvider =
  | "anthropic"
  | "custom"
  | "deepseek"
  | "google"
  | "openai"
  | "openrouter";
type AgentModelStatus = "active" | "disabled" | "draft";

type AgentModelInput = {
  apiKey?: unknown;
  baseUrl?: unknown;
  displayName?: unknown;
  id?: unknown;
  isDefault?: unknown;
  maxOutputTokens?: unknown;
  model?: unknown;
  provider?: unknown;
  status?: unknown;
  systemPrompt?: unknown;
  temperature?: unknown;
};

type PromptGenerationInput = {
  content?: unknown;
  language?: unknown;
  modelConfigId?: unknown;
  useCase?: unknown;
};

type ChatCompletionMessage = {
  content?: unknown;
  text?: unknown;
  type?: unknown;
};

export type PublicAgentModel = {
  id: string;
  displayName: string;
  provider: AgentModelProvider;
  model: string;
  isDefault: boolean;
};

export type AdminAgentModel = PublicAgentModel & {
  apiKeyLast4: string;
  baseUrl: string | null;
  createdAt: string;
  maxOutputTokens: number;
  status: AgentModelStatus;
  systemPrompt: string;
  temperature: number;
  updatedAt: string;
};

export type PromptGenerationResult = {
  generationId: string | null;
  model: PublicAgentModel;
  prompt: string;
};

const providers: AgentModelProvider[] = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "openrouter",
  "custom",
];
const statuses: AgentModelStatus[] = ["draft", "active", "disabled"];

export async function listPublicAgentModels(): Promise<PublicAgentModel[]> {
  const sql = await requireSql();

  try {
    const rows = (await sql`
      select
        id::text,
        display_name as "displayName",
        provider,
        model,
        is_default as "isDefault"
      from agent_model_configs
      where status = 'active'
      order by is_default desc, updated_at desc, display_name asc
    `) as PublicAgentModel[];

    return rows;
  } catch (error) {
    if (isMissingAgentSchemaError(error)) {
      return [];
    }

    throw error;
  }
}

export async function listAdminAgentModels(limit = 50): Promise<AdminAgentModel[]> {
  const sql = await requireSql();
  const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 50), 1), 100);

  try {
    return (await sql`
      select
        id::text,
        display_name as "displayName",
        provider,
        model,
        coalesce(api_key_last4, '') as "apiKeyLast4",
        base_url as "baseUrl",
        status,
        is_default as "isDefault",
        temperature::float as temperature,
        max_output_tokens as "maxOutputTokens",
        system_prompt as "systemPrompt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from agent_model_configs
      order by
        case status when 'active' then 0 when 'draft' then 1 else 2 end,
        is_default desc,
        updated_at desc
      limit ${safeLimit}
    `) as AdminAgentModel[];
  } catch (error) {
    if (isMissingAgentSchemaError(error)) {
      return [];
    }

    throw error;
  }
}

export async function upsertAgentModelConfig(
  input: AgentModelInput,
  actorUserId: string | null | undefined,
  env?: RuntimeEnv,
) {
  const sql = await requireSql();
  const id = optionalUuid(input.id);
  const provider = normalizeProvider(input.provider);
  const displayName = normalizeRequiredText(input.displayName, "displayName", 120);
  const model = normalizeRequiredText(input.model, "model", 160);
  const apiKey = normalizeNullableText(input.apiKey, 2000);
  const baseUrl = normalizeBaseUrl(input.baseUrl, provider);
  const status = normalizeStatus(input.status);
  const isDefault = normalizeBoolean(input.isDefault);
  const temperature = normalizeTemperature(input.temperature);
  const maxOutputTokens = normalizeMaxOutputTokens(input.maxOutputTokens);
  const systemPrompt = normalizeRequiredText(input.systemPrompt, "systemPrompt", 2000);

  try {
    return await sql.begin(async (tx: Sql) => {
    const encryptedKey = apiKey
      ? await encryptAgentApiKey(apiKey, env)
      : await getExistingEncryptedAgentApiKey(tx, id);

    if (isDefault && status === "active") {
      await tx`
        update agent_model_configs
        set is_default = false,
            updated_at = now()
        where is_default = true
          and status = 'active'
          and (${id}::uuid is null or id <> ${id})
      `;
    }

    const rows = (await tx`
      insert into agent_model_configs (
        id,
        provider,
        display_name,
        model,
        api_key,
        api_key_ciphertext,
        api_key_iv,
        api_key_tag,
        api_key_last4,
        base_url,
        status,
        is_default,
        temperature,
        max_output_tokens,
        system_prompt,
        created_by_user_id,
        updated_at
      )
      values (
        coalesce(${id}::uuid, gen_random_uuid()),
        ${provider},
        ${displayName},
        ${model},
        null,
        ${encryptedKey.ciphertext},
        ${encryptedKey.iv},
        ${encryptedKey.tag},
        ${encryptedKey.last4},
        ${baseUrl},
        ${status},
        ${isDefault},
        ${temperature},
        ${maxOutputTokens},
        ${systemPrompt},
        ${actorUserId ?? null},
        now()
      )
      on conflict (id) do update set
        provider = excluded.provider,
        display_name = excluded.display_name,
        model = excluded.model,
        api_key = null,
        api_key_ciphertext = excluded.api_key_ciphertext,
        api_key_iv = excluded.api_key_iv,
        api_key_tag = excluded.api_key_tag,
        api_key_last4 = excluded.api_key_last4,
        base_url = excluded.base_url,
        status = excluded.status,
        is_default = excluded.is_default,
        temperature = excluded.temperature,
        max_output_tokens = excluded.max_output_tokens,
        system_prompt = excluded.system_prompt,
        updated_at = now()
      returning
        id::text,
        display_name as "displayName",
        provider,
        model,
        coalesce(api_key_last4, '') as "apiKeyLast4",
        base_url as "baseUrl",
        status,
        is_default as "isDefault",
        temperature::float as temperature,
        max_output_tokens as "maxOutputTokens",
        system_prompt as "systemPrompt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as AdminAgentModel[];
    const config = rows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        'agent.model_config.upserted',
        'agent_model_config',
        ${config.id},
        'Agent model configuration changed.',
        ${tx.json({
          displayName,
          isDefault: config.isDefault,
          model,
          provider,
          status,
        })}
      )
    `;

      return config;
    });
  } catch (error) {
    if (isMissingAgentSchemaError(error)) {
      throw new Error("Agent model database migration is required before saving model configuration.");
    }

    throw error;
  }
}

export async function generateAgentPrompt(
  input: PromptGenerationInput,
  actorUserId: string | null | undefined,
  env?: RuntimeEnv,
): Promise<PromptGenerationResult> {
  const sql = await requireSql();
  const content = normalizeRequiredText(input.content, "content", 12000);
  const useCase = normalizeNullableText(input.useCase, 160);
  const language = normalizeLanguage(input.language);
  const config = await getGenerationModelConfig(sql, optionalUuid(input.modelConfigId), env);
  const startedAt = Date.now();

  try {
    const prompt = await callModelForPrompt(config, {
      content,
      language,
      useCase,
    });
    const latencyMs = Date.now() - startedAt;
    const generationRows = (await sql`
      insert into agent_prompt_generations (
        model_config_id,
        created_by_user_id,
        provider,
        model,
        input_content,
        use_case,
        language,
        output_prompt,
        status,
        latency_ms,
        request_metadata
      )
      values (
        ${config.id},
        ${actorUserId ?? null},
        ${config.provider},
        ${config.model},
        ${content},
        ${useCase},
        ${language},
        ${prompt},
        'success',
        ${latencyMs},
        ${sql.json({
          maxOutputTokens: config.maxOutputTokens,
          temperature: config.temperature,
        })}
      )
      returning id::text
    `) as Array<{ id: string }>;

    return {
      generationId: generationRows[0]?.id ?? null,
      model: toPublicModel(config),
      prompt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate prompt.";

    await sql`
      insert into agent_prompt_generations (
        model_config_id,
        created_by_user_id,
        provider,
        model,
        input_content,
        use_case,
        language,
        status,
        error_message,
        latency_ms,
        request_metadata
      )
      values (
        ${config.id},
        ${actorUserId ?? null},
        ${config.provider},
        ${config.model},
        ${content},
        ${useCase},
        ${language},
        'error',
        ${message.slice(0, 1000)},
        ${Date.now() - startedAt},
        ${sql.json({
          maxOutputTokens: config.maxOutputTokens,
          temperature: config.temperature,
        })}
      )
    `;

    throw new Error(message);
  }
}

async function getGenerationModelConfig(
  sql: Sql,
  requestedId: string | null,
  env?: RuntimeEnv,
) {
  const rows = requestedId
    ? ((await sql`
        select
          id::text,
          display_name as "displayName",
          provider,
          model,
          api_key_ciphertext as "apiKeyCiphertext",
          api_key_iv as "apiKeyIv",
          api_key_tag as "apiKeyTag",
          api_key_last4 as "apiKeyLast4",
          base_url as "baseUrl",
          status,
          is_default as "isDefault",
          temperature::float as temperature,
          max_output_tokens as "maxOutputTokens",
          system_prompt as "systemPrompt"
        from agent_model_configs
        where id = ${requestedId}
          and status = 'active'
        limit 1
      `) as EncryptedAgentModelConfig[])
    : ((await sql`
        select
          id::text,
          display_name as "displayName",
          provider,
          model,
          api_key_ciphertext as "apiKeyCiphertext",
          api_key_iv as "apiKeyIv",
          api_key_tag as "apiKeyTag",
          api_key_last4 as "apiKeyLast4",
          base_url as "baseUrl",
          status,
          is_default as "isDefault",
          temperature::float as temperature,
          max_output_tokens as "maxOutputTokens",
          system_prompt as "systemPrompt"
        from agent_model_configs
        where status = 'active'
        order by is_default desc, updated_at desc
        limit 1
      `) as EncryptedAgentModelConfig[]);
  const config = rows[0];

  if (!config) {
    throw new Error(
      requestedId
        ? "Selected model is not active or no longer exists."
        : "No active agent model is configured.",
    );
  }

  return {
    ...config,
    apiKey: await decryptAgentApiKey(config, env),
  };
}

type EncryptedAgentApiKey = {
  ciphertext: string;
  iv: string;
  tag: string;
  last4: string;
};

type EncryptedAgentModelConfig = AdminAgentModel & {
  apiKeyCiphertext: string | null;
  apiKeyIv: string | null;
  apiKeyTag: string | null;
};

type InternalAgentModelConfig = Omit<EncryptedAgentModelConfig, "apiKeyCiphertext" | "apiKeyIv" | "apiKeyTag"> & {
  apiKey: string;
};

async function callModelForPrompt(
  config: InternalAgentModelConfig,
  input: { content: string; language: string; useCase: string | null },
) {
  if (config.provider === "anthropic") {
    return callAnthropicModel(config, input);
  }

  return callOpenAICompatibleModel(config, input);
}

async function callOpenAICompatibleModel(
  config: InternalAgentModelConfig,
  input: { content: string; language: string; useCase: string | null },
) {
  const response = await fetch(`${openAICompatibleBaseUrl(config).replace(/\/+$/, "")}/chat/completions`, {
    body: JSON.stringify({
      max_tokens: config.maxOutputTokens,
      messages: [
        {
          role: "system",
          content: config.systemPrompt,
        },
        {
          role: "user",
          content: buildPromptArchitectInstruction(input),
        },
      ],
      model: config.model,
      temperature: config.temperature,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(config.provider === "openrouter"
        ? {
            "HTTP-Referer": "https://useskillhub.com",
            "X-Title": "SkillHub Prompt Assistant",
          }
        : {}),
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    choices?: Array<{
      message?: ChatCompletionMessage;
      text?: string;
    }>;
    error?: { message?: string } | string;
  };

  if (!response.ok) {
    throw new Error(modelErrorMessage(payload.error, response.status));
  }

  const content = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.text;
  const text = typeof content === "string" ? content.trim() : "";

  if (!text) {
    throw new Error("Model returned an empty prompt.");
  }

  return text;
}

async function callAnthropicModel(
  config: InternalAgentModelConfig,
  input: { content: string; language: string; useCase: string | null },
) {
  const response = await fetch(`${anthropicBaseUrl(config).replace(/\/+$/, "")}/messages`, {
    body: JSON.stringify({
      max_tokens: config.maxOutputTokens,
      messages: [
        {
          role: "user",
          content: buildPromptArchitectInstruction(input),
        },
      ],
      model: config.model,
      system: config.systemPrompt,
      temperature: config.temperature,
    }),
    headers: {
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    content?: Array<ChatCompletionMessage>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(modelErrorMessage(payload.error, response.status));
  }

  const text = (payload.content ?? [])
    .map((item) => (typeof item.text === "string" ? item.text : ""))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Model returned an empty prompt.");
  }

  return text;
}

function buildPromptArchitectInstruction(input: {
  content: string;
  language: string;
  useCase: string | null;
}) {
  return [
    "Turn the following user content into practical AI prompt suggestions.",
    "Return 3 prompt options. Each option should include a title, the prompt text, and a short note on when to use it.",
    "Keep the output directly usable. Avoid generic explanations.",
    `Output language: ${input.language}.`,
    input.useCase ? `User scenario: ${input.useCase}.` : null,
    "",
    "User content:",
    input.content,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function openAICompatibleBaseUrl(config: InternalAgentModelConfig) {
  if (config.baseUrl) {
    return config.baseUrl;
  }

  if (config.provider === "deepseek") {
    return "https://api.deepseek.com/v1";
  }

  if (config.provider === "google") {
    return "https://generativelanguage.googleapis.com/v1beta/openai";
  }

  if (config.provider === "openrouter") {
    return "https://openrouter.ai/api/v1";
  }

  return "https://api.openai.com/v1";
}

function anthropicBaseUrl(config: InternalAgentModelConfig) {
  return config.baseUrl ?? "https://api.anthropic.com/v1";
}

function toPublicModel(config: Pick<AdminAgentModel, "displayName" | "id" | "isDefault" | "model" | "provider">): PublicAgentModel {
  return {
    id: config.id,
    displayName: config.displayName,
    provider: config.provider,
    model: config.model,
    isDefault: config.isDefault,
  };
}

function modelErrorMessage(error: unknown, status: number) {
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();
    if (message) {
      return message;
    }
  }

  return `Model provider returned HTTP ${status}.`;
}

async function getExistingEncryptedAgentApiKey(
  sql: Sql,
  id: string | null,
): Promise<EncryptedAgentApiKey> {
  if (!id) {
    throw new Error("apiKey is required when creating an agent model.");
  }

  const rows = (await sql`
    select
      api_key_ciphertext as ciphertext,
      api_key_iv as iv,
      api_key_tag as tag,
      api_key_last4 as last4
    from agent_model_configs
    where id = ${id}
    limit 1
  `) as Array<Partial<EncryptedAgentApiKey>>;
  const existing = rows[0];

  if (
    !existing?.ciphertext ||
    !existing.iv ||
    !existing.tag ||
    !existing.last4
  ) {
    throw new Error("apiKey is required until this model has an encrypted key.");
  }

  return {
    ciphertext: existing.ciphertext,
    iv: existing.iv,
    last4: existing.last4,
    tag: existing.tag,
  };
}

async function encryptAgentApiKey(
  apiKey: string,
  env?: RuntimeEnv,
): Promise<EncryptedAgentApiKey> {
  const cryptoApi = requireCryptoApi();
  const iv = new Uint8Array(12);
  cryptoApi.getRandomValues(iv);
  const encoded = new TextEncoder().encode(apiKey);
  const encrypted = new Uint8Array(
    await cryptoApi.subtle.encrypt(
      {
        iv,
        name: "AES-GCM",
      },
      await agentEncryptionKey(env),
      encoded,
    ),
  );
  const tagBytes = encrypted.slice(-16);
  const ciphertextBytes = encrypted.slice(0, -16);

  return {
    ciphertext: bytesToBase64(ciphertextBytes),
    iv: bytesToBase64(iv),
    last4: apiKey.slice(-4),
    tag: bytesToBase64(tagBytes),
  };
}

async function decryptAgentApiKey(
  config: EncryptedAgentModelConfig,
  env?: RuntimeEnv,
) {
  if (!config.apiKeyCiphertext || !config.apiKeyIv || !config.apiKeyTag) {
    throw new Error(
      "Agent model key is not encrypted. Re-save the model with an API key.",
    );
  }

  const cryptoApi = requireCryptoApi();
  const ciphertext = base64ToBytes(config.apiKeyCiphertext);
  const tag = base64ToBytes(config.apiKeyTag);
  const iv = base64ToBytes(config.apiKeyIv);
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  try {
    const decrypted = await cryptoApi.subtle.decrypt(
      {
        iv,
        name: "AES-GCM",
      },
      await agentEncryptionKey(env),
      combined,
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Agent model key could not be decrypted.");
  }
}

let cachedAgentEncryptionSecret: string | null = null;
let cachedAgentEncryptionKey: CryptoKey | null = null;

async function agentEncryptionKey(env?: RuntimeEnv) {
  const secret = configured(
    env?.SKILLHUB_CONFIG_ENCRYPTION_SECRET ?? env?.SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET,
    "SKILLHUB_CONFIG_ENCRYPTION_SECRET",
    "SKILLHUB_AGENT_KEY_ENCRYPTION_SECRET",
  );

  if (!secret || secret.length < 32) {
    throw new Error(
      "Platform configuration encryption secret is missing. Set SKILLHUB_CONFIG_ENCRYPTION_SECRET with at least 32 characters.",
    );
  }

  if (cachedAgentEncryptionKey && cachedAgentEncryptionSecret === secret) {
    return cachedAgentEncryptionKey;
  }

  const cryptoApi = requireCryptoApi();
  const digest = await cryptoApi.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  cachedAgentEncryptionKey = await cryptoApi.subtle.importKey(
    "raw",
    digest,
    {
      name: "AES-GCM",
    },
    false,
    ["decrypt", "encrypt"],
  );
  cachedAgentEncryptionSecret = secret;

  return cachedAgentEncryptionKey;
}

function requireCryptoApi(): Crypto {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto is required for agent model key encryption.");
  }

  return cryptoApi;
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

function normalizeProvider(value: unknown): AgentModelProvider {
  const provider = String(value ?? "openai").trim().toLowerCase();

  if (!providers.includes(provider as AgentModelProvider)) {
    throw new Error("Provider must be openai, anthropic, google, deepseek, openrouter, or custom.");
  }

  return provider as AgentModelProvider;
}

function normalizeStatus(value: unknown): AgentModelStatus {
  const status = String(value ?? "draft").trim().toLowerCase();

  if (!statuses.includes(status as AgentModelStatus)) {
    throw new Error("Model status must be draft, active, or disabled.");
  }

  return status as AgentModelStatus;
}

function normalizeRequiredText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function normalizeNullableText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeLanguage(value: unknown) {
  const language = String(value ?? "Chinese").trim();
  return language ? language.slice(0, 80) : "Chinese";
}

function normalizeBaseUrl(value: unknown, provider: AgentModelProvider) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  try {
    const url = new URL(text);

    if (url.protocol !== "https:" && provider !== "custom") {
      throw new Error("Base URL must use https.");
    }

    return url.toString().replace(/\/+$/, "");
  } catch (error) {
    if (error instanceof Error && error.message === "Base URL must use https.") {
      throw error;
    }

    throw new Error("Base URL must be a valid URL.");
  }
}

function normalizeBoolean(value: unknown) {
  if (value === true || value === "true" || value === "1" || value === "on") {
    return true;
  }

  return false;
}

function normalizeTemperature(value: unknown) {
  const temperature = Number(value ?? 0.7);

  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error("Temperature must be between 0 and 2.");
  }

  return Number(temperature.toFixed(2));
}

function normalizeMaxOutputTokens(value: unknown) {
  const tokens = Math.trunc(Number(value ?? 900));

  if (!Number.isFinite(tokens) || tokens < 128 || tokens > 8192) {
    throw new Error("Max output tokens must be between 128 and 8192.");
  }

  return tokens;
}

function optionalUuid(value: unknown) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new Error("Model config id is invalid.");
  }

  return text;
}

function isMissingAgentSchemaError(error: unknown) {
  const text = errorDetails(error).toLowerCase();
  const code = errorCode(error);

  if (code !== "42P01" && !text.includes("relation")) {
    return false;
  }

  return text.includes("agent_model_configs");
}

function errorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return "";
}

function errorDetails(error: unknown) {
  const parts: string[] = [];

  if (error instanceof Error) {
    parts.push(error.message);
  } else if (error !== undefined && error !== null) {
    parts.push(String(error));
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    for (const key of ["code", "detail", "hint", "schema_name", "table_name"]) {
      const value = record[key];

      if (value !== undefined && value !== null) {
        parts.push(String(value));
      }
    }
  }

  return parts.join(" ");
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for agent prompt operations.");
  }

  return sql;
}
