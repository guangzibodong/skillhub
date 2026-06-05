import type { SkillFeedbackRecord } from "@/lib/skill-feedback";

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

export type OrganizationRole = "owner" | "admin" | "developer" | "publisher" | "reviewer" | "finance";

export type OrganizationTeamMember = {
  userId: string;
  email: string;
  displayName: string | null;
  platformRole: string;
  role: OrganizationRole;
  tokenCount: number;
  activeTokenCount: number;
  lastTokenUsedAt: string | null;
  memberSince: string;
};

export type OrganizationWebhookEndpoint = {
  id: string;
  organizationId: string;
  url: string;
  description: string | null;
  events: string[];
  status: "active" | "disabled" | "paused";
  signingSecretPrefix: string;
  signingSecretLast4: string;
  lastDeliveryStatus: "delivered" | "failed" | "pending" | "skipped" | null;
  lastDeliveredAt: string | null;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminReviewRecord = {
  id: string;
  skillSlug: string;
  displayName: string;
  version: string | null;
  status: "approved" | "blocked" | "in_review" | "queued" | "rejected" | string;
  riskLevel: "low" | "medium" | "high" | string | null;
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export type UserNotificationRecord = {
  id: string;
  eventType: string;
  channel: "email" | "in_app" | "webhook";
  subject: string | null;
  payload: Record<string, unknown>;
  status: "queued" | "sent" | "failed" | "skipped";
  createdAt: string;
  deliveredAt: string | null;
};

export type UserNotificationSummary = {
  failed: number;
  read: number;
  skipped: number;
  topics: Array<{
    count: number;
    topic: string;
    unreadCount: number;
  }>;
  total: number;
  unread: number;
};

export type UserNotificationInbox = {
  notifications: UserNotificationRecord[];
  summary: UserNotificationSummary;
};

export type NotificationPreferenceRecord = {
  category: string;
  description: string;
  emailEnabled: boolean;
  eventType: string;
  inAppEnabled: boolean;
  label: string;
  updatedAt: string | null;
  webhookEnabled: boolean;
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

export type OrganizationBillingProfile = {
  id: string;
  organizationId: string;
  billingName: string;
  billingEmail: string | null;
  taxId: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  invoiceNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationPaymentMethod = {
  id: string;
  organizationId: string;
  provider: string;
  providerCustomerId: string | null;
  providerPaymentMethodId: string | null;
  methodType: "bank_account" | "card" | "external" | "invoice";
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  status: "not_configured" | "pending" | "ready" | "requires_action" | "failed" | "disabled";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationBillingSummary = {
  billingProfile: OrganizationBillingProfile | null;
  paymentMethods: OrganizationPaymentMethod[];
  summary: {
    defaultPaymentMethodStatus: string;
    invoiceReady: boolean;
    paymentMethodCount: number;
    profileComplete: boolean;
  };
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

export type AbuseReportRecord = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  skillVisibility: string;
  skillVerificationStatus: string;
  category: "malicious" | "security" | "privacy" | "copyright" | "spam" | "quality" | "billing" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "triaged" | "dismissed" | "warning_sent" | "restricted" | "suspended" | "resolved";
  title: string;
  description: string;
  evidenceUrl: string | null;
  reporterEmail: string | null;
  reporterOrganizationName: string | null;
  projectSlug: string | null;
  decisionReason: string | null;
  decidedAt: string | null;
  latestAction: "triage" | "dismiss" | "warn" | "restrict" | "suspend" | "resolve" | null;
  latestActionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminIncidentRecord = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  skillVersionId: string | null;
  status: "open" | "monitoring" | "resolved" | "postmortem";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string | null;
  startedAt: string;
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
  feedback?: {
    averageRating: number | null;
    publishedCount: number;
    pendingCount: number;
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

export type DeveloperProjectSavedSkillRecord = {
  id: string;
  projectSlug: string;
  skillSlug: string;
  displayName: string;
  description: string;
  version: string | null;
  verificationStatus: "draft" | "submitted" | "verified" | "deprecated" | "rejected" | "suspended";
  permissionLevel: "low" | "medium" | "high";
  collectionName: string;
  installedStatus: string | null;
  pricing: {
    billingModel: "free" | "per_call" | "subscription";
    currency: string;
    status: "draft" | "active" | "archived";
    unitAmountCents: number;
  };
  savedAt: string;
};

export type DeveloperProjectInvoiceRecord = {
  id: string;
  projectSlug: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  lineItemCount: number;
};

export type DeveloperProjectDetail = {
  project: DeveloperProjectRecord;
  installedSkills: DeveloperProjectSkillRecord[];
  apiKeys: DeveloperProjectApiKeyRecord[];
  updateInbox: DeveloperProjectUpdateRecord[];
  recentInvocations: DeveloperProjectInvocationRecord[];
  subscriptions: DeveloperProjectSubscriptionRecord[];
  invoices: DeveloperProjectInvoiceRecord[];
  savedSkills: DeveloperProjectSavedSkillRecord[];
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

const fallbackOrganizationTeam: OrganizationTeamMember[] = [
  {
    userId: "demo-user-owner",
    email: "owner@useskillhub.com",
    displayName: "SkillHub Owner",
    platformRole: "admin",
    role: "owner",
    tokenCount: 2,
    activeTokenCount: 2,
    lastTokenUsedAt: "demo",
    memberSince: "demo"
  },
  {
    userId: "demo-user-developer",
    email: "developer@useskillhub.com",
    displayName: "Agent Developer",
    platformRole: "user",
    role: "developer",
    tokenCount: 1,
    activeTokenCount: 1,
    lastTokenUsedAt: "demo",
    memberSince: "demo"
  },
  {
    userId: "demo-user-finance",
    email: "finance@useskillhub.com",
    displayName: "Finance Operator",
    platformRole: "finance",
    role: "finance",
    tokenCount: 1,
    activeTokenCount: 0,
    lastTokenUsedAt: null,
    memberSince: "demo"
  }
];

const fallbackOrganizationWebhookEndpoints: OrganizationWebhookEndpoint[] = [
  {
    id: "demo-webhook-ops",
    organizationId: "demo-org",
    url: "https://example.com/skillhub/webhooks",
    description: "Operations automation receiver",
    events: ["skill.update", "runtime.incident", "account.security"],
    status: "active",
    signingSecretPrefix: "whsec",
    signingSecretLast4: "demo",
    lastDeliveryStatus: "pending",
    lastDeliveredAt: null,
    failureCount: 0,
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-webhook-finance",
    organizationId: "demo-org",
    url: "https://example.com/finance/events",
    description: "Finance reconciliation receiver",
    events: ["finance.billing", "publisher.payout"],
    status: "paused",
    signingSecretPrefix: "whsec",
    signingSecretLast4: "fin1",
    lastDeliveryStatus: "skipped",
    lastDeliveredAt: null,
    failureCount: 1,
    createdAt: "demo",
    updatedAt: "demo"
  }
];

const fallbackAdminReviews: AdminReviewRecord[] = [
  {
    id: "demo-review-browser-research",
    skillSlug: "browser-research",
    displayName: "Browser Research",
    version: "0.1.0",
    status: "queued",
    riskLevel: "medium",
    notes: "Validate browser domain allowlist, citation output schema, and pricing readiness before approval.",
    createdAt: "demo",
    decidedAt: null
  },
  {
    id: "demo-review-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    version: "0.1.0",
    status: "in_review",
    riskLevel: "low",
    notes: "Runtime passed; reviewer should confirm file-retention wording and example output coverage.",
    createdAt: "demo",
    decidedAt: null
  },
  {
    id: "demo-review-local-file-agent",
    skillSlug: "local-file-agent",
    displayName: "Local File Agent",
    version: "0.2.0",
    status: "blocked",
    riskLevel: "high",
    notes: "Filesystem write access requires explicit owner approval and stronger rollback instructions.",
    createdAt: "demo",
    decidedAt: null
  }
];

const fallbackUserNotifications: UserNotificationRecord[] = [
  {
    id: "demo-buyer-request-claimed",
    eventType: "buyer_request.claimed",
    channel: "in_app",
    subject: "Your buyer request was claimed",
    payload: {
      requestId: "demo-request-figma-linear",
      title: "Figma change request to Linear issue"
    },
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  },
  {
    id: "demo-skill-update",
    eventType: "skill.update",
    channel: "in_app",
    subject: "New citation freshness scoring available",
    payload: {
      projectSlug: "research-agent",
      skillSlug: "browser-research"
    },
    status: "sent",
    createdAt: "demo",
    deliveredAt: "demo"
  },
  {
    id: "demo-payout-review",
    eventType: "publisher.payout",
    channel: "in_app",
    subject: "Payout request entered review",
    payload: {
      amountCents: 480000,
      currency: "usd"
    },
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  }
];
const fallbackUserNotificationInbox: UserNotificationInbox = {
  notifications: fallbackUserNotifications,
  summary: summarizeUserNotifications(fallbackUserNotifications)
};

const fallbackNotificationPreferences: NotificationPreferenceRecord[] = [
  {
    category: "trust",
    description: "Review decisions, rejection notes, and verification state changes.",
    emailEnabled: true,
    eventType: "skill.review",
    inAppEnabled: true,
    label: "Skill review",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "operations",
    description: "New versions, deprecations, security notices, and project update inbox events.",
    emailEnabled: true,
    eventType: "skill.update",
    inAppEnabled: true,
    label: "Skill updates",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "runtime",
    description: "Runtime incidents, blocked calls, and quality signals that need operator attention.",
    emailEnabled: true,
    eventType: "runtime.incident",
    inAppEnabled: true,
    label: "Runtime incidents",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "finance",
    description: "Invoice generation, billing profile changes, usage posting, refunds, and disputes.",
    emailEnabled: true,
    eventType: "finance.billing",
    inAppEnabled: true,
    label: "Billing and disputes",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "publisher",
    description: "Payout account onboarding, payout review decisions, blocked payouts, and balance milestones.",
    emailEnabled: true,
    eventType: "publisher.payout",
    inAppEnabled: true,
    label: "Payouts",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "marketplace",
    description: "Buyer request claims, submissions, matches, cancellations, and demand updates.",
    emailEnabled: true,
    eventType: "buyer.request",
    inAppEnabled: true,
    label: "Buyer requests",
    updatedAt: null,
    webhookEnabled: false
  },
  {
    category: "account",
    description: "API keys, organization billing readiness, and sensitive account operations.",
    emailEnabled: true,
    eventType: "account.security",
    inAppEnabled: true,
    label: "Account and security",
    updatedAt: null,
    webhookEnabled: false
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

const fallbackOrganizationBillingSummary: OrganizationBillingSummary = {
  billingProfile: {
    id: "demo-billing-profile",
    organizationId: "demo-org",
    billingName: "SkillHub Demo Org",
    billingEmail: "billing@example.com",
    taxId: null,
    country: "US",
    addressLine1: "Demo billing address",
    addressLine2: null,
    city: "San Francisco",
    region: "CA",
    postalCode: "94105",
    invoiceNotes: "Demo billing profile for local development.",
    createdAt: "demo",
    updatedAt: "demo"
  },
  paymentMethods: [
    {
      id: "demo-payment-method",
      organizationId: "demo-org",
      provider: "manual",
      providerCustomerId: null,
      providerPaymentMethodId: null,
      methodType: "invoice",
      brand: "manual",
      last4: null,
      expMonth: null,
      expYear: null,
      status: "ready",
      isDefault: true,
      createdAt: "demo",
      updatedAt: "demo"
    }
  ],
  summary: {
    defaultPaymentMethodStatus: "ready",
    invoiceReady: true,
    paymentMethodCount: 1,
    profileComplete: true
  }
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

const fallbackAbuseReports: AbuseReportRecord[] = [
  {
    id: "demo-abuse-security",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research-pro",
    skillName: "Browser Research Pro",
    skillVisibility: "public",
    skillVerificationStatus: "verified",
    category: "security",
    severity: "high",
    status: "open",
    title: "Unexpected outbound domain during runtime",
    description: "A project operator reported calls to an undeclared analytics endpoint during citation extraction.",
    evidenceUrl: "https://example.com/evidence/runtime-domain-log",
    reporterEmail: "security@example.com",
    reporterOrganizationName: "Research Agent",
    projectSlug: "research-agent",
    decisionReason: null,
    decidedAt: null,
    latestAction: null,
    latestActionAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-abuse-quality",
    skillId: "demo-skill-support-triage",
    skillSlug: "support-triage",
    skillName: "Support Triage",
    skillVisibility: "public",
    skillVerificationStatus: "verified",
    category: "quality",
    severity: "medium",
    status: "triaged",
    title: "Repeated low-confidence classifications",
    description: "Three projects reported misrouted tickets after the last model prompt update.",
    evidenceUrl: null,
    reporterEmail: "ops@example.com",
    reporterOrganizationName: "Support Agent",
    projectSlug: "support-agent",
    decisionReason: "Publisher asked to submit a runtime fix and examples.",
    decidedAt: "demo",
    latestAction: "triage",
    latestActionAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  }
];

const fallbackAdminIncidents: AdminIncidentRecord[] = [
  {
    id: "demo-incident-browser-runtime",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    skillVersionId: "demo-version-browser-research",
    status: "monitoring",
    severity: "high",
    title: "Citation runtime timeout spike",
    summary: "Runtime p95 latency crossed the project policy threshold after a source parsing change.",
    startedAt: "demo",
    resolvedAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-incident-dataset-schema",
    skillId: "demo-skill-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    skillName: "Dataset Summarizer",
    skillVersionId: "demo-version-dataset-summarizer",
    status: "open",
    severity: "medium",
    title: "Output schema mismatch for sparse rows",
    summary: "A developer project reported missing anomaly fields when input rows contain sparse numeric columns.",
    startedAt: "demo",
    resolvedAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  }
];

const fallbackSkillFeedback: SkillFeedbackRecord[] = [
  {
    id: "demo-feedback-pending",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: "ops@example.com",
    reviewerDisplayName: "Ops Reviewer",
    reviewerOrganizationName: "Research Agent",
    projectSlug: "research-agent",
    rating: 3,
    title: "Needs citation metadata before broader rollout",
    body: "The browser workflow is useful, but our compliance agent needs source timestamps and confidence fields before we can use it for regulated reports.",
    useCase: "Compliance-heavy research briefings",
    status: "pending",
    moderationReason: null,
    moderatedAt: null,
    publishedAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-feedback-published",
    skillId: "demo-skill-manifest-review",
    skillSlug: "manifest-review",
    skillName: "Manifest Review",
    reviewerEmail: null,
    reviewerDisplayName: "Platform Reviewer",
    reviewerOrganizationName: "SkillHub Demo Org",
    projectSlug: "publisher-workbench",
    rating: 5,
    title: "Good publisher preflight",
    body: "It catches missing examples and permission mismatches before a skill enters formal review.",
    useCase: "Publisher preflight checks",
    status: "published",
    moderationReason: "Approved as useful implementation feedback.",
    moderatedAt: "demo",
    publishedAt: "demo",
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
    feedback: {
      averageRating: 4.7,
      publishedCount: 18,
      pendingCount: 2
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
    feedback: {
      averageRating: 4.1,
      publishedCount: 5,
      pendingCount: 1
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
    ],
    invoices: [
      {
        id: `demo-invoice-${project.slug}-june`,
        projectSlug: project.slug,
        invoiceNumber: `SH-DEMO-${isResearch ? "RESEARCH" : "SUPPORT"}-202606`,
        status: "issued",
        currency: "usd",
        periodStart: "2026-06-01T00:00:00.000Z",
        periodEnd: "2026-07-01T00:00:00.000Z",
        subtotalCents: isResearch ? 248000 : 76000,
        taxCents: 0,
        totalCents: isResearch ? 248000 : 76000,
        issuedAt: "demo",
        dueAt: "demo",
        paidAt: null,
        createdAt: "demo",
        updatedAt: "demo",
        lineItemCount: isResearch ? 2 : 1
      }
    ],
    savedSkills: [
      {
        id: `demo-saved-${project.slug}-browser-research`,
        projectSlug: project.slug,
        skillSlug: "browser-research",
        displayName: "Browser Research",
        description: "Research a web topic and return concise findings with source URLs.",
        version: "0.1.0",
        verificationStatus: "verified",
        permissionLevel: "medium",
        collectionName: "default",
        installedStatus: "installed",
        pricing: {
          billingModel: "per_call",
          currency: "usd",
          status: "active",
          unitAmountCents: 2
        },
        savedAt: "demo"
      },
      {
        id: `demo-saved-${project.slug}-manifest-review`,
        projectSlug: project.slug,
        skillSlug: "manifest-review",
        displayName: "Manifest Review",
        description: "Review a skillhub.json manifest for completeness before submission.",
        version: "0.1.0",
        verificationStatus: "draft",
        permissionLevel: "low",
        collectionName: "review",
        installedStatus: null,
        pricing: {
          billingModel: "free",
          currency: "usd",
          status: "draft",
          unitAmountCents: 0
        },
        savedAt: "demo"
      }
    ]
  };
});

export async function getFinanceLedger(): Promise<FinanceLedger> {
  const token = await readAdminOperatorToken();

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
  const token = await readWorkspaceToken();

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
  const token = await readAdminOperatorToken();

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

export async function getOrganizationTeamMembers(): Promise<OrganizationTeamMember[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return fallbackOrganizationTeam;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/organization/team`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Organization team failed: ${response.status}`);
    }

    const payload = (await response.json()) as { members: OrganizationTeamMember[] };
    return payload.members;
  } catch {
    return fallbackOrganizationTeam;
  }
}

export async function getOrganizationWebhookEndpoints(): Promise<OrganizationWebhookEndpoint[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return fallbackOrganizationWebhookEndpoints;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/organization/webhooks`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Organization webhooks failed: ${response.status}`);
    }

    const payload = (await response.json()) as { endpoints: OrganizationWebhookEndpoint[] };
    return payload.endpoints;
  } catch {
    return fallbackOrganizationWebhookEndpoints;
  }
}

export async function getAdminReviews(): Promise<AdminReviewRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return fallbackAdminReviews;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/reviews`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin reviews failed: ${response.status}`);
    }

    const payload = (await response.json()) as { reviews: AdminReviewRecord[] };
    return payload.reviews;
  } catch {
    return fallbackAdminReviews;
  }
}

export async function getUserNotifications(): Promise<UserNotificationRecord[]> {
  return (await getUserNotificationInbox()).notifications;
}

export async function getUserNotificationInbox(): Promise<UserNotificationInbox> {
  const token = await readUserToken();

  if (!token) {
    return fallbackUserNotificationInbox;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/notifications?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`User notifications failed: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<UserNotificationInbox> & { notifications: UserNotificationRecord[] };
    const notifications = payload.notifications ?? [];

    return {
      notifications,
      summary: payload.summary ?? summarizeUserNotifications(notifications)
    };
  } catch {
    return fallbackUserNotificationInbox;
  }
}

function summarizeUserNotifications(notifications: UserNotificationRecord[]): UserNotificationSummary {
  const topicMap = new Map<string, { count: number; topic: string; unreadCount: number }>();
  const summary: UserNotificationSummary = {
    failed: 0,
    read: 0,
    skipped: 0,
    topics: [],
    total: notifications.length,
    unread: 0
  };

  for (const notification of notifications) {
    if (notification.status === "queued") {
      summary.unread += 1;
    } else if (notification.status === "sent") {
      summary.read += 1;
    } else if (notification.status === "failed") {
      summary.failed += 1;
    } else if (notification.status === "skipped") {
      summary.skipped += 1;
    }

    const topic = topicFromNotificationEvent(notification.eventType);
    const current = topicMap.get(topic) ?? {
      count: 0,
      topic,
      unreadCount: 0
    };
    current.count += 1;
    current.unreadCount += notification.status === "queued" ? 1 : 0;
    topicMap.set(topic, current);
  }

  summary.topics = Array.from(topicMap.values()).sort(
    (first, second) => second.unreadCount - first.unreadCount || second.count - first.count || first.topic.localeCompare(second.topic)
  );

  return summary;
}

function topicFromNotificationEvent(eventType: string) {
  if (eventType.includes("buyer_request") || eventType.includes("buyer.request")) {
    return "buyer";
  }

  if (eventType.includes("payout")) {
    return "payout";
  }

  if (eventType.includes("billing") || eventType.includes("invoice") || eventType.includes("refund") || eventType.includes("dispute")) {
    return "billing";
  }

  if (eventType.includes("review") || eventType.includes("feedback")) {
    return "review";
  }

  if (eventType.includes("runtime") || eventType.includes("incident")) {
    return "runtime";
  }

  if (eventType.includes("trust") || eventType.includes("abuse")) {
    return "trust";
  }

  if (eventType.includes("account") || eventType.includes("api_key")) {
    return "account";
  }

  return "skill";
}

export async function getNotificationPreferences(): Promise<NotificationPreferenceRecord[]> {
  const token = await readUserToken();

  if (!token) {
    return fallbackNotificationPreferences;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/notifications/preferences`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Notification preferences failed: ${response.status}`);
    }

    const payload = (await response.json()) as { preferences: NotificationPreferenceRecord[] };
    return payload.preferences;
  } catch {
    return fallbackNotificationPreferences;
  }
}

export async function getAdminPayouts(): Promise<PayoutRecord[]> {
  const token = await readAdminOperatorToken();

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
  const token = await readWorkspaceToken();

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
  const token = await readWorkspaceToken();

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

export async function getOrganizationBillingSummary(): Promise<OrganizationBillingSummary> {
  const token = await readWorkspaceToken();

  if (!token) {
    return fallbackOrganizationBillingSummary;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/organization/billing`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Organization billing failed: ${response.status}`);
    }

    const payload = (await response.json()) as { billing: OrganizationBillingSummary };
    return payload.billing;
  } catch {
    return fallbackOrganizationBillingSummary;
  }
}

export async function getPublisherSkills(): Promise<PublisherSkillRecord[]> {
  const token = await readWorkspaceToken();

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
  const token = await readWorkspaceToken();

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

export async function getDeveloperBuyerRequests(): Promise<BuyerRequestRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return fallbackBuyerRequests;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/developer/buyer-requests?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Developer buyer requests failed: ${response.status}`);
    }

    const payload = (await response.json()) as { requests: BuyerRequestRecord[] };
    return payload.requests;
  } catch {
    return fallbackBuyerRequests;
  }
}

