import type { SkillManifest } from "@useskillhub/schema";

export const demoSkills: SkillManifest[] = [
  {
    schemaVersion: "0.1",
    name: "browser-research",
    displayName: "Browser Research",
    version: "0.1.0",
    description:
      "Research a web topic and return concise findings with source URLs.",
    author: {
      name: "SkillHub",
      url: "https://useskillhub.com",
    },
    tags: ["content", "research", "citations"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/browser-research",
    },
    permissions: {
      network: true,
      browser: true,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 3 },
      },
    },
    outputSchema: {
      type: "object",
      required: ["summary", "sources"],
      properties: {
        summary: { type: "string" },
        sources: {
          type: "array",
          items: { type: "string", format: "uri" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "manifest-review",
    displayName: "Manifest Review",
    version: "0.1.0",
    description:
      "Review a SkillHub manifest for completeness, risk, and publish readiness.",
    tags: ["dev", "contract", "schema"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/manifest-review",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["manifest"],
      properties: {
        manifest: { type: "object" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["status", "findings"],
      properties: {
        status: { type: "string", enum: ["pass", "needs_changes"] },
        findings: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    version: "0.1.0",
    description:
      "Convert tabular data into structured notes, anomalies, and next actions.",
    tags: ["data", "analysis", "summary"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/dataset-summarizer",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: { type: "object" },
        },
      },
    },
    outputSchema: {
      type: "object",
      required: ["summary", "anomalies"],
      properties: {
        summary: { type: "string" },
        anomalies: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "support-triage",
    displayName: "Support Triage",
    version: "0.1.0",
    description:
      "Classify support requests by urgency, product area, and escalation path.",
    tags: ["operations", "support", "classification"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/support-triage",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["priority", "category"],
      properties: {
        priority: { type: "string", enum: ["low", "medium", "high"] },
        category: { type: "string" },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "seo-page-auditor",
    displayName: "SEO Page Auditor",
    version: "0.1.0",
    description:
      "Audit a public page for SEO issues, schema gaps, and indexability blockers.",
    tags: ["seo", "schema", "search"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/seo-page-auditor",
    },
    permissions: {
      network: true,
      browser: true,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["score", "issues"],
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "ui-ux-reviewer",
    displayName: "UI/UX Reviewer",
    version: "0.1.0",
    description:
      "Review screenshots for hierarchy, spacing, mobile layout, and accessibility issues.",
    tags: ["ui", "ux", "accessibility"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/ui-ux-reviewer",
    },
    permissions: {
      network: false,
      browser: true,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["screenshotUrl"],
      properties: {
        screenshotUrl: { type: "string", format: "uri" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["issues"],
      properties: {
        issues: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "content-brief-builder",
    displayName: "Content Brief Builder",
    version: "0.1.0",
    description:
      "Turn audience, keyword, and competitor notes into an article or landing-page brief.",
    tags: ["content", "brief", "copywriting"],
    runtime: {
      type: "mcp",
      serverUrl: "https://api.useskillhub.com/mcp",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["keyword"],
      properties: {
        keyword: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["outline", "angle"],
      properties: {
        angle: { type: "string" },
        outline: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "api-contract-tester",
    displayName: "API Contract Tester",
    version: "0.1.0",
    description:
      "Validate examples and backward-compatibility rules for API or manifest contracts.",
    tags: ["api", "contract", "development"],
    runtime: {
      type: "local",
      command: "skillhub-demo-contract-tester",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["contractPath"],
      properties: {
        contractPath: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["passed"],
      properties: {
        passed: { type: "boolean" },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "geo-answer-auditor",
    displayName: "GEO Answer Auditor",
    version: "0.1.0",
    description:
      "Audit a page or brand brief for answer-engine clarity, entity coverage, and citation readiness.",
    author: {
      name: "GrowthOps Studio",
      url: "https://useskillhub.com/publishers/growthops-studio",
    },
    tags: ["geo", "seo", "answer-engine", "citations"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/geo-answer-auditor",
    },
    permissions: {
      network: true,
      browser: true,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["url", "targetQuestion"],
      properties: {
        targetQuestion: { type: "string" },
        url: { type: "string", format: "uri" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["score", "gaps"],
      properties: {
        gaps: { type: "array", items: { type: "string" } },
        score: { type: "number" },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "landing-page-copy-optimizer",
    displayName: "Landing Page Copy Optimizer",
    version: "0.1.0",
    description:
      "Rewrite landing-page messaging for clearer offer, proof, objections, and CTA hierarchy.",
    author: {
      name: "Content Engine",
      url: "https://useskillhub.com/publishers/content-engine",
    },
    tags: ["content", "copywriting", "conversion"],
    runtime: {
      type: "http",
      entrypoint:
        "https://api.useskillhub.com/demo/landing-page-copy-optimizer",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["copy", "audience"],
      properties: {
        audience: { type: "string" },
        copy: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["headline", "sections"],
      properties: {
        headline: { type: "string" },
        sections: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "mobile-layout-qa",
    displayName: "Mobile Layout QA",
    version: "0.1.0",
    description:
      "Review mobile screenshots for overflow, spacing, tap targets, sticky bars, and CTA clarity.",
    author: {
      name: "Interface Works",
      url: "https://useskillhub.com/publishers/interface-works",
    },
    tags: ["ui", "ux", "mobile", "accessibility", "frontend"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/mobile-layout-qa",
    },
    permissions: {
      network: false,
      browser: true,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["screenshotUrl"],
      properties: {
        screenshotUrl: { type: "string", format: "uri" },
        viewport: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["issues"],
      properties: {
        issues: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "knowledge-base-answer",
    displayName: "Knowledge Base Answer",
    version: "0.1.0",
    description:
      "Answer support questions from approved help-center passages with source snippets and escalation notes.",
    author: {
      name: "HelpDesk AI",
      url: "https://useskillhub.com/publishers/helpdesk-ai",
    },
    tags: ["support", "knowledge-base", "retrieval"],
    runtime: { type: "mcp", serverUrl: "https://api.useskillhub.com/mcp" },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["question", "passages"],
      properties: {
        passages: { type: "array", items: { type: "string" } },
        question: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["answer", "citations"],
      properties: {
        answer: { type: "string" },
        citations: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "webhook-payload-validator",
    displayName: "Webhook Payload Validator",
    version: "0.1.0",
    description:
      "Validate webhook payload shape, required fields, signature metadata, and retry safety before release.",
    author: {
      name: "Builder Tools",
      url: "https://useskillhub.com/publishers/builder-tools",
    },
    tags: ["automation", "workflow", "api", "webhook"],
    runtime: { type: "local", command: "skillhub-demo-webhook-validator" },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["payload", "schema"],
      properties: {
        payload: { type: "object" },
        schema: { type: "object" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["valid", "findings"],
      properties: {
        findings: { type: "array", items: { type: "string" } },
        valid: { type: "boolean" },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "prompt-injection-guard",
    displayName: "Prompt Injection Guard",
    version: "0.1.0",
    description:
      "Detect prompt-injection patterns in retrieved content and recommend safe handling before agent use.",
    author: {
      name: "SecureOps Studio",
      url: "https://useskillhub.com/publishers/secureops-studio",
    },
    tags: ["security", "trust", "prompt"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/prompt-injection-guard",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["risk", "reasons"],
      properties: {
        reasons: { type: "array", items: { type: "string" } },
        risk: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "spreadsheet-cleaner",
    displayName: "Spreadsheet Cleaner",
    version: "0.1.0",
    description:
      "Normalize spreadsheet columns, flag missing values, dedupe rows, and prepare clean records for agents.",
    author: {
      name: "Analyst Forge",
      url: "https://useskillhub.com/publishers/analyst-forge",
    },
    tags: ["data", "spreadsheet", "cleaning"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/spreadsheet-cleaner",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: { type: "array", items: { type: "object" } },
      },
    },
    outputSchema: {
      type: "object",
      required: ["cleanRows", "warnings"],
      properties: {
        cleanRows: { type: "array", items: { type: "object" } },
        warnings: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "outbound-sequence-personalizer",
    displayName: "Outbound Sequence Personalizer",
    version: "0.1.0",
    description:
      "Create approved outbound email sequences from CRM context, persona, and allowed value propositions.",
    author: {
      name: "Revenue Tools",
      url: "https://useskillhub.com/publishers/revenue-tools",
    },
    tags: ["sales", "crm", "copywriting"],
    runtime: {
      type: "http",
      entrypoint:
        "https://api.useskillhub.com/demo/outbound-sequence-personalizer",
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["company", "persona", "approvedClaims"],
      properties: {
        approvedClaims: { type: "array", items: { type: "string" } },
        company: { type: "string" },
        persona: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["steps", "riskNotes"],
      properties: {
        riskNotes: { type: "array", items: { type: "string" } },
        steps: { type: "array", items: { type: "object" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "crm-enrichment",
    displayName: "CRM Enrichment",
    version: "0.1.0",
    description:
      "Enrich account records with public company signals, role hints, and next best action for sales agents.",
    author: {
      name: "Revenue Tools",
      url: "https://useskillhub.com/publishers/revenue-tools",
    },
    tags: ["crm", "sales", "revenue"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/crm-enrichment",
    },
    permissions: {
      network: true,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["domain"],
      properties: {
        domain: { type: "string" },
        region: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["company", "signals"],
      properties: {
        company: { type: "string" },
        signals: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "codebase-risk-scanner",
    displayName: "Codebase Risk Scanner",
    version: "0.1.0",
    description:
      "Scan a repository snapshot for risky files, exposed-secret patterns, and owner-review hints.",
    author: {
      name: "SecureOps Studio",
      url: "https://useskillhub.com/publishers/secureops-studio",
    },
    tags: ["security", "code", "review"],
    runtime: { type: "local", command: "skillhub-demo-codebase-risk-scanner" },
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: {
        changedFilesOnly: { type: "boolean" },
        path: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["risk", "findings"],
      properties: {
        findings: { type: "array", items: { type: "object" } },
        risk: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
  },
  {
    schemaVersion: "0.1",
    name: "invoice-extraction",
    displayName: "Invoice Extraction",
    version: "0.1.0",
    description:
      "Extract vendor, tax, line items, due dates, and approval hints from invoices for finance agents.",
    author: {
      name: "Backoffice AI",
      url: "https://useskillhub.com/publishers/backoffice-ai",
    },
    tags: ["finance", "invoice", "payables", "backoffice"],
    runtime: {
      type: "http",
      entrypoint: "https://api.useskillhub.com/demo/invoice-extraction",
    },
    permissions: {
      network: true,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["fileUrl"],
      properties: {
        fileUrl: { type: "string", format: "uri" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["vendor", "amount", "lineItems"],
      properties: {
        amount: { type: "number" },
        lineItems: { type: "array", items: { type: "object" } },
        vendor: { type: "string" },
      },
    },
  },
  demoSkill({
    name: "shopify-product-copy",
    displayName: "Shopify Product Copy",
    description:
      "Generate SEO-ready product titles, bullets, descriptions, and trust notes from approved product facts.",
    authorName: "Commerce AI Studio",
    authorSlug: "commerce-ai-studio",
    tags: ["ecommerce", "shopify", "product", "copywriting", "seo"],
    requiredInput: ["productName", "features", "audience"],
    inputProperties: {
      audience: { type: "string" },
      features: { type: "array", items: { type: "string" } },
      productName: { type: "string" },
      tone: { type: "string" },
    },
    requiredOutput: ["title", "description", "bullets"],
    outputProperties: {
      bullets: { type: "array", items: { type: "string" } },
      description: { type: "string" },
      seoFields: { type: "object" },
      title: { type: "string" },
    },
  }),
  demoSkill({
    name: "product-review-miner",
    displayName: "Product Review Miner",
    description:
      "Analyze product reviews to extract objections, feature requests, sentiment themes, and copy angles.",
    authorName: "Commerce AI Studio",
    authorSlug: "commerce-ai-studio",
    tags: ["ecommerce", "reviews", "analysis", "product"],
    requiredInput: ["reviews"],
    inputProperties: {
      productName: { type: "string" },
      reviews: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["themes", "objections", "actions"],
    outputProperties: {
      actions: { type: "array", items: { type: "string" } },
      objections: { type: "array", items: { type: "string" } },
      themes: { type: "array", items: { type: "object" } },
    },
  }),
  demoSkill({
    name: "inventory-reorder-planner",
    displayName: "Inventory Reorder Planner",
    description:
      "Turn SKU sales velocity, stock levels, and lead times into reorder priorities and shortage warnings.",
    authorName: "RetailOps Lab",
    authorSlug: "retailops-lab",
    tags: ["ecommerce", "inventory", "operations", "forecasting"],
    requiredInput: ["skuRows"],
    inputProperties: {
      planningWindowDays: { type: "number" },
      skuRows: { type: "array", items: { type: "object" } },
    },
    requiredOutput: ["reorderList", "riskNotes"],
    outputProperties: {
      reorderList: { type: "array", items: { type: "object" } },
      riskNotes: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "pricing-experiment-advisor",
    displayName: "Pricing Experiment Advisor",
    description:
      "Recommend pricing tests, guardrails, and expected tradeoffs from margin, conversion, and competitor signals.",
    authorName: "RetailOps Lab",
    authorSlug: "retailops-lab",
    tags: ["ecommerce", "pricing", "analysis", "conversion"],
    requiredInput: ["productMetrics", "goal"],
    inputProperties: {
      goal: { type: "string" },
      productMetrics: { type: "object" },
      competitorNotes: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["experiments", "guardrails"],
    outputProperties: {
      experiments: { type: "array", items: { type: "object" } },
      guardrails: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "ad-creative-brief",
    displayName: "Ad Creative Brief",
    description:
      "Create channel-specific ad creative briefs with audience, offer, proof, hooks, and compliance notes.",
    authorName: "Campaign Systems",
    authorSlug: "campaign-systems",
    tags: ["marketing", "ads", "creative", "brief"],
    requiredInput: ["offer", "audience", "channel"],
    inputProperties: {
      audience: { type: "string" },
      channel: { type: "string" },
      offer: { type: "string" },
      proofPoints: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["brief", "hooks", "risks"],
    outputProperties: {
      brief: { type: "object" },
      hooks: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "campaign-performance-insights",
    displayName: "Campaign Performance Insights",
    description:
      "Summarize campaign performance, explain metric movement, and propose next tests for marketers.",
    authorName: "Campaign Systems",
    authorSlug: "campaign-systems",
    tags: ["marketing", "campaign", "analytics", "analysis"],
    requiredInput: ["metrics"],
    inputProperties: {
      metrics: { type: "array", items: { type: "object" } },
      objective: { type: "string" },
    },
    requiredOutput: ["summary", "drivers", "nextTests"],
    outputProperties: {
      drivers: { type: "array", items: { type: "string" } },
      nextTests: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  }),
  demoSkill({
    name: "social-content-calendar",
    displayName: "Social Content Calendar",
    description:
      "Build a social publishing calendar from campaign goals, audience segments, and approved brand topics.",
    authorName: "Campaign Systems",
    authorSlug: "campaign-systems",
    tags: ["marketing", "social", "content", "calendar"],
    requiredInput: ["topics", "cadence"],
    inputProperties: {
      cadence: { type: "string" },
      channels: { type: "array", items: { type: "string" } },
      topics: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["calendar", "repurposingPlan"],
    outputProperties: {
      calendar: { type: "array", items: { type: "object" } },
      repurposingPlan: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "utm-taxonomy-validator",
    displayName: "UTM Taxonomy Validator",
    description:
      "Check campaign URLs for UTM naming consistency, missing fields, duplicate sources, and reporting safety.",
    authorName: "Campaign Systems",
    authorSlug: "campaign-systems",
    tags: ["marketing", "analytics", "automation", "campaign"],
    requiredInput: ["urls"],
    inputProperties: {
      rules: { type: "object" },
      urls: { type: "array", items: { type: "string", format: "uri" } },
    },
    requiredOutput: ["valid", "issues"],
    outputProperties: {
      issues: { type: "array", items: { type: "object" } },
      valid: { type: "boolean" },
    },
  }),
  demoSkill({
    name: "resume-screening-helper",
    displayName: "Resume Screening Helper",
    description:
      "Compare resumes against role requirements and return evidence-based screening notes for human review.",
    authorName: "PeopleOps AI",
    authorSlug: "peopleops-ai",
    tags: ["hr", "recruiting", "resume", "classification"],
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    requiredInput: ["resumeText", "roleRequirements"],
    inputProperties: {
      resumeText: { type: "string" },
      roleRequirements: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["fitSummary", "evidence", "reviewFlags"],
    outputProperties: {
      evidence: { type: "array", items: { type: "string" } },
      fitSummary: { type: "string" },
      reviewFlags: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "interview-question-builder",
    displayName: "Interview Question Builder",
    description:
      "Create structured interview questions, rubrics, and follow-ups from role competencies.",
    authorName: "PeopleOps AI",
    authorSlug: "peopleops-ai",
    tags: ["hr", "interview", "recruiting", "rubric"],
    requiredInput: ["role", "competencies"],
    inputProperties: {
      competencies: { type: "array", items: { type: "string" } },
      role: { type: "string" },
      seniority: { type: "string" },
    },
    requiredOutput: ["questions", "rubric"],
    outputProperties: {
      questions: { type: "array", items: { type: "object" } },
      rubric: { type: "array", items: { type: "object" } },
    },
  }),
  demoSkill({
    name: "employee-policy-answer",
    displayName: "Employee Policy Answer",
    description:
      "Answer employee policy questions from approved handbook passages with citations and escalation notes.",
    authorName: "PeopleOps AI",
    authorSlug: "peopleops-ai",
    tags: ["hr", "policy", "knowledge-base", "support"],
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    requiredInput: ["question", "policyPassages"],
    inputProperties: {
      policyPassages: { type: "array", items: { type: "string" } },
      question: { type: "string" },
    },
    requiredOutput: ["answer", "citations", "escalation"],
    outputProperties: {
      answer: { type: "string" },
      citations: { type: "array", items: { type: "string" } },
      escalation: { type: "string" },
    },
  }),
  demoSkill({
    name: "onboarding-plan-builder",
    displayName: "Onboarding Plan Builder",
    description:
      "Build a 30-60-90 day onboarding plan from role, tools, policies, and manager priorities.",
    authorName: "PeopleOps AI",
    authorSlug: "peopleops-ai",
    tags: ["hr", "onboarding", "training", "operations"],
    requiredInput: ["role", "priorities"],
    inputProperties: {
      priorities: { type: "array", items: { type: "string" } },
      role: { type: "string" },
      tools: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["plan", "checkpoints"],
    outputProperties: {
      checkpoints: { type: "array", items: { type: "string" } },
      plan: { type: "array", items: { type: "object" } },
    },
  }),
  demoSkill({
    name: "contract-clause-extractor",
    displayName: "Contract Clause Extractor",
    description:
      "Extract renewal, termination, payment, data, and liability clauses from contracts for legal review.",
    authorName: "Compliance Desk",
    authorSlug: "compliance-desk",
    tags: ["legal", "contract", "compliance", "extraction"],
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    requiredInput: ["contractText"],
    inputProperties: {
      clauseTypes: { type: "array", items: { type: "string" } },
      contractText: { type: "string" },
    },
    requiredOutput: ["clauses", "missingClauses"],
    outputProperties: {
      clauses: { type: "array", items: { type: "object" } },
      missingClauses: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "privacy-policy-checker",
    displayName: "Privacy Policy Checker",
    description:
      "Check product data flows against privacy-policy promises and highlight missing disclosures.",
    authorName: "Compliance Desk",
    authorSlug: "compliance-desk",
    tags: ["legal", "privacy", "compliance", "security"],
    requiredInput: ["policyText", "dataFlows"],
    inputProperties: {
      dataFlows: { type: "array", items: { type: "object" } },
      policyText: { type: "string" },
    },
    requiredOutput: ["gaps", "risk"],
    outputProperties: {
      gaps: { type: "array", items: { type: "string" } },
      risk: { type: "string", enum: ["low", "medium", "high"] },
    },
  }),
  demoSkill({
    name: "vendor-risk-questionnaire",
    displayName: "Vendor Risk Questionnaire",
    description:
      "Generate vendor security and compliance questionnaires from integration scope and data handling needs.",
    authorName: "Compliance Desk",
    authorSlug: "compliance-desk",
    tags: ["legal", "vendor-risk", "security", "compliance"],
    requiredInput: ["vendorName", "integrationScope"],
    inputProperties: {
      dataCategories: { type: "array", items: { type: "string" } },
      integrationScope: { type: "string" },
      vendorName: { type: "string" },
    },
    requiredOutput: ["questions", "requiredEvidence"],
    outputProperties: {
      questions: { type: "array", items: { type: "object" } },
      requiredEvidence: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "terms-change-summarizer",
    displayName: "Terms Change Summarizer",
    description:
      "Compare two versions of legal terms and summarize meaningful customer, billing, or data changes.",
    authorName: "Compliance Desk",
    authorSlug: "compliance-desk",
    tags: ["legal", "terms", "review", "summary"],
    requiredInput: ["oldText", "newText"],
    inputProperties: {
      newText: { type: "string" },
      oldText: { type: "string" },
    },
    requiredOutput: ["summary", "materialChanges"],
    outputProperties: {
      materialChanges: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  }),
  demoSkill({
    name: "training-quiz-builder",
    displayName: "Training Quiz Builder",
    description:
      "Create quiz questions, answer keys, and remediation notes from training material.",
    authorName: "Learning Systems",
    authorSlug: "learning-systems",
    tags: ["education", "training", "quiz", "content"],
    requiredInput: ["trainingText"],
    inputProperties: {
      difficulty: { type: "string" },
      questionCount: { type: "number" },
      trainingText: { type: "string" },
    },
    requiredOutput: ["questions", "answerKey"],
    outputProperties: {
      answerKey: { type: "array", items: { type: "object" } },
      questions: { type: "array", items: { type: "object" } },
    },
  }),
  demoSkill({
    name: "lesson-plan-adapter",
    displayName: "Lesson Plan Adapter",
    description:
      "Adapt lesson plans by audience level, time limit, learning objective, and accessibility needs.",
    authorName: "Learning Systems",
    authorSlug: "learning-systems",
    tags: ["education", "lesson", "training", "accessibility"],
    requiredInput: ["lessonPlan", "audience"],
    inputProperties: {
      audience: { type: "string" },
      lessonPlan: { type: "string" },
      timeLimitMinutes: { type: "number" },
    },
    requiredOutput: ["adaptedPlan", "materials"],
    outputProperties: {
      adaptedPlan: { type: "array", items: { type: "object" } },
      materials: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "course-outline-generator",
    displayName: "Course Outline Generator",
    description:
      "Turn a target skill and learner profile into a course outline with modules and practice tasks.",
    authorName: "Learning Systems",
    authorSlug: "learning-systems",
    tags: ["education", "course", "training", "content"],
    requiredInput: ["learningGoal", "learnerProfile"],
    inputProperties: {
      learnerProfile: { type: "string" },
      learningGoal: { type: "string" },
      durationWeeks: { type: "number" },
    },
    requiredOutput: ["modules", "practiceTasks"],
    outputProperties: {
      modules: { type: "array", items: { type: "object" } },
      practiceTasks: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "rubric-feedback-assistant",
    displayName: "Rubric Feedback Assistant",
    description:
      "Apply a rubric to learner work and produce evidence-based feedback with improvement steps.",
    authorName: "Learning Systems",
    authorSlug: "learning-systems",
    tags: ["education", "rubric", "feedback", "review"],
    requiredInput: ["submission", "rubric"],
    inputProperties: {
      rubric: { type: "array", items: { type: "object" } },
      submission: { type: "string" },
    },
    requiredOutput: ["scores", "feedback"],
    outputProperties: {
      feedback: { type: "array", items: { type: "string" } },
      scores: { type: "array", items: { type: "object" } },
    },
  }),
  demoSkill({
    name: "churn-risk-summarizer",
    displayName: "Churn Risk Summarizer",
    description:
      "Summarize customer usage, tickets, sentiment, and renewal signals into churn risk and save actions.",
    authorName: "Customer Success Lab",
    authorSlug: "customer-success-lab",
    tags: ["sales", "customer-success", "revenue", "analysis"],
    requiredInput: ["accountSignals"],
    inputProperties: {
      accountSignals: { type: "object" },
      renewalDate: { type: "string" },
    },
    requiredOutput: ["risk", "drivers", "savePlan"],
    outputProperties: {
      drivers: { type: "array", items: { type: "string" } },
      risk: { type: "string", enum: ["low", "medium", "high"] },
      savePlan: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "customer-health-brief",
    displayName: "Customer Health Brief",
    description:
      "Create account health briefs for customer success meetings from usage, tickets, goals, and stakeholders.",
    authorName: "Customer Success Lab",
    authorSlug: "customer-success-lab",
    tags: ["sales", "customer-success", "crm", "summary"],
    requiredInput: ["accountName", "signals"],
    inputProperties: {
      accountName: { type: "string" },
      signals: { type: "object" },
    },
    requiredOutput: ["brief", "talkingPoints"],
    outputProperties: {
      brief: { type: "string" },
      talkingPoints: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "meeting-action-extractor",
    displayName: "Meeting Action Extractor",
    description:
      "Extract owners, deadlines, decisions, risks, and follow-up messages from meeting notes.",
    authorName: "Ops Automations",
    authorSlug: "ops-automations",
    tags: ["operations", "meeting", "automation", "summary"],
    requiredInput: ["notes"],
    inputProperties: {
      notes: { type: "string" },
      participants: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["actions", "decisions"],
    outputProperties: {
      actions: { type: "array", items: { type: "object" } },
      decisions: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "incident-summary-writer",
    displayName: "Incident Summary Writer",
    description:
      "Convert incident timeline notes into customer-safe summaries, internal learnings, and follow-up tasks.",
    authorName: "Ops Automations",
    authorSlug: "ops-automations",
    tags: ["operations", "incident", "support", "summary"],
    requiredInput: ["timeline"],
    inputProperties: {
      audience: { type: "string" },
      timeline: { type: "array", items: { type: "string" } },
    },
    requiredOutput: ["customerSummary", "internalActions"],
    outputProperties: {
      customerSummary: { type: "string" },
      internalActions: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "dashboard-anomaly-explainer",
    displayName: "Dashboard Anomaly Explainer",
    description:
      "Explain metric spikes or drops using dashboard rows, segment changes, and recent business events.",
    authorName: "Analyst Forge",
    authorSlug: "analyst-forge",
    tags: ["data", "dashboard", "anomaly", "analysis"],
    requiredInput: ["metric", "rows"],
    inputProperties: {
      events: { type: "array", items: { type: "string" } },
      metric: { type: "string" },
      rows: { type: "array", items: { type: "object" } },
    },
    requiredOutput: ["explanation", "checks"],
    outputProperties: {
      checks: { type: "array", items: { type: "string" } },
      explanation: { type: "string" },
    },
  }),
  demoSkill({
    name: "sql-question-translator",
    displayName: "SQL Question Translator",
    description:
      "Translate a plain-English analytics question into safe SQL draft, assumptions, and validation checks.",
    authorName: "Analyst Forge",
    authorSlug: "analyst-forge",
    tags: ["data", "sql", "analysis", "dev"],
    requiredInput: ["question", "schema"],
    inputProperties: {
      question: { type: "string" },
      schema: { type: "object" },
    },
    requiredOutput: ["sql", "assumptions", "checks"],
    outputProperties: {
      assumptions: { type: "array", items: { type: "string" } },
      checks: { type: "array", items: { type: "string" } },
      sql: { type: "string" },
    },
  }),
  demoSkill({
    name: "release-note-generator",
    displayName: "Release Note Generator",
    description:
      "Turn commits, tickets, and product notes into user-facing release notes and internal QA reminders.",
    authorName: "Builder Tools",
    authorSlug: "builder-tools",
    tags: ["dev", "release", "content", "summary"],
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    requiredInput: ["changes"],
    inputProperties: {
      audience: { type: "string" },
      changes: { type: "array", items: { type: "object" } },
    },
    requiredOutput: ["releaseNotes", "qaReminders"],
    outputProperties: {
      qaReminders: { type: "array", items: { type: "string" } },
      releaseNotes: { type: "array", items: { type: "string" } },
    },
  }),
  demoSkill({
    name: "log-error-clusterer",
    displayName: "Log Error Clusterer",
    description:
      "Cluster application logs into likely root causes, affected surfaces, and investigation priorities.",
    authorName: "Builder Tools",
    authorSlug: "builder-tools",
    tags: ["dev", "logs", "incident", "analysis"],
    permissions: {
      network: false,
      browser: false,
      filesystem: "read",
      secrets: [],
    },
    requiredInput: ["logs"],
    inputProperties: {
      logs: { type: "array", items: { type: "string" } },
      serviceName: { type: "string" },
    },
    requiredOutput: ["clusters", "priorities"],
    outputProperties: {
      clusters: { type: "array", items: { type: "object" } },
      priorities: { type: "array", items: { type: "string" } },
    },
  }),
];

type DemoSkillConfig = {
  authorName: string;
  authorSlug: string;
  description: string;
  displayName: string;
  inputProperties: Record<string, SkillManifest["inputSchema"]>;
  name: string;
  outputProperties: Record<string, SkillManifest["outputSchema"]>;
  permissions?: SkillManifest["permissions"];
  requiredInput: string[];
  requiredOutput: string[];
  runtime?: SkillManifest["runtime"];
  tags: string[];
  version?: string;
};

function demoSkill(config: DemoSkillConfig): SkillManifest {
  return {
    schemaVersion: "0.1",
    name: config.name,
    displayName: config.displayName,
    version: config.version ?? "0.1.0",
    description: config.description,
    author: {
      name: config.authorName,
      url: `https://useskillhub.com/publishers/${config.authorSlug}`,
    },
    tags: config.tags,
    runtime: config.runtime ?? {
      type: "http",
      entrypoint: `https://api.useskillhub.com/demo/${config.name}`,
    },
    permissions: config.permissions ?? {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: config.requiredInput,
      properties: config.inputProperties,
    },
    outputSchema: {
      type: "object",
      required: config.requiredOutput,
      properties: config.outputProperties,
    },
  };
}
