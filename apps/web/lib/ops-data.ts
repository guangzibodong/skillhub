type FinanceLedgerSummary = {
  grossCents: number;
  platformFeeCents: number;
  publisherShareCents: number;
  pendingBalanceCents: number;
  availableBalanceCents: number;
  unprocessedUsageCount: number;
};

export type FinanceLedgerTransaction = {
  id: string;
  skillSlug: string | null;
  skillName: string | null;
  grossCents: number;
  currency: string;
  status: string;
  platformFeeCents: number | null;
  publisherShareCents: number | null;
  balanceState: string | null;
  availableAt: string | null;
  createdAt: string;
};

export type FinanceLedger = {
  summary: FinanceLedgerSummary;
  recentTransactions: FinanceLedgerTransaction[];
};

export type AdminNotification = {
  id: string;
  eventType: string;
  channel: "email" | "in_app" | "webhook";
  subject: string | null;
  status: "queued" | "sent" | "failed" | "skipped";
  createdAt: string;
  deliveredAt: string | null;
};

export type PayoutRecord = {
  id: string;
  publisherProfileId: string;
  publisherName: string;
  amountCents: number;
  currency: string;
  status: "requested" | "review" | "processing" | "paid" | "failed" | "blocked";
  balanceCount: number;
  provider: string | null;
  accountStatus: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  paidAt: string | null;
  reviewReason: string | null;
  failureReason: string | null;
  providerReference: string | null;
};

export type PublisherPayoutSummary = {
  publisherProfile: {
    id: string;
    displayName: string;
    status: string;
    payoutStatus: string;
  } | null;
  balances: {
    pendingCents: number;
    availableCents: number;
    blockedCents: number;
    paidCents: number;
    currency: string;
    minPayoutCents: number;
    reviewThresholdCents: number;
  };
  payoutAccounts: Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  payouts: PayoutRecord[];
};

