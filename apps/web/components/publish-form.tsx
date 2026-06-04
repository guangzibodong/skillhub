"use client";

import { CheckCircle2, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

type PublishFormProps = {
  apiUrl: string;
};

const exampleManifest = {
  schemaVersion: "0.1",
  name: "email-brief",
  displayName: "Email Brief",
  version: "0.1.0",
  description: "Summarize long email threads into decisions, blockers, and next actions.",
  author: {
    name: "SkillHub"
  },
  tags: ["email", "summary", "productivity"],
  runtime: {
    type: "http",
    entrypoint: "https://api.useskillhub.com/demo/email-brief"
  },
  permissions: {
    network: false,
    browser: false,
    filesystem: "none",
    secrets: []
  },
  inputSchema: {
    type: "object",
    required: ["thread"],
    properties: {
      thread: { type: "string" }
    }
  },
  outputSchema: {
    type: "object",
    required: ["summary", "nextActions"],
    properties: {
      summary: { type: "string" },
      nextActions: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
};

export function PublishForm({ apiUrl }: PublishFormProps) {
  const [adminToken, setAdminToken] = useState("");
  const [manifestText, setManifestText] = useState(JSON.stringify(exampleManifest, null, 2));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const parsedManifest = useMemo(() => {
    try {
      return JSON.parse(manifestText) as unknown;
    } catch {
      return undefined;
    }
  }, [manifestText]);

  const canSubmit = Boolean(adminToken.trim()) && Boolean(parsedManifest) && status !== "submitting";

  async function submit() {
    if (!parsedManifest) {
      setStatus("error");
      setMessage("Manifest JSON is invalid.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/v1/skills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ manifest: parsedManifest })
      });

      const payload = (await response.json()) as { slug?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? `Publish failed with ${response.status}`);
      }

      setStatus("success");
      setMessage(`Published ${payload.slug}.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to publish skill.");
    }
  }

  return (
    <section className="publish-form" aria-label="Publish skill">
      <div className="field-grid">
        <label>
          <span>Admin token</span>
          <input
            autoComplete="off"
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="skh_admin_..."
            type="password"
            value={adminToken}
          />
        </label>
        <label>
          <span>API</span>
          <input readOnly value={apiUrl} />
        </label>
      </div>

      <label className="manifest-editor">
        <span>skillhub.json</span>
        <textarea onChange={(event) => setManifestText(event.target.value)} spellCheck={false} value={manifestText} />
      </label>

      <div className="publish-actions">
        <button className="primary-button" disabled={!canSubmit} onClick={submit} type="button">
          <Send size={18} aria-hidden="true" />
          <span>{status === "submitting" ? "Publishing" : "Publish"}</span>
        </button>
        {status === "success" && (
          <p className="form-message form-message--success">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{message}</span>
          </p>
        )}
        {status === "error" && (
          <p className="form-message form-message--error">
            <XCircle size={16} aria-hidden="true" />
            <span>{message}</span>
          </p>
        )}
      </div>
    </section>
  );
}
