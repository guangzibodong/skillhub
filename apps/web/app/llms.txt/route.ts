import { indexablePublicPaths } from "@/lib/public-pages";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const priorityPages = [
  ["/", "SkillHub overview, governed marketplace positioning, and primary discovery paths"],
  ["/what-is-a-skill", "Definition of AI Agent Skills, manifests, permissions, and runtime governance"],
  ["/marketplace", "Public Skill discovery and inspection"],
  ["/docs", "Developer docs for manifests, REST, MCP, and Project Key runtime paths"],
  ["/api", "REST API overview and runtime authentication boundaries"],
  ["/mcp", "MCP integration overview and REST vs MCP tradeoffs"],
  ["/publisher-review", "Publisher submission and verification process"],
  ["/data-handling", "Data handling, logs, secrets, and retention boundaries"],
  ["/pricing", "Early Access pricing, team evaluation, developer access, and publisher access"],
  ["/roadmap", "Available now, early access, and planned capabilities"],
];

export function GET() {
  const lines = [
    "# SkillHub",
    "",
    "SkillHub is a governed marketplace, public registry, and runtime gateway for reusable AI Agent Skills.",
    "",
    "Canonical site: https://useskillhub.com",
    "Languages: English and Simplified Chinese via ?lang=en and ?lang=zh",
    "Product state: Early Access. Public discovery and manifest inspection are live. Runtime invocation requires a signed-in workspace and Project Key. Commercial billing is available only for approved workspaces with configured provider flows.",
    "",
    "## Recommended Pages",
    ...priorityPages.map(([path, description]) => `- ${siteUrl}${path} - ${description}`),
    "",
    "## Full Public Index",
    ...indexablePublicPaths.map((path) => `- ${siteUrl}${path}`),
    "",
    "## Private Or Non-Indexable Areas",
    "- Login, account, admin, dashboard, publisher workspace, role routing, and reports are private or workflow-gated and should not be treated as public documentation.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