export type PublisherAccountSummary = {
  publisherProfile: {
    id: string;
    organizationId: string;
    displayName: string;
    status: string;
    payoutStatus: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  payoutAccounts: Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  onboardingSessions: Array<{
    id: string;
    payoutAccountId: string | null;
    provider: string;
    providerSessionId: string;
    onboardingUrl: string;
    returnUrl: string | null;
    refreshUrl: string | null;
    status: "created" | "opened" | "completed" | "expired" | "canceled";
    expiresAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type RefundRecord = {
  id: string;
  transactionId: string | null;
  adjustmentTransactionId: string | null;
  skillName: string | null;
  projectSlug: string | null;
  amountCents: number;
  currency: string;
  status: "requested" | "approved" | "posted" | "rejected" | "failed";
  reason: string | null;
  providerReference: string | null;
  createdAt: string;
  requestedAt: string;
  decidedAt: string | null;
  postedAt: string | null;
};

export type DisputeRecord = {
  id: string;
  transactionId: string | null;
  skillName: string | null;
  projectSlug: string | null;
  amountCents: number;
  currency: string;
  status: "open" | "won" | "lost" | "warning_needs_response";
  reason: string | null;
  externalReference: string | null;
  dueAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublisherSkillRecord = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  version: string | null;
  visibility: "public" | "private" | "unlisted";
  verificationStatus: "draft" | "submitted" | "verified" | "deprecated" | "rejected" | "suspended";
  permissionLevel: "low" | "medium" | "high";
  review: {
    status: string | null;
    riskLevel: "low" | "medium" | "high" | null;
    notes: string | null;
    decidedAt: string | null;
  };
  runtime: {
    checkCount: number;
    passedCount: number;
    failedCount: number;
    warningCount: number;
    health: "healthy" | "warning" | "needs_attention" | "not_checked";
  };
  analytics: {
    installCount: number;
    callCount: number;
    successCount: number;
    errorCount: number;
    blockedCount: number;
    successRate: number | null;
    avgLatencyMs: number | null;
    billableUsageCount: number;
    grossCents: number;
    currency: string;
  };
  pricing: {
    billingModel: "free" | "per_call" | "subscription";
    unitAmountCents: number;
    status: "draft" | "active" | "archived";
  };
  quality: {
    score: number | null;
    installSuccessRate: number | null;
    incidentCount: number;
    checklist: Array<{
      key: string;
      label: string;
      status: "complete" | "missing" | "needs_attention" | "waiting";
    }>;
  };
  updatedAt: string;
};

export type BuyerRequestRecord = {
  id: string;
  requesterOrganizationId: string | null;
  requesterOrganizationName: string | null;
  title: string;
  description: string;
  category: string;
  bountyCents: number;
  currency: string;
  status: "open" | "claimed" | "submitted" | "matched" | "closed" | "canceled";
  claimedByPublisherId: string | null;
  claimedByPublisherName: string | null;
  claimedByPublisherOrganizationId: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  canClaim: boolean;
  nextAction: string;
};

export type DeveloperProjectRecord = {
  id: string;
  slug: string;
  name: string;
  apiKeys: {
    activeCount: number;
    revokedCount: number;
  };
  installs: {
    installedSkillCount: number;
    approvedSkillCount: number;
    ownerRequiredCount: number;
    suspendedInstallCount: number;
  };
  policy: {
    policyCount: number;
    approvalRequiredCount: number;
    monthlyBudgetCents: number;
    state: "approved" | "owner_review" | "suspended";
  };
  runtime: {
    callCount: number;
    successCount: number;
    errorCount: number;
    blockedCount: number;
    successRate: number | null;
    avgLatencyMs: number | null;
  };
  usage: {
    billableUsageCount: number;
    grossCents: number;
    currency: string;
  };
  subscriptions: {
    activeCount: number;
  };
  updates: {
    count: number;
    latestAt: string | null;
  };
  createdAt: string;
};

export type DeveloperProjectSkillRecord = {
  skillSlug: string;
  displayName: string;
  description: string;
  version: string | null;
  verificationStatus: "draft" | "submitted" | "verified" | "deprecated" | "rejected" | "suspended";
  status: string;
  approvalState: string;
  permissionLevel: "low" | "medium" | "high";
  installedAt: string;
  updatedAt: string;
  policy: {
    maxPermissionLevel: "low" | "medium" | "high";
    allowNetwork: boolean;
    allowBrowser: boolean;
    filesystemAccess: "none" | "read" | "write";
    allowSecretAccess: boolean;
    monthlyBudgetCents: number;
    rateLimitPerMinute: number | null;
    approvalRequired: boolean;
    approvedAt: string | null;
    state: "approved" | "owner_review" | "suspended";
  };
  runtime: {
    callCount: number;
    successCount: number;
    errorCount: number;
    blockedCount: number;
    successRate: number | null;
    avgLatencyMs: number | null;
  };
  usage: {
    billableUsageCount: number;
    grossCents: number;
    currency: string;
  };
  pricing: {
    billingModel: "free" | "per_call" | "subscription";
    unitAmountCents: number;
    currency: string;
    status: "draft" | "active" | "archived";
  };
  updates: {
    count: number;
    latestAt: string | null;
  };
  incidents: {
    openCount: number;
  };
};

export type DeveloperProjectApiKeyRecord = {
  id: string;
  projectSlug: string;
  name: string;
  keyPrefix: string;
  keyLast4: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export type DeveloperProjectUpdateRecord = {
  id: string;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
  body: string | null;
  actionStatus: string;
  actionNote: string | null;
  scheduledFor: string | null;
  resolvedAt: string | null;
  actionUpdatedAt: string | null;
  createdAt: string;
};

export type DeveloperProjectInvocationRecord = {
  id: string;
  skillSlug: string | null;
  displayName: string | null;
  version: string | null;
  status: "success" | "error" | "blocked";
  latencyMs: number | null;
  errorCode: string | null;
  createdAt: string;
};

export type DeveloperProjectSubscriptionRecord = {
  id: string;
  skillSlug: string;
  displayName: string;
  status: string;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  pausedAt: string | null;
  canceledAt: string | null;
  updatedAt: string | null;
  createdAt: string;
};

export type DeveloperProjectDetail = {
  project: DeveloperProjectRecord;
  installedSkills: DeveloperProjectSkillRecord[];
  apiKeys: DeveloperProjectApiKeyRecord[];
  updateInbox: DeveloperProjectUpdateRecord[];
  recentInvocations: DeveloperProjectInvocationRecord[];
  subscriptions: DeveloperProjectSubscriptionRecord[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

const fallbackLedger: FinanceLedger = {
  summary: {
    grossCents: 1860000,
    platformFeeCents: 372000,
    publisherShareCents: 1488000,
    pendingBalanceCents: 126000,
    availableBalanceCents: 482000,
    unprocessedUsageCount: 0
  },
  recentTransactions: [
    {
      id: "demo-usage-browser-research",
      skillSlug: "browser-research",
      skillName: "Browser Research",
      grossCents: 124000,
      currency: "usd",
      status: "posted",
      platformFeeCents: 24800,
      publisherShareCents: 99200,
      balanceState: "available",
      availableAt: "demo",
      createdAt: "demo"
    },
    {
      id: "demo-usage-support-triage",
      skillSlug: "support-triage",
      skillName: "Support Triage",
      grossCents: 76000,
      currency: "usd",
      status: "posted",
      platformFeeCents: 15200,
      publisherShareCents: 60800,
      balanceState: "pending",
      availableAt: "demo",
      createdAt: "demo"
    }
  ]
};

const fallbackNotifications: AdminNotification[] = [
  {
    id: "demo-billing-posted",
    eventType: "billing.usage_posted",
    channel: "in_app",
    subject: "Billable usage posted to ledger",
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  },
  {
    id: "demo-review-approved",
    eventType: "skill.review.approved",
    channel: "in_app",
    subject: "Skill review approved",
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  }
];

const fallbackPayouts: PayoutRecord[] = [
  {
    id: "demo-payout-review",
    publisherProfileId: "demo-publisher",
    publisherName: "SkillHub Publisher",
    amountCents: 480000,
    currency: "usd",
    status: "review",
    balanceCount: 4,
    provider: "manual_deferred",
    accountStatus: "verified",
    requestedAt: "demo",
    reviewedAt: null,
    paidAt: null,
    reviewReason: "High-value payout queued for manual review.",
    failureReason: null,
    providerReference: null
  }
];

const fallbackPublisherPayoutSummary: PublisherPayoutSummary = {
  publisherProfile: {
    id: "demo-publisher",
    displayName: "SkillHub Publisher",
    status: "active",
    payoutStatus: "verified"
  },
  balances: {
    pendingCents: 126000,
    availableCents: 482000,
    blockedCents: 480000,
    paidCents: 940000,
    currency: "usd",
    minPayoutCents: 1000,
    reviewThresholdCents: 50000
  },
  payoutAccounts: [
    {
      id: "demo-payout-account",
      provider: "manual_deferred",
      providerAccountId: "manual_deferred_demo",
      status: "verified",
      createdAt: "demo",
      updatedAt: "demo"
    }
  ],
  payouts: fallbackPayouts
};

const fallbackPublisherAccountSummary: PublisherAccountSummary = {
  publisherProfile: {
    id: "demo-publisher",
    organizationId: "demo-org",
    displayName: "SkillHub Publisher",
    status: "active",
    payoutStatus: "verification_required",
    createdAt: "demo",
    updatedAt: "demo"
  },
  payoutAccounts: [
    {
      id: "demo-payout-account",
      provider: "manual_deferred",
      providerAccountId: "manual_deferred_demo",
      status: "verification_required",
      createdAt: "demo",
      updatedAt: "demo"
    }
  ],
  onboardingSessions: [
    {
      id: "demo-onboarding-session",
      payoutAccountId: "demo-payout-account",
      provider: "manual_deferred",
      providerSessionId: "po_demo_session",
      onboardingUrl: "https://app.useskillhub.com/dashboard?payout_onboarding=demo",
      returnUrl: null,
      refreshUrl: null,
      status: "created",
      expiresAt: "demo",
      completedAt: null,
      createdAt: "demo",
      updatedAt: "demo"
    }
  ]
};

const fallbackRefunds: RefundRecord[] = [
  {
    id: "demo-refund-request",
    transactionId: "demo-usage-browser-research",
    adjustmentTransactionId: null,
    skillName: "Browser Research",
    projectSlug: "research-agent",
    amountCents: 9600,
    currency: "usd",
    status: "requested",
    reason: "Buyer reported duplicate billable call.",
    providerReference: null,
    createdAt: "demo",
    requestedAt: "demo",
    decidedAt: null,
    postedAt: null
  }
];

const fallbackDisputes: DisputeRecord[] = [
  {
    id: "demo-dispute-warning",
    transactionId: "demo-usage-support-triage",
    skillName: "Support Triage",
    projectSlug: "support-agent",
    amountCents: 7600,
    currency: "usd",
    status: "warning_needs_response",
    reason: "Card network warning needs evidence before deadline.",
    externalReference: "dp_demo_warning",
    dueAt: "demo",
    resolvedAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  }
];

const fallbackPublisherSkills: PublisherSkillRecord[] = [
  {
    id: "browser-research",
    slug: "browser-research",
    displayName: "Browser Research",
    description: "Research a web topic and return concise findings with source URLs.",
    version: "0.1.0",
    visibility: "public",
    verificationStatus: "verified",
    permissionLevel: "medium",
    review: {
      status: "approved",
      riskLevel: "medium",
      notes: "Manifest, runtime, and examples accepted.",
      decidedAt: "demo"
    },
    runtime: {
      checkCount: 4,
      passedCount: 4,
      failedCount: 0,
      warningCount: 0,
      health: "healthy"
    },
    analytics: {
      installCount: 46,
      callCount: 18400,
      successCount: 17664,
      errorCount: 736,
      blockedCount: 0,
      successRate: 0.96,
      avgLatencyMs: 1280,
      billableUsageCount: 12400,
      grossCents: 248000,
      currency: "usd"
    },
    pricing: {
      billingModel: "per_call",
      unitAmountCents: 2,
      status: "active"
    },
    quality: {
      score: 86,
      installSuccessRate: 0.96,
      incidentCount: 0,
      checklist: [
        { key: "manifest", label: "Manifest", status: "complete" },
        { key: "review", label: "Review signal", status: "complete" },
        { key: "runtime", label: "Runtime health", status: "complete" },
        { key: "pricing", label: "Pricing", status: "complete" },
        { key: "usage", label: "Usage signal", status: "complete" }
      ]
    },
    updatedAt: "demo"
  },
  {
    id: "dataset-summarizer",
    slug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    description: "Summarize structured datasets with typed output.",
    version: "0.1.0",
    visibility: "public",
    verificationStatus: "submitted",
    permissionLevel: "medium",
    review: {
      status: "queued",
      riskLevel: "medium",
      notes: "Needs data retention review.",
      decidedAt: null
    },
    runtime: {
      checkCount: 4,
      passedCount: 2,
      failedCount: 1,
      warningCount: 0,
      health: "needs_attention"
    },
    analytics: {
      installCount: 12,
      callCount: 9200,
      successCount: 8832,
      errorCount: 368,
      blockedCount: 0,
      successRate: 0.96,
      avgLatencyMs: 1420,
      billableUsageCount: 0,
      grossCents: 0,
      currency: "usd"
    },
    pricing: {
      billingModel: "free",
      unitAmountCents: 0,
      status: "active"
    },
    quality: {
      score: 64,
      installSuccessRate: 0.96,
      incidentCount: 1,
      checklist: [
        { key: "manifest", label: "Manifest", status: "complete" },
        { key: "review", label: "Review signal", status: "complete" },
        { key: "runtime", label: "Runtime health", status: "needs_attention" },
        { key: "pricing", label: "Pricing", status: "complete" },
        { key: "usage", label: "Usage signal", status: "complete" }
      ]
    },
    updatedAt: "demo"
  }
];

const fallbackBuyerRequests: BuyerRequestRecord[] = [
  {
    id: "demo-request-figma-linear",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "OpsPilot",
    title: "Figma change request to Linear issue",
    description: "Convert annotated Figma comments into scoped Linear issues with acceptance criteria.",
    category: "workflow",
    bountyCents: 60000,
    currency: "usd",
    status: "open",
    claimedByPublisherId: null,
    claimedByPublisherName: null,
    claimedByPublisherOrganizationId: null,
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: true,
    nextAction: "Claim request"
  },
  {
    id: "demo-request-shopify-ops",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "Commerce Desk",
    title: "Shopify product operations skill",
    description: "Normalize product attributes, flag missing SEO fields, and prepare bulk update actions.",
    category: "commerce",
    bountyCents: 90000,
    currency: "usd",
    status: "claimed",
    claimedByPublisherId: "demo-publisher",
    claimedByPublisherName: "SkillHub Publisher",
    claimedByPublisherOrganizationId: "demo-org",
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: false,
    nextAction: "Submit build"
  },
  {
    id: "demo-request-slack-incident",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "Reliability AI",
    title: "Slack incident summarizer",
    description: "Summarize incident threads into timeline, owner actions, and customer-impact notes.",
    category: "ops",
    bountyCents: 45000,
    currency: "usd",
    status: "submitted",
    claimedByPublisherId: "demo-publisher",
    claimedByPublisherName: "SkillHub Publisher",
    claimedByPublisherOrganizationId: "demo-org",
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: false,
    nextAction: "Await buyer match"
  }
];

const fallbackDeveloperProjects: DeveloperProjectRecord[] = [
  {
    id: "demo-project-research",
    slug: "research-agent",
    name: "Research Agent",
    apiKeys: {
      activeCount: 2,
      revokedCount: 1
    },
    installs: {
      installedSkillCount: 8,
      approvedSkillCount: 7,
      ownerRequiredCount: 1,
      suspendedInstallCount: 0
    },
    policy: {
      policyCount: 8,
      approvalRequiredCount: 1,
      monthlyBudgetCents: 48000,
      state: "owner_review"
    },
    runtime: {
      callCount: 18400,
      successCount: 17664,
      errorCount: 642,
      blockedCount: 94,
      successRate: 0.96,
      avgLatencyMs: 1280
    },
    usage: {
      billableUsageCount: 12400,
      grossCents: 248000,
      currency: "usd"
    },
    subscriptions: {
      activeCount: 3
    },
    updates: {
      count: 2,
      latestAt: "demo"
    },
    createdAt: "demo"
  },
  {
    id: "demo-project-support",
    slug: "support-agent",
    name: "Support Agent",
    apiKeys: {
      activeCount: 1,
      revokedCount: 0
    },
    installs: {
      installedSkillCount: 5,
      approvedSkillCount: 5,
      ownerRequiredCount: 0,
      suspendedInstallCount: 0
    },
    policy: {
      policyCount: 5,
      approvalRequiredCount: 0,
      monthlyBudgetCents: 12000,
      state: "approved"
    },
    runtime: {
      callCount: 9200,
      successCount: 8832,
      errorCount: 318,
      blockedCount: 50,
      successRate: 0.96,
      avgLatencyMs: 940
    },
    usage: {
      billableUsageCount: 0,
      grossCents: 0,
      currency: "usd"
    },
    subscriptions: {
      activeCount: 1
    },
    updates: {
      count: 1,
      latestAt: "demo"
    },
    createdAt: "demo"
  }
];

const fallbackDeveloperProjectDetails: DeveloperProjectDetail[] = fallbackDeveloperProjects.map((project) => {
  const isResearch = project.slug === "research-agent";

  return {
    project,
    installedSkills: [
      {
        skillSlug: "browser-research",
        displayName: "Browser Research",
        description: "Research a web topic and return concise findings with source URLs.",
        version: "0.1.0",
        verificationStatus: "verified",
        status: "installed",
        approvalState: "approved",
        permissionLevel: "medium",
        installedAt: "demo",
        updatedAt: "demo",
        policy: {
          maxPermissionLevel: "medium",
          allowNetwork: true,
          allowBrowser: true,
          filesystemAccess: "none",
          allowSecretAccess: false,
          monthlyBudgetCents: isResearch ? 48000 : 12000,
          rateLimitPerMinute: 60,
          approvalRequired: false,
          approvedAt: "demo",
          state: "approved"
        },
        runtime: {
          callCount: isResearch ? 18400 : 9200,
          successCount: isResearch ? 17664 : 8832,
          errorCount: isResearch ? 642 : 318,
          blockedCount: isResearch ? 94 : 50,
          successRate: 0.96,
          avgLatencyMs: isResearch ? 1280 : 940
        },
        usage: {
          billableUsageCount: isResearch ? 12400 : 0,
          grossCents: isResearch ? 248000 : 0,
          currency: "usd"
        },
        pricing: {
          billingModel: isResearch ? "per_call" : "free",
          unitAmountCents: isResearch ? 2 : 0,
          currency: "usd",
          status: "active"
        },
        updates: {
          count: isResearch ? 2 : 1,
          latestAt: "demo"
        },
        incidents: {
          openCount: 0
        }
      },
      {
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        description: "Summarize structured datasets with typed output.",
        version: "0.1.0",
        verificationStatus: "submitted",
        status: "installed",
        approvalState: isResearch ? "owner_required" : "approved",
        permissionLevel: "medium",
        installedAt: "demo",
        updatedAt: "demo",
        policy: {
          maxPermissionLevel: "medium",
          allowNetwork: false,
          allowBrowser: false,
          filesystemAccess: "read",
          allowSecretAccess: false,
          monthlyBudgetCents: isResearch ? 0 : 8000,
          rateLimitPerMinute: 30,
          approvalRequired: isResearch,
          approvedAt: isResearch ? null : "demo",
          state: isResearch ? "owner_review" : "approved"
        },
        runtime: {
          callCount: 9200,
          successCount: 8832,
          errorCount: 318,
          blockedCount: 50,
          successRate: 0.96,
          avgLatencyMs: 1420
        },
        usage: {
          billableUsageCount: 0,
          grossCents: 0,
          currency: "usd"
        },
        pricing: {
          billingModel: "free",
          unitAmountCents: 0,
          currency: "usd",
          status: "active"
        },
        updates: {
          count: 1,
          latestAt: "demo"
        },
        incidents: {
          openCount: isResearch ? 1 : 0
        }
      }
    ],
    apiKeys: [
      {
        id: `demo-key-${project.slug}-primary`,
        projectSlug: project.slug,
        name: "Production runtime",
        keyPrefix: "skh",
        keyLast4: "demo",
        lastUsedAt: "demo",
        createdAt: "demo",
        revokedAt: null
      },
      {
        id: `demo-key-${project.slug}-rotation`,
        projectSlug: project.slug,
        name: "Rotation candidate",
        keyPrefix: "skh",
        keyLast4: "next",
        lastUsedAt: null,
        createdAt: "demo",
        revokedAt: null
      }
    ],
    updateInbox: [
      {
        id: `demo-update-${project.slug}-browser-research`,
        skillSlug: "browser-research",
        displayName: "Browser Research",
        eventType: "new_version",
        severity: "info",
        title: "New citation freshness scoring available",
        body: "Version 0.1.1 adds fresher source ranking for research agents.",
        actionStatus: "open",
        actionNote: null,
        scheduledFor: null,
        resolvedAt: null,
        actionUpdatedAt: null,
        createdAt: "demo"
      },
      {
        id: `demo-update-${project.slug}-dataset-summarizer`,
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        eventType: "security",
        severity: "medium",
        title: "File-retention policy requires review",
        body: "Project owner approval is required before broad file reads are enabled.",
        actionStatus: isResearch ? "scheduled" : "open",
        actionNote: isResearch ? "Review during weekly agent safety window." : null,
        scheduledFor: isResearch ? "demo" : null,
        resolvedAt: null,
        actionUpdatedAt: isResearch ? "demo" : null,
        createdAt: "demo"
      }
    ],
    recentInvocations: [
      {
        id: `demo-invocation-${project.slug}-success`,
        skillSlug: "browser-research",
        displayName: "Browser Research",
        version: "0.1.0",
        status: "success",
        latencyMs: isResearch ? 1184 : 840,
        errorCode: null,
        createdAt: "demo"
      },
      {
        id: `demo-invocation-${project.slug}-blocked`,
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        version: "0.1.0",
        status: "blocked",
        latencyMs: 42,
        errorCode: "policy_approval_required",
        createdAt: "demo"
      }
    ],
    subscriptions: [
      {
        id: `demo-subscription-${project.slug}-browser-research`,
        skillSlug: "browser-research",
        displayName: "Browser Research",
        status: isResearch ? "active" : "trialing",
        billingModel: isResearch ? "per_call" : "free",
        unitAmountCents: isResearch ? 2 : 0,
        currency: "usd",
        currentPeriodStart: "demo",
        currentPeriodEnd: "demo",
        pausedAt: null,
        canceledAt: null,
        updatedAt: "demo",
        createdAt: "demo"
      }
    ]
  };
});

export async function getFinanceLedger(): Promise<FinanceLedger> {
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return fallbackLedger;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/finance/ledger`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Finance ledger failed: ${response.status}`);
    }

    return (await response.json()) as FinanceLedger;
  } catch {
    return fallbackLedger;
  }
}

export async function getPublisherFinanceLedger(): Promise<FinanceLedger> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackLedger;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/finance/ledger`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher finance ledger failed: ${response.status}`);
    }

    return (await response.json()) as FinanceLedger;
  } catch {
    return fallbackLedger;
  }
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return fallbackNotifications;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/notifications?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin notifications failed: ${response.status}`);
    }

    const payload = (await response.json()) as { notifications: AdminNotification[] };
    return payload.notifications;
  } catch {
    return fallbackNotifications;
  }
}

export async function getAdminPayouts(): Promise<PayoutRecord[]> {
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return fallbackPayouts;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/payouts?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin payouts failed: ${response.status}`);
    }

    const payload = (await response.json()) as { payouts: PayoutRecord[] };
    return payload.payouts;
  } catch {
    return fallbackPayouts;
  }
}

