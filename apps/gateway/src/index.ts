import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPermissionLevel, type SkillSummary } from "@useskillhub/schema";
import {
  getRegistryStats,
  getSkillManifest,
  listSkillManifests,
  publishSkill,
  searchSkills
} from "./registry.js";
import { getPlatformOverview } from "./platform-overview.js";

type Env = {
  Bindings: {
    SKILLHUB_ENV: string;
    PACKAGES?: R2Bucket;
  };
};

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const app = new Hono<Env>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://useskillhub.com", "https://app.useskillhub.com"],
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"]
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "skillhub-gateway",
    env: c.env?.SKILLHUB_ENV ?? getProcessEnv("SKILLHUB_ENV") ?? "development"
  })
);

app.get("/v1/skills/search", async (c) => {
  const query = c.req.query("q")?.toLowerCase() ?? "";
  const tags = c.req.query("tags")?.split(",").filter(Boolean) ?? [];
  const limit = Number(c.req.query("limit") ?? "20");
  const permissionLevel = c.req.query("permissionLevel") as SkillSummary["permissionLevel"] | undefined;
  const skills = await searchSkills({ query, tags, limit, permissionLevel });

  return c.json({ skills });
});

app.get("/v1/stats", async (c) => c.json(await getRegistryStats()));

app.get("/v1/platform/overview", async (c) => c.json(await getPlatformOverview()));

app.get("/v1/developer/overview", async (c) => {
  const overview = await getPlatformOverview();
  return c.json(overview.developer);
});

app.get("/v1/publisher/overview", async (c) => {
  const overview = await getPlatformOverview();
  return c.json(overview.publisher);
});

app.get("/v1/admin/overview", async (c) => {
  const overview = await getPlatformOverview();
  return c.json(overview.admin);
});

app.get("/v1/skills/:slug", async (c) => {
  const skill = await getSkillManifest(c.req.param("slug"));

  if (!skill) {
    return c.json({ error: "Skill not found." }, 404);
  }

  return c.json(skill);
});

app.post("/v1/skills", async (c) => {
  const authorization = requireAdminToken(c.req.header("Authorization"));

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json()) as { manifest?: unknown };

  if (!body.manifest) {
    return c.json({ error: "Missing manifest." }, 400);
  }

  try {
    return c.json(await publishSkill(body.manifest), 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to publish skill." }, 400);
  }
});

app.post("/mcp", async (c) => {
  const request = (await c.req.json()) as JsonRpcRequest;
  const manifests = await listSkillManifests();

  if (request.method === "tools/list") {
    return rpc(request.id, {
      tools: manifests.map((skill) => ({
        name: skill.name,
        title: skill.displayName,
        description: skill.description,
        inputSchema: skill.inputSchema,
        annotations: {
          tags: skill.tags,
          permissionLevel: getPermissionLevel(skill.permissions)
        }
      }))
    });
  }

  if (request.method === "resources/list") {
    return rpc(request.id, {
      resources: manifests.map((skill) => ({
        uri: `skillhub://skills/${skill.name}`,
        name: skill.displayName,
        description: skill.description,
        mimeType: "application/json"
      }))
    });
  }

  if (request.method === "resources/read") {
    const uri = String(request.params?.uri ?? "");
    const slug = uri.replace("skillhub://skills/", "");
    const skill = manifests.find((item) => item.name === slug);

    if (!skill) {
      return rpcError(request.id, -32004, "Resource not found.");
    }

    return rpc(request.id, {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(skill, null, 2)
        }
      ]
    });
  }

  return rpcError(request.id, -32601, "Method not found.");
});

function readBearer(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

function requireAdminToken(header?: string): { ok: true } | { ok: false; error: string; status: 401 | 503 } {
  const configuredToken = getProcessEnv("SKILLHUB_ADMIN_TOKEN");

  if (!configuredToken) {
    return {
      ok: false,
      error: "Publishing is not configured. Set SKILLHUB_ADMIN_TOKEN.",
      status: 503
    };
  }

  if (readBearer(header) !== configuredToken) {
    return {
      ok: false,
      error: "Invalid admin token.",
      status: 401
    };
  }

  return { ok: true };
}

function rpc(id: JsonRpcRequest["id"], result: unknown) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    result
  });
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message }
  });
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}

export default app;
