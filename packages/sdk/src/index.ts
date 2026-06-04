import type { SkillManifest, SkillSummary } from "@useskillhub/schema";

export type SkillHubClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type SearchSkillsOptions = {
  query?: string;
  tags?: string[];
  limit?: number;
  permissionLevel?: "low" | "medium" | "high";
};

export type InvokeSkillOptions = {
  version?: string;
};

export type SkillInvocationResult<TOutput = unknown> = {
  invocationId: string;
  projectSlug: string;
  skillSlug: string;
  version: string;
  status: "success" | "error" | "blocked";
  latencyMs: number;
  billable: boolean;
  amountCents: number;
  currency: string;
  output: TOutput;
  error?: string;
};

export class SkillHubClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: SkillHubClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api.useskillhub.com";
    this.fetcher = options.fetch ?? fetch;
  }

  async searchSkills(options: SearchSkillsOptions = {}): Promise<SkillSummary[]> {
    const url = new URL("/v1/skills/search", this.baseUrl);

    if (options.query) {
      url.searchParams.set("q", options.query);
    }

    if (options.tags?.length) {
      url.searchParams.set("tags", options.tags.join(","));
    }

    if (options.limit) {
      url.searchParams.set("limit", String(options.limit));
    }

    if (options.permissionLevel) {
      url.searchParams.set("permissionLevel", options.permissionLevel);
    }

    const response = await this.request(url, { method: "GET" });
    const payload = (await response.json()) as { skills: SkillSummary[] };
    return payload.skills;
  }

  async getSkill(slug: string): Promise<SkillManifest> {
    const response = await this.request(new URL(`/v1/skills/${slug}`, this.baseUrl), {
      method: "GET"
    });

    return (await response.json()) as SkillManifest;
  }

  async publishSkill(manifest: SkillManifest): Promise<{ id: string; slug: string }> {
    const response = await this.request(new URL("/v1/skills", this.baseUrl), {
      method: "POST",
      body: JSON.stringify({ manifest })
    });

    return (await response.json()) as { id: string; slug: string };
  }

  async run<TOutput = unknown>(
    skillSlug: string,
    input: unknown = {},
    options: InvokeSkillOptions = {}
  ): Promise<SkillInvocationResult<TOutput>> {
    const response = await this.request(new URL("/v1/runtime/invoke", this.baseUrl), {
      method: "POST",
      body: JSON.stringify({
        skillSlug,
        version: options.version,
        input
      })
    });

    return (await response.json()) as SkillInvocationResult<TOutput>;
  }

  private async request(url: URL, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");

    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    const response = await this.fetcher(url, {
      ...init,
      headers
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SkillHub API error ${response.status}: ${text}`);
    }

    return response;
  }
}
