"use client";

import { CheckCircle2, FileJson, KeyRound, LockKeyhole, Send, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

type PublishFormProps = {
  apiUrl: string;
};

type ReviewCheck = {
  label: string;
  ok: boolean;
  detail: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

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

  const review = useMemo(() => {
    const manifest = isRecord(parsedManifest) ? parsedManifest : {};
    const runtime = isRecord(manifest.runtime) ? manifest.runtime : {};
    const permissions = isRecord(manifest.permissions) ? manifest.permissions : {};
    const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
    const secrets = Array.isArray(permissions.secrets) ? permissions.secrets.length : 0;

    const checks: ReviewCheck[] = [
      {
        label: "Valid JSON",
        ok: Boolean(parsedManifest),
        detail: parsedManifest ? "Parser ready" : "Fix syntax before publishing"
      },
      {
        label: "Package identity",
        ok: Boolean(manifest.name && manifest.displayName && manifest.version),
        detail: "name, displayName, version"
      },
      {
        label: "Runtime declared",
        ok: Boolean(runtime.type),
        detail: toText(runtime.type, "HTTP, MCP, or local")
      },
      {
        label: "Schemas attached",
        ok: isRecord(manifest.inputSchema) && isRecord(manifest.outputSchema),
        detail: "inputSchema and outputSchema"
      },
      {
        label: "Permissions scoped",
        ok: isRecord(manifest.permissions),
        detail: `${permissions.filesystem ?? "unknown"} filesystem, ${secrets} secrets`
      }
    ];

    return {
      checks,
      displayName: toText(manifest.displayName, "Untitled skill"),
      name: toText(manifest.name, "missing-name"),
      runtime: toText(runtime.type, "unknown"),
      version: toText(manifest.version, "0.0.0"),
      tagCount: tags.length
    };
  }, [parsedManifest]);

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
    <section className="publish-grid" aria-label="Publish skill">
      <div className="publish-main">
        <div className="publish-card">
          <div className="publish-card__head">
            <div>
              <div className="card-kicker">
                <KeyRound size={16} aria-hidden="true" />
                <span>Operator access</span>
              </div>
              <h2>Admin token</h2>
            </div>
            <span className="private-badge">
              <LockKeyhole size={14} aria-hidden="true" />
              Private
            </span>
          </div>

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
        </div>

        <label className="manifest-editor">
          <span className="manifest-editor__label">
            <span>
              <FileJson size={16} aria-hidden="true" />
              skillhub.json
            </span>
            <small>{parsedManifest ? "Valid JSON" : "Invalid JSON"}</small>
          </span>
          <textarea
            aria-invalid={!parsedManifest}
            onChange={(event) => setManifestText(event.target.value)}
            spellCheck={false}
            value={manifestText}
          />
        </label>

        <div className="publish-actions">
          <button className="primary-button primary-button--large" disabled={!canSubmit} onClick={submit} type="button">
            <Send size={18} aria-hidden="true" />
            <span>{status === "submitting" ? "Publishing" : "Publish skill"}</span>
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
      </div>

      <aside className="review-panel" aria-label="Manifest review">
        <div className="review-panel__head">
          <div className="review-panel__icon" aria-hidden="true">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2>Manifest review</h2>
            <p>Preflight for registry submission.</p>
          </div>
        </div>

        <dl className="manifest-summary">
          <div>
            <dt>Package</dt>
            <dd>{review.displayName}</dd>
          </div>
          <div>
            <dt>Slug</dt>
            <dd>{review.name}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{review.runtime}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{review.version}</dd>
          </div>
          <div>
            <dt>Tags</dt>
            <dd>{review.tagCount}</dd>
          </div>
        </dl>

        <div className="review-checks">
          {review.checks.map((item) => (
            <div className={item.ok ? "review-check review-check--ok" : "review-check"} key={item.label}>
              {item.ok ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