export async function getPublisherPayoutSummary(): Promise<PublisherPayoutSummary> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackPublisherPayoutSummary;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/payouts`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher payouts failed: ${response.status}`);
    }

    return (await response.json()) as PublisherPayoutSummary;
  } catch {
    return fallbackPublisherPayoutSummary;
  }
}

export async function getPublisherAccountSummary(): Promise<PublisherAccountSummary> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackPublisherAccountSummary;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/profile`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher account failed: ${response.status}`);
    }

    return (await response.json()) as PublisherAccountSummary;
  } catch {
    return fallbackPublisherAccountSummary;
  }
}

export async function getPublisherSkills(): Promise<PublisherSkillRecord[]> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackPublisherSkills;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/skills?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher skills failed: ${response.status}`);
    }

    const payload = (await response.json()) as { skills: PublisherSkillRecord[] };
    return payload.skills;
  } catch {
    return fallbackPublisherSkills;
  }
}

export async function getPublisherBuyerRequests(): Promise<BuyerRequestRecord[]> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackBuyerRequests;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/buyer-requests?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher buyer requests failed: ${response.status}`);
    }

    const payload = (await response.json()) as { requests: BuyerRequestRecord[] };
    return payload.requests;
  } catch {
    return fallbackBuyerRequests;
  }
}

