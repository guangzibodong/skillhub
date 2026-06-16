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
  },
  {
    schemaVersion: "0.1",
    name: "geo-answer-auditor",
    displayName: "GEO Answer Auditor",
    version: "0.1.0",
    description: "Audit a page or brand brief for answer-engine clarity, entity coverage, and citation readiness.",
    author: { name: "GrowthOps Studio", url: "https://useskillhub.com/publishers/growthops-studio" },
    tags: ["geo", "seo", "answer-engine", "citations"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/geo-answer-auditor" },
    permissions: { network: true, browser: true, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["url", "targetQuestion"],
      properties: {
        targetQuestion: { type: "string" },
        url: { type: "string", format: "uri" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["score", "gaps"],
      properties: {
        gaps: { type: "array", items: { type: "string" } },
        score: { type: "number" }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "landing-page-copy-optimizer",
    displayName: "Landing Page Copy Optimizer",
    version: "0.1.0",
    description: "Rewrite landing-page messaging for clearer offer, proof, objections, and CTA hierarchy.",
    author: { name: "Content Engine", url: "https://useskillhub.com/publishers/content-engine" },
    tags: ["content", "copywriting", "conversion"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/landing-page-copy-optimizer" },
    permissions: { network: false, browser: false, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["copy", "audience"],
      properties: {
        audience: { type: "string" },
        copy: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["headline", "sections"],
      properties: {
        headline: { type: "string" },
        sections: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "mobile-layout-qa",
    displayName: "Mobile Layout QA",
    version: "0.1.0",
    description: "Review mobile screenshots for overflow, spacing, tap targets, sticky bars, and CTA clarity.",
    author: { name: "Interface Works", url: "https://useskillhub.com/publishers/interface-works" },
    tags: ["ui", "ux", "mobile", "accessibility", "frontend"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/mobile-layout-qa" },
    permissions: { network: false, browser: true, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["screenshotUrl"],
      properties: {
        screenshotUrl: { type: "string", format: "uri" },
        viewport: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["issues"],
      properties: {
        issues: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "knowledge-base-answer",
    displayName: "Knowledge Base Answer",
    version: "0.1.0",
    description: "Answer support questions from approved help-center passages with source snippets and escalation notes.",
    author: { name: "HelpDesk AI", url: "https://useskillhub.com/publishers/helpdesk-ai" },
    tags: ["support", "knowledge-base", "retrieval"],
    runtime: { type: "mcp", serverUrl: "https://api.useskillhub.com/mcp" },
    permissions: { network: false, browser: false, filesystem: "read", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["question", "passages"],
      properties: {
        passages: { type: "array", items: { type: "string" } },
        question: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["answer", "citations"],
      properties: {
        answer: { type: "string" },
        citations: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "webhook-payload-validator",
    displayName: "Webhook Payload Validator",
    version: "0.1.0",
    description: "Validate webhook payload shape, required fields, signature metadata, and retry safety before release.",
    author: { name: "Builder Tools", url: "https://useskillhub.com/publishers/builder-tools" },
    tags: ["automation", "workflow", "api", "webhook"],
    runtime: { type: "local", command: "skillhub-demo-webhook-validator" },
    permissions: { network: false, browser: false, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["payload", "schema"],
      properties: {
        payload: { type: "object" },
        schema: { type: "object" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["valid", "findings"],
      properties: {
        findings: { type: "array", items: { type: "string" } },
        valid: { type: "boolean" }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "prompt-injection-guard",
    displayName: "Prompt Injection Guard",
    version: "0.1.0",
    description: "Detect prompt-injection patterns in retrieved content and recommend safe handling before agent use.",
    author: { name: "SecureOps Studio", url: "https://useskillhub.com/publishers/secureops-studio" },
    tags: ["security", "trust", "prompt"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/prompt-injection-guard" },
    permissions: { network: false, browser: false, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["risk", "reasons"],
      properties: {
        reasons: { type: "array", items: { type: "string" } },
        risk: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "spreadsheet-cleaner",
    displayName: "Spreadsheet Cleaner",
    version: "0.1.0",
    description: "Normalize spreadsheet columns, flag missing values, dedupe rows, and prepare clean records for agents.",
    author: { name: "Analyst Forge", url: "https://useskillhub.com/publishers/analyst-forge" },
    tags: ["data", "spreadsheet", "cleaning"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/spreadsheet-cleaner" },
    permissions: { network: false, browser: false, filesystem: "read", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: { type: "array", items: { type: "object" } }
      }
    },
    outputSchema: {
      type: "object",
      required: ["cleanRows", "warnings"],
      properties: {
        cleanRows: { type: "array", items: { type: "object" } },
        warnings: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "outbound-sequence-personalizer",
    displayName: "Outbound Sequence Personalizer",
    version: "0.1.0",
    description: "Create approved outbound email sequences from CRM context, persona, and allowed value propositions.",
    author: { name: "Revenue Tools", url: "https://useskillhub.com/publishers/revenue-tools" },
    tags: ["sales", "crm", "copywriting"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/outbound-sequence-personalizer" },
    permissions: { network: false, browser: false, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["company", "persona", "approvedClaims"],
      properties: {
        approvedClaims: { type: "array", items: { type: "string" } },
        company: { type: "string" },
        persona: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["steps", "riskNotes"],
      properties: {
        riskNotes: { type: "array", items: { type: "string" } },
        steps: { type: "array", items: { type: "object" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "crm-enrichment",
    displayName: "CRM Enrichment",
    version: "0.1.0",
    description: "Enrich account records with public company signals, role hints, and next best action for sales agents.",
    author: { name: "Revenue Tools", url: "https://useskillhub.com/publishers/revenue-tools" },
    tags: ["crm", "sales", "revenue"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/crm-enrichment" },
    permissions: { network: true, browser: false, filesystem: "none", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["domain"],
      properties: {
        domain: { type: "string" },
        region: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["company", "signals"],
      properties: {
        company: { type: "string" },
        signals: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "codebase-risk-scanner",
    displayName: "Codebase Risk Scanner",
    version: "0.1.0",
    description: "Scan a repository snapshot for risky files, exposed-secret patterns, and owner-review hints.",
    author: { name: "SecureOps Studio", url: "https://useskillhub.com/publishers/secureops-studio" },
    tags: ["security", "code", "review"],
    runtime: { type: "local", command: "skillhub-demo-codebase-risk-scanner" },
    permissions: { network: false, browser: false, filesystem: "read", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: {
        changedFilesOnly: { type: "boolean" },
        path: { type: "string" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["risk", "findings"],
      properties: {
        findings: { type: "array", items: { type: "object" } },
        risk: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  },
  {
    schemaVersion: "0.1",
    name: "invoice-extraction",
    displayName: "Invoice Extraction",
    version: "0.1.0",
    description: "Extract vendor, tax, line items, due dates, and approval hints from invoices for finance agents.",
    author: { name: "Backoffice AI", url: "https://useskillhub.com/publishers/backoffice-ai" },
    tags: ["finance", "invoice", "payables", "backoffice"],
    runtime: { type: "http", entrypoint: "https://api.useskillhub.com/demo/invoice-extraction" },
    permissions: { network: true, browser: false, filesystem: "read", secrets: [] },
    inputSchema: {
      type: "object",
      required: ["fileUrl"],
      properties: {
        fileUrl: { type: "string", format: "uri" }
      }
    },
    outputSchema: {
      type: "object",
      required: ["vendor", "amount", "lineItems"],
      properties: {
        amount: { type: "number" },
        lineItems: { type: "array", items: { type: "object" } },
        vendor: { type: "string" }
      }
    }
  }
];
