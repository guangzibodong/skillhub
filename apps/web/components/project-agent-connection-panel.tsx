"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, PlugZap, RadioTower, ShieldCheck, Terminal } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type ProjectAgentConnectionPanelProps = {
  activeKeyCount: number;
  apiUrl: string;
  locale: Locale;
  projectSlug: string;
};

const copy = {
  en: {
    activeKeys: "Active keys",
    apiTitle: "REST invoke",
    copied: "Copied",
    copy: "Copy",
    createKey: "Create a runtime key first",
    endpoint: "MCP endpoint",
    keyEnv: "Project key",
    mcpTitle: "MCP tools",
    policy: "Policy, budget, subscription, invocation logs, and metering stay enforced.",
    project: "Project",
    ready: "Ready for agents",
    title: "Agent connection"
  },
  zh: {
    activeKeys: "活跃 Key",
    apiTitle: "REST 调用",
    copied: "已复制",
    copy: "复制",
    createKey: "请先创建运行 Key",
    endpoint: "MCP 入口",
    keyEnv: "项目 Key",
    mcpTitle: "MCP 工具",
    policy: "策略、预算、订阅、调用日志和计量都会继续生效。",
    project: "项目",
    ready: "可接入智能体",
    title: "智能体接入"
  }
} as const;

export function ProjectAgentConnectionPanel({
  activeKeyCount,
  apiUrl,
  locale,
  projectSlug
}: ProjectAgentConnectionPanelProps) {
  const labels = copy[locale];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const normalizedApiUrl = apiUrl.replace(/\/$/, "");
  const mcpEndpoint = `${normalizedApiUrl}/mcp`;
  const restEndpoint = `${normalizedApiUrl}/v1/runtime/invoke`;
  const snippets = useMemo(
    () => [
      {
        body: `curl -X POST "${mcpEndpoint}" \\
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
        id: "mcp",
        title: labels.mcpTitle
      },
      {
        body: `curl -X POST "${restEndpoint}" \\
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skillSlug":"browser-research","input":{"query":"agent runtime check"}}'`,
        id: "rest",
        title: labels.apiTitle
      }
    ],
    [labels.apiTitle, labels.mcpTitle, mcpEndpoint, restEndpoint]
  );

  async function copyText(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }

  return (
    <section className="ops-panel agent-connection-panel">
      <div className="agent-connection-panel__head">
        <div className="card-kicker">
          <PlugZap size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className={activeKeyCount > 0 ? "status-chip" : "status-chip status-chip--warning"}>
          {activeKeyCount > 0 ? labels.ready : labels.createKey}
        </span>
      </div>

      <div className="agent-connection-status-grid">
        <div>
          <KeyRound size={15} aria-hidden="true" />
          <span>{labels.activeKeys}</span>
          <strong>{activeKeyCount}</strong>
        </div>
        <div>
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{labels.keyEnv}</span>
          <strong>SKILLHUB_PROJECT_API_KEY</strong>
        </div>
        <div>
          <RadioTower size={15} aria-hidden="true" />
          <span>{labels.project}</span>
          <strong>{projectSlug}</strong>
        </div>
      </div>

      <div className="agent-connection-endpoint">
        <RadioTower size={15} aria-hidden="true" />
        <span>{labels.endpoint}</span>
        <code>{mcpEndpoint}</code>
        <button className="icon-button" onClick={() => copyText("endpoint", mcpEndpoint)} title={labels.copy} type="button">
          {copiedKey === "endpoint" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>
      </div>

      <p className="agent-connection-policy">{labels.policy}</p>

      <div className="agent-connection-snippets">
        {snippets.map((snippet) => (
          <div className="agent-snippet" key={snippet.id}>
            <div className="agent-snippet__head">
              <strong>
                <Terminal size={14} aria-hidden="true" />
                <span>{snippet.title}</span>
              </strong>
              <button className="ghost-button" onClick={() => copyText(snippet.id, snippet.body)} type="button">
                {copiedKey === snippet.id ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                <span>{copiedKey === snippet.id ? labels.copied : labels.copy}</span>
              </button>
            </div>
            <pre>
              <code>{snippet.body}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