export async function getDeveloperProjects(): Promise<DeveloperProjectRecord[]> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackDeveloperProjects;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/developer/projects?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Developer projects failed: ${response.status}`);
    }

    const payload = (await response.json()) as { projects: DeveloperProjectRecord[] };
    return payload.projects;
  } catch {
    return fallbackDeveloperProjects;
  }
}

export async function getDeveloperProjectDetail(projectSlug: string): Promise<DeveloperProjectDetail | null> {
  const fallback = fallbackDeveloperProjectDetails.find((detail) => detail.project.slug === projectSlug) ?? null;
  const token = getWorkspaceToken();

  if (!token) {
    return fallback;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/developer/projects/${encodeURIComponent(projectSlug)}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      return fallback;
    }

    if (!response.ok) {
      throw new Error(`Developer project detail failed: ${response.status}`);
    }

    const payload = (await response.json()) as { project: DeveloperProjectDetail };
    return payload.project;
  } catch {
    return fallback;
  }
}

export async function getPublisherRefunds(): Promise<RefundRecord[]> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackRefunds;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/refunds?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher refunds failed: ${response.status}`);
    }

    const payload = (await response.json()) as { refunds: RefundRecord[] };
    return payload.refunds;
  } catch {
    return fallbackRefunds;
  }
}

