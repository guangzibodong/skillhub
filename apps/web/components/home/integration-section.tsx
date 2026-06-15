"use client";

import { useState } from "react";

type Props = {
  locale: "en" | "zh";
};

const platforms = [
  { key: "claude", label: "Claude (MCP)" },
  { key: "cursor", label: "Cursor" },
  { key: "windsurf", label: "Windsurf" },
  { key: "chatgpt", label: "ChatGPT" },
  { key: "rest", label: "REST API" },
];

const configs: Record<string, string> = {
  claude: `{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_proj_..."
      }
    }
  }
}`,
  cursor: `{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_proj_..."
      }
    }
  }
}`,
  windsurf: `{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_proj_..."
      }
    }
  }
}`,
  chatgpt: `const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "..." }],
  tools: [{
    type: "function",
    function: {
      name: "skillhub_invoke",
      description: "Invoke a SkillHub skill",
      parameters: {
        type: "object",
        properties: {
          skill: { type: "string" },
          input: { type: "object" }
        }
      }
    }
  }]
});`,
  rest: `curl -X POST https://api.skillhub.dev/v1/invoke \\
  -H "Authorization: Bearer sk_proj_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "browser-research",
    "version": "1.0.0",
    "input": {
      "query": "AI agent skill security",
      "depth": "standard"
    }
  }'

# 200 OK
# {
#   "summary": "Recent references emphasize manifest inspection...",
#   "sources": [{ "title": "...", "url": "..." }]
# }`,
};

const descriptions: Record<string, Record<string, string>> = {
  en: {
    claude: "Add SkillHub as an MCP server. All verified skills become tools that Claude can call autonomously.",
    cursor: "Drop one JSON file into your workspace. Every skill is callable from Cursor's agent.",
    windsurf: "Same MCP protocol. One config, instant access to the full registry.",
    chatgpt: "Use OpenAI function calling to route invocations through SkillHub's gateway.",
    rest: "Direct HTTP for any platform — custom agents, scripts, CI pipelines, no SDK required.",
  },
  zh: {
    claude: "添加 SkillHub 为 MCP 服务器。所有已验证技能自动成为 Claude 可调用的工具。",
    cursor: "放入一个 JSON 文件。所有技能可从 Cursor Agent 直接调用。",
    windsurf: "相同的 MCP 协议。一个配置，即时访问完整注册表。",
    chatgpt: "使用 OpenAI function calling 通过 SkillHub 网关路由调用。",
    rest: "任何平台的直接 HTTP — 自定义 Agent、脚本、CI 管道，无需 SDK。",
  },
};

export function IntegrationSection({ locale }: Props) {
  const [active, setActive] = useState("claude");

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-6">
      {/* Left: vertical tab list (matches Morphic's seamless workflows layout) */}
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            className={`text-left px-4 py-3 rounded-[8px] text-[14px] font-medium transition-all whitespace-nowrap ${
              active === p.key
                ? "bg-[#212121] text-white"
                : "text-[#666] hover:text-[#999]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Right: large preview (matches Morphic's image preview area) */}
      <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden">
        {/* Terminal chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex gap-1.5">
            <div className="w-[10px] h-[10px] rounded-full bg-[#333]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#333]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#333]" />
          </div>
          <span className="ml-auto text-[11px] text-[#525252] font-mono">
            {active === "rest" ? "terminal" : active === "chatgpt" ? "agent.ts" : "config.json"}
          </span>
        </div>

        {/* Code */}
        <pre className="p-6 font-mono text-[13px] leading-[1.7] text-[#e5e7eb] whitespace-pre overflow-x-auto min-h-[320px]">
          {configs[active]}
        </pre>

        {/* Description below code */}
        <div className="px-6 pb-5 border-t border-[rgba(255,255,255,0.08)]">
          <p className="text-[14px] text-[#999] pt-4">
            {descriptions[locale][active]}
          </p>
        </div>
      </div>
    </div>
  );
}