export async function getDeveloperProjects(): Promise<DeveloperProjectRecord[]> {
  const token = await readWorkspaceToken();

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
  const token = await readWorkspaceToken();

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
  const token = await readWorkspaceToken();

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
  const token = await readWorkspaceToken();

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
  const token = await readAdminOperatorToken();

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
  const token = await readAdminOperatorToken();

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

export async function getAdminAbuseReports(): Promise<AbuseReportRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return fallbackAbuseReports;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/abuse-reports?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin abuse reports failed: ${response.status}`);
    }

    const payload = (await response.json()) as { reports: AbuseReportRecord[] };
    return payload.reports;
  } catch {
    return fallbackAbuseReports;
  }
}

export async function getAdminIncidents(): Promise<AdminIncidentRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return fallbackAdminIncidents;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/incidents?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin incidents failed: ${response.status}`);
    }

    const payload = (await response.json()) as { incidents: AdminIncidentRecord[] };
    return payload.incidents;
  } catch {
    return fallbackAdminIncidents;
  }
}

export async function getAdminSkillFeedback(): Promise<SkillFeedbackRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return fallbackSkillFeedback;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/skill-feedback?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin skill feedback failed: ${response.status}`);
    }

    const payload = (await response.json()) as { feedback: SkillFeedbackRecord[] };
    return payload.feedback;
  } catch {
    return fallbackSkillFeedback;
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

async function readWorkspaceToken() {
  const { getWorkspaceToken } = await import("@/lib/auth-session");
  return getWorkspaceToken();
}

async function readUserToken() {
  const { getUserToken } = await import("@/lib/auth-session");
  return getUserToken();
}

async function readAdminOperatorToken() {
  const { getAdminOperatorToken } = await import("@/lib/auth-session");
  return getAdminOperatorToken();
}