export async function getPublisherDisputes(): Promise<DisputeRecord[]> {
  const token = getWorkspaceToken();

  if (!token) {
    return fallbackDisputes;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/publisher/disputes?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Publisher disputes failed: ${response.status}`);
    }

    const payload = (await response.json()) as { disputes: DisputeRecord[] };
    return payload.disputes;
  } catch {
    return fallbackDisputes;
  }
}

export async function getAdminRefunds(): Promise<RefundRecord[]> {
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return fallbackRefunds;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/finance/refunds?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin refunds failed: ${response.status}`);
    }

    const payload = (await response.json()) as { refunds: RefundRecord[] };
    return payload.refunds;
  } catch {
    return fallbackRefunds;
  }
}

export async function getAdminDisputes(): Promise<DisputeRecord[]> {
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return fallbackDisputes;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/finance/disputes?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin disputes failed: ${response.status}`);
    }

    const payload = (await response.json()) as { disputes: DisputeRecord[] };
    return payload.disputes;
  } catch {
    return fallbackDisputes;
  }
}

export function formatMoney(cents: number | null | undefined, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format((cents ?? 0) / 100);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "percent"
  }).format(value);
}

export function formatCompactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact"
  }).format(value ?? 0);
}

function getWorkspaceToken() {
  return process.env.SKILLHUB_USER_TOKEN ?? process.env.SKILLHUB_ADMIN_TOKEN;
}
