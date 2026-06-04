import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";

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

const demoSkills: SkillManifest[] = [
  {
    schemaVersion: "0.1",
    name: "browser-research",
    displayName: "Browser Research",
    version: "0.1.0",
    description: "Research a web topic and return concise findings with source URLs.",
    author: {
      name: "SkillHub",
      url: "https://useskillhub.com"
    },
    tags: ["research", "browser", "citations"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/browser-research"
    },
    permissions: {
      network: true,
      browser: true,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 3 }
      }
    },
    outputSchema: {
      type: "object",
      required: ["summary", "sources"],
      properties: {
        summary: { type: "string" },
        sources: {
          type: "array",
          items: { type: "string", format: "uri" }
        }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "manifest-review",
    displayName: "Manifest Review",
    version: "0.1.0",
    description: "Review a SkillHub manifest for completeness, risk, and publish readiness.",
    tags: ["review", "schema", "trust"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/manifest-review"
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["manifest"],
      properties: {
        manifest: { type: "object" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["status", "findings"],
      properties: {
        status: { type: "string", enum: ["pass", "needs_changes"] },
        findings: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  }
];

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

app.get("/v1/skills/search", (c) => {
  const query = c.req.query("q")?.toLowerCase() ?? "";
  const tags = c.req.query("tags")?.split(",").filter(Boolean) ?? [];
  const limit = Number(c.req.query("limit") ?? "20");
  const permissionLevel = c.req.query("permissionLevel") as SkillSummary["permissionLevel"] | undefined;

  const skills = demoSkills
    .map(toSummary)
    .filter((skill) => {
      const queryMatch =
        !query ||
        skill.slug.includes(query) ||
        skill.displayName.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.tags.some((tag) => tag.includes(query));

      const tagMatch = tags.length === 0 || tags.every((tag) => skill.tags.includes(tag));
      const permissionMatch = !permissionLevel || skill.permissionLevel === permissionLevel;

      return queryMatch && tagMatch && permissionMatch;
    })
    .slice(0, Number.isFinite(limit) ? limit : 20);

  return c.json({ skills });
});

app.get("/v1/skills/:slug", (c) => {
  const skill = demoSkills.find((item) => item.name === c.req.param("slug"));

  if (!skill) {
    return c.json({ error: "Skill not found." }, 404);
  }

  return c.json(skill);
});

app.post("/v1/skills", async (c) => {
  const apiKey = readBearer(c.req.header("Authorization"));

  if (!apiKey) {
    return c.json({ error: "Missing API key." }, 401);
  }

  const body = (await c.req.json()) as { manifest?: SkillManifest };

  if (!body.manifest) {
    return c.json({ error: "Missing manifest." }, 400);
  }

  return c.json(
    {
      id: crypto.randomUUID(),
      slug: body.manifest.name,
      status: "draft"
    },
    201
  );
});

app.post("/mcp", async (c) => {
  const request = (await c.req.json()) as JsonRpcRequest;

  if (request.method === "tools/list") {
    return rpc(request.id, {
      tools: demoSkills.map((skill) => ({
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
      resources: demoSkills.map((skill) => ({
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
    const skill = demoSkills.find((item) => item.name === slug);

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

function toSummary(skill: SkillManifest): SkillSummary {
  return {
    id: skill.name,
    slug: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    tags: skill.tags,
    version: skill.version,
    verificationStatus: skill.name === "browser-research" ? "verified" : "draft",
    permissionLevel: getPermissionLevel(skill.permissions)
  };
}

function readBearer(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
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
