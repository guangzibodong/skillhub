import type { SkillManifest } from "@useskillhub/schema";

export const demoSkills: SkillManifest[] = [
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
  },
  {
    schemaVersion: "0.1",
    name: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    version: "0.1.0",
    description: "Convert tabular data into structured notes, anomalies, and next actions.",
    tags: ["data", "analysis", "summary"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/dataset-summarizer"
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: { type: "object" }
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["summary", "anomalies"],
      properties: {
        summary: { type: "string" },
        anomalies: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "support-triage",
    displayName: "Support Triage",
    version: "0.1.0",
    description: "Classify support requests by urgency, product area, and escalation path.",
    tags: ["support", "classification", "ops"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/support-triage"
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["priority", "category"],
      properties: {
        priority: { type: "string", enum: ["low", "medium", "high"] },
        category: { type: "string" }
      }
    }
  }
];
