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
    tags: ["content", "research", "citations"],
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
    tags: ["dev", "contract", "schema"],
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
    tags: ["operations", "support", "classification"],
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
  },
  {
    schemaVersion: "0.1",
    name: "seo-page-auditor",
    displayName: "SEO Page Auditor",
    version: "0.1.0",
    description: "Audit a public page for SEO issues, schema gaps, and indexability blockers.",
    tags: ["seo", "schema", "search"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/seo-page-auditor"
    },
    permissions: {
      network: true,
      browser: true,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["score", "issues"],
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "ui-ux-reviewer",
    displayName: "UI/UX Reviewer",
    version: "0.1.0",
    description: "Review screenshots for hierarchy, spacing, mobile layout, and accessibility issues.",
    tags: ["ui", "ux", "accessibility"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/ui-ux-reviewer"
    },
    permissions: {
      network: false,
      browser: true,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["screenshotUrl"],
      properties: {
        screenshotUrl: { type: "string", format: "uri" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["issues"],
      properties: {
        issues: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "content-brief-builder",
    displayName: "Content Brief Builder",
    version: "0.1.0",
    description: "Turn audience, keyword, and competitor notes into an article or landing-page brief.",
    tags: ["content", "brief", "copywriting"],
    runtime: {
      type: "mcp",
      serverUrl: "https://api.useskillhub.com/mcp"
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["keyword"],
      properties: {
        keyword: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["outline", "angle"],
      properties: {
        angle: { type: "string" },
        outline: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "api-contract-tester",
    displayName: "API Contract Tester",
    version: "0.1.0",
    description: "Validate examples and backward-compatibility rules for API or manifest contracts.",
    tags: ["api", "contract", "development"],
    runtime: {
      type: "local",
      command: "skillhub-demo-contract-tester"
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["contractPath"],
      properties: {
        contractPath: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["passed"],
      properties: {
        passed: { type: "boolean" }
      }
    }
  }
];
