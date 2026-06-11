"use client";

import { useState } from "react";

type Props = {
  locale: "en" | "zh";
};

const platformTabs = ["Claude", "Cursor", "Windsurf", "ChatGPT", "REST API"];

const configs: Record<string, string> = {
  Claude: `// claude_desktop_config.json
{
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
  Cursor: `// .cursor/mcp.json
{
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
  Windsurf: `// ~/.windsurf/mcp.json
{
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
  ChatGPT: `// OpenAI Function Calling
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  tools: [{
    type: "function",
    function: {
      name: "skillhub_invoke",
      parameters: {
        skill: "browser-research-pro",
        input: { query: "..." }
      }
    }
  }]
});`,
  "REST API": `curl -X POST https://api.skillhub.dev/v1/invoke \\
  -H "Authorization: Bearer sk_proj_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "browser-research-pro",
    "input": {
      "query": "AI agent frameworks 2026",
      "depth": 3,
      "format": "structured"
    }
  }'

# Response: 200 OK · 2.1s
# { "summary": "...", "sources": [...], "confidence": 0.94 }`,
};

const descriptions: Record<string, Record<string, string>> = {
  en: {
    Claude: "Add SkillHub as an MCP server in Claude Desktop. All verified skills become available as tools automatically.",
    Cursor: "Configure MCP in your Cursor workspace. Skills appear as callable tools inside the AI assistant.",
    Windsurf: "Same MCP config pattern. Drop in the JSON and every skill is accessible from Windsurf's agent.",
    ChatGPT: "Use OpenAI function calling to route skill invocations through SkillHub's REST gateway.",
    "REST API": "Direct HTTP calls for any platform. Works with custom agents, scripts, and automation pipelines.",
  },
  zh: {
    Claude: "在 Claude Desktop 中添加 SkillHub 为 MCP 服务器。所有已验证技能自动作为工具可用。",
    Cursor: "在 Cursor 工作区配置 MCP。技能在 AI 助手中以可调用工具形式出现。",
    Windsurf: "相同的 MCP 配置模式。放入 JSON 即可从 Windsurf Agent 访问所有技能。",
    ChatGPT: "使用 OpenAI function calling 通过 SkillHub REST 网关路由技能调用。",
    "REST API": "任何平台的直接 HTTP 调用。适用于自定义 Agent、脚本和自动化管道。",
  },
};

export function IntegrationSection({ locale }: Props) {
  const [active, setActive] = useState(platformTabs[0]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8">
        {platformTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`tab-pill ${active === tab ? "tab-pill-active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Large code preview (this is the big visual block) */}
      <div className="card-lg overflow-hidden">
        {/* Bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
          </div>
          <span className="ml-auto text-caption text-[var(--color-text-muted)] font-mono">
            {active === "REST API" ? "terminal" : "config.json"}
          </span>
        </div>

        {/* Code */}
        <div className="p-6 font-mono text-[13px] leading-[1.75] text-[#e5e7eb] whitespace-pre overflow-x-auto min-h-[280px]">
          {configs[active]}
        </div>
      </div>

      {/* Description */}
      <p className="text-body text-[var(--color-text-secondary)] mt-6 max-w-2xl">
        {descriptions[locale][active]}
      </p>
    </div>
  );
}
