import { getServerApiUrl } from "@/lib/api-url";
import type { SkillFeedbackRecord } from "@/lib/skill-feedback";

type FinanceLedgerSummary = {
  grossCents: number;
  platformFeeCents: number;
  publisherShareCents: number;
  usageGrossCents: number;
  usagePlatformFeeCents: number;
  usagePublisherShareCents: number;
  usageTransactionCount: number;
  subscriptionGrossCents: number;
  subscriptionPlatformFeeCents: number;
  subscriptionPublisherShareCents: number;
  subscriptionTransactionCount: number;
  pendingBalanceCents: number;
  availableBalanceCents: number;
  unprocessedUsageCount: number;
  unprocessedSubscriptionCount: number;
  renewableSubscriptionCount: number;
};

export type FinanceLedgerTransaction = {
  id: string;
  sourceType?: "usage" | "subscription" | "refund" | "adjustment";
  sourceReference?: string | null;
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

export type CommissionRuleRecord = {
  id: string;
  name: string;
  platformFeeBps: number;
  publisherShareBps: number;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  isActive: boolean;
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

export type AdminNotificationDelivery = {
  id: string;
  eventType: string;
  channel: "email" | "webhook";
  deliveryAttempts: number;
  deliveryProvider: string | null;
  deliveredAt: string | null;
  error: string | null;
  lastAttemptedAt: string | null;
  nextAttemptAt: string | null;
  payloadSummary: Record<string, unknown>;
  providerMessageId: string | null;
  status: "queued" | "sent" | "failed" | "skipped";
  subject: string | null;
  createdAt: string;
};

export type AdminNotificationDeliveryProcessItem = {
  id: string;
  channel: "email" | "webhook";
  eventType: string;
  provider: string;
  status: "delivered" | "failed" | "pending" | "skipped" | "would_deliver" | "would_fail" | "would_skip";
  message: string;
  providerMessageId: string | null;
};

export type AdminNotificationDeliveryProcessResult = {
  deliveredCount: number;
  failedCount: number;
  fanoutCount: number;
  fanoutEmailCount: number;
  fanoutMode?: "created" | "preview";
  fanoutSourceCount: number;
  fanoutWebhookCount: number;
  mode: "deliver" | "dry_run";
  pendingCount: number;
  processed: AdminNotificationDeliveryProcessItem[];
  processedCount: number;
  skippedCount: number;
};

export type AdminWebhookDelivery = {
  id: string;
  organizationId: string;
  organizationName: string | null;
  endpointId: string | null;
  endpointUrl: string | null;
  endpointStatus: "active" | "disabled" | "paused" | null;
  eventType: string;
  payloadSummary: Record<string, unknown>;
  status: "delivered" | "failed" | "pending" | "processing" | "skipped";
  attemptCount: number;
  nextAttemptAt: string | null;
  lastAttemptedAt: string | null;
  deliveredAt: string | null;
  responseStatus: number | null;
  responseBody: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminWebhookDeliveryProcessItem = {
  id: string;
  endpointUrl: string | null;
  eventType: string;
  message: string;
  responseStatus: number | null;
  status: "delivered" | "failed" | "skipped" | "would_deliver" | "would_fail" | "would_skip";
};

export type AdminWebhookDeliveryProcessResult = {
  deliveredCount: number;
  failedCount: number;
  mode: "deliver" | "dry_run";
  processed: AdminWebhookDeliveryProcessItem[];
  processedCount: number;
  skippedCount: number;
};

export type LaunchReadinessStatus = "blocker" | "deferred" | "ready" | "warning";

export type LaunchReadinessItem = {
  action: string;
  description: string;
  detail: string;
  key: string;
  label: string;
  status: LaunchReadinessStatus;
};

export type LaunchReadinessSection = {
  items: LaunchReadinessItem[];
  key: string;
  status: LaunchReadinessStatus;
  title: string;
};

export type LaunchReadinessReport = {
  checkedAt: string;
  environment: {
    appUrl: string | null;
    callbackBaseUrl: string | null;
    isProductionLike: boolean;
    runtime: string;
  };
  sections: LaunchReadinessSection[];
  summary: {
    blocker: number;
    deferred: number;
    ready: number;
    status: LaunchReadinessStatus;
    warning: number;
  };
};

export type AdminOAuthProviderConfig = {
  callbackBaseUrl: string | null;
  clientId: string | null;
  clientSecretConfigured: boolean;
  clientSecretLast4: string | null;
  provider: "github" | "google";
  source: ConfigSource;
  status: "active" | "disabled";
  updatedAt: string | null;
};

export type AdminEmailProviderConfig = {
  from: string | null;
  provider: "resend" | "smtp" | "unconfigured";
  resendApiKeyConfigured: boolean;
  resendApiKeyLast4: string | null;
  smtpHost: string | null;
  smtpPasswordConfigured: boolean;
  smtpPasswordLast4: string | null;
  smtpPort: string | null;
  smtpSecure: string | null;
  smtpUser: string | null;
  source: ConfigSource;
  status: "active" | "disabled";
  updatedAt: string | null;
};

export type AdminPlatformProviderConfig = {
  email: AdminEmailProviderConfig;
  oauth: AdminOAuthProviderConfig[];
};

type ConfigSource = "database" | "default" | "environment" | "none";

export type AdminStripeConfig = {
  cancelUrl: string | null;
  connectClientIdConfigured: boolean;
  connectClientIdLast4: string | null;
  refreshUrl: string | null;
  returnUrl: string | null;
  secretKeyConfigured: boolean;
  secretKeyLast4: string | null;
  source: ConfigSource;
  status: "active" | "disabled";
  successUrl: string | null;
  updatedAt: string | null;
  webhookSecretConfigured: boolean;
  webhookSecretLast4: string | null;
};

export type AdminPayPalConfig = {
  cancelUrl: string | null;
  clientIdConfigured: boolean;
  clientIdLast4: string | null;
  clientSecretConfigured: boolean;
  clientSecretLast4: string | null;
  environment: "live" | "sandbox";
  returnUrl: string | null;
  source: ConfigSource;
  status: "active" | "disabled";
  updatedAt: string | null;
  webhookIdConfigured: boolean;
  webhookIdLast4: string | null;
};

export type AdminWebhookSettings = {
  maxAttempts: number;
  source: ConfigSource;
  timeoutMs: number;
  updatedAt: string | null;
};

export type AdminPayoutSettings = {
  minPayoutCents: number;
  payoutReviewThresholdCents: number;
  source: ConfigSource;
  updatedAt: string | null;
};

export type AdminLaunchSettings = {
  activeProjects: number;
  activePublishers: number;
  publishedFeedback: number;
  source: ConfigSource;
  successfulInvocations: number;
  updatedAt: string | null;
  verifiedSkills: number;
};

export type AdminRuntimeSettings = {
  disablePublicSignup: boolean;
  source: ConfigSource;
  updatedAt: string | null;
};

export type AdminPlatformConfig = AdminPlatformProviderConfig & {
  bootstrap: {
    appUrlConfigured: boolean;
    apiUrlConfigured: boolean;
    databaseConfigured: boolean;
    encryptionSecretConfigured: boolean;
    encryptionSecretSource: "agent_legacy" | "config" | "session_fallback" | "none";
    encryptionSecretValid: boolean;
    r2Configured: boolean;
    serverApiUrlConfigured: boolean;
    sessionSecretConfigured: boolean;
    stripeLiveModeHint: "live" | "test" | "unknown";
    supabaseConfigured: boolean;
  };
  launch: AdminLaunchSettings;
  paypal: AdminPayPalConfig;
  payouts: AdminPayoutSettings;
  runtime: AdminRuntimeSettings;
  stripe: AdminStripeConfig;
  webhooks: AdminWebhookSettings;
};

export type PublicPaymentProviderStatus = {
  configured: boolean;
  environment: "live" | "sandbox" | "test" | "unknown";
  label: string;
  provider: "paypal" | "stripe";
  source: ConfigSource;
  status: "active" | "disabled";
};

export type AdminAuditLogRecord = {
  id: string;
  action: string;
  actorDisplayName: string | null;
  actorEmail: string | null;
  actorUserId: string | null;
  createdAt: string;
  entityId: string | null;
  entityType: string;
  metadata: Record<string, unknown>;
  reason: string | null;
};

export type AdminMarketplaceCurationRecord = {
  id: string | null;
  averageRating: number | null;
  boost: number;
  displayName: string;
  endsAt: string | null;
  feedbackCount: number;
  incidentCount: number;
  installCount: number;
  invocationCount: number;
  pendingFeedbackCount: number;
  placement: "featured" | "standard" | "suppressed";
  reason: string | null;
  skillId: string;
  skillSlug: string;
  successRate: number | null;
  updatedAt: string | null;
  verificationStatus: string;
  visibility: string;
};

export type AdminMarketplaceCurationAppealRecord = {
  id: string;
  appealReason: string;
  callCount: number;
  createdAt: string;
  createdByDisplayName: string | null;
  createdByEmail: string | null;
  currentCurationReason: string | null;
  currentPlacement: "featured" | "standard" | "suppressed";
  decidedAt: string | null;
  decidedByDisplayName: string | null;
  decidedByEmail: string | null;
  evidenceUrl: string | null;
  feedbackCount: number;
  incidentCount: number;
  installCount: number;
  operatorReason: string | null;
  publisherOrganizationId: string;
  publisherOrganizationName: string;
  requestType: "featured_request" | "placement_review" | "suppression_appeal";
  requestedPlacement: "featured" | "standard";
  skillId: string;
  skillName: string;
  skillSlug: string;
  slaDueAt: string;
  status: "approved" | "closed" | "open" | "rejected" | "under_review";
  successRate: number | null;
  updatedAt: string;
  verificationStatus: string;
  visibility: string;
};

export type AdminMarketplaceCurationData = {
  appeals: AdminMarketplaceCurationAppealRecord[];
  curation: AdminMarketplaceCurationRecord[];
  message?: string;
  mode: "live" | "missing_token" | "unavailable";
};

export type NotificationTemplateRecord = {
  id: string;
  templateKey: string;
  channel: "email" | "in_app" | "webhook";
  locale: string;
  subject: string;
  body: string;
  status: "active" | "archived" | "draft";
  updatedAt: string;
};

export type PublicAgentModelRecord = {
  id: string;
  displayName: string;
  provider: "anthropic" | "custom" | "deepseek" | "google" | "openai" | "openrouter";
  model: string;
  isDefault: boolean;
};

export type AdminAgentModelRecord = PublicAgentModelRecord & {
  apiKeyLast4: string;
  baseUrl: string | null;
  createdAt: string;
  maxOutputTokens: number;
  status: "active" | "disabled" | "draft";
  systemPrompt: string;
  temperature: number;
  updatedAt: string;
};

export type AdminIdentityDirectory = {
  organizations: AdminIdentityOrganization[];
  summary: {
    activeTokenCount: number;
    adminUserCount: number;
    organizationCount: number;
    userCount: number;
  };
  users: AdminIdentityUser[];
};

export type AdminIdentityOrganization = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  projectCount: number;
  skillCount: number;
  publisherProfileCount: number;
  activeTokenCount: number;
  invocationCount: number;
  ledgerCents: number;
  lastTokenUsedAt: string | null;
  createdAt: string;
};

export type AdminIdentityUser = {
  id: string;
  email: string;
  displayName: string | null;
  platformRole: string;
  organizationCount: number;
  memberships: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
  }>;
  tokenCount: number;
  activeTokenCount: number;
  lastTokenUsedAt: string | null;
  createdAt: string;
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

export type ReviewSlaStatus = "decided" | "due_soon" | "not_submitted" | "on_track" | "overdue";

export type AdminReviewRecord = {
  id: string;
  skillSlug: string;
  displayName: string;
  version: string | null;
  status: "approved" | "blocked" | "in_review" | "queued" | "rejected" | string;
  riskLevel: "low" | "medium" | "high" | string | null;
  notes: string | null;
  reviewQueueAgeHours?: number | null;
  reviewSlaBusinessDays?: number | null;
  reviewSlaDueAt?: string | null;
  reviewSlaHoursRemaining?: number | null;
  reviewSlaStatus?: ReviewSlaStatus | string | null;
  reviewSubmittedAt?: string | null;
  reviewEvidence?: {
    manifestSummary: {
      authorName: string | null;
      authorUrl: string | null;
      description: string | null;
      displayName: string | null;
      inputPropertyCount: number;
      inputRequiredCount: number;
      inputType: string | null;
      name: string | null;
      outputPropertyCount: number;
      outputRequiredCount: number;
      outputType: string | null;
      permissionLevel: "high" | "low" | "medium" | string;
      permissions: {
        browser: boolean;
        filesystem: "none" | "read" | "write" | string;
        network: boolean;
        secretCount: number;
      };
      runtimeTarget: string | null;
      runtimeType: "http" | "local" | "mcp" | string | null;
      schemaVersion: string | null;
      tags: string[];
      tagsCount: number;
      version: string | null;
    } | null;
    publisher: {
      displayName: string | null;
      organizationName: string | null;
      organizationSlug: string | null;
      payoutStatus: string | null;
      status: string | null;
    };
  } | null;
  runtimeChecks?: Array<{
    checkType: "example" | "manifest" | "runtime" | "security" | string;
    status: "failed" | "passed" | "queued" | "running" | "warning" | string;
    message: string | null;
    isBlocking?: boolean | null;
    fixCategory?: string | null;
    targetField?: string | null;
    nextAction?: string | null;
    latencyMs?: number | null;
    checkedAt?: string | null;
    createdAt?: string | null;
  }>;
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
  manualAccount: string | null;
  manualAccountHolder: string | null;
  manualMethod: "paypal" | "alipay" | string | null;
  manualNotes: string | null;
  provider: string | null;
  providerAccountId?: string | null;
  accountStatus: string | null;
  stripeAccountId?: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  paidAt: string | null;
  reviewReason: string | null;
  failureReason: string | null;
  providerReference: string | null;
  retryCondition: string | null;
  nextAction:
    | "await_finance_review"
    | "await_provider_processing"
    | "complete"
    | "request_again_after_failure"
    | "resolve_blocker_before_retry"
    | string
    | null;
};

export type PublisherPayoutReadinessBlocker =
  | "amount_below_minimum"
  | "no_available_balance"
  | "payout_account_missing"
  | "payout_account_not_verified"
  | "publisher_not_active"
  | "publisher_payout_not_verified"
  | "publisher_profile_missing";

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
  readiness?: {
    blockers: PublisherPayoutReadinessBlocker[];
    canRequest: boolean;
    expectedStatus: "requested" | "review" | "processing" | "paid" | "failed" | "blocked" | null;
    nextAction:
      | "activate_publisher_profile"
      | "complete_payout_verification"
      | "connect_verified_payout_account"
      | "create_publisher_profile"
      | "earn_or_wait_minimum"
      | "request_payout"
      | "wait_for_balance_maturity"
      | string;
  };
  payoutAccounts: Array<{
    id: string;
    manualAccount: string | null;
    manualAccountHolder: string | null;
    manualMethod: "paypal" | "alipay" | string | null;
    manualNotes: string | null;
    provider: string;
    providerAccountId: string;
    stripeAccountId?: string | null;
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
    termsAcceptedAt: string | null;
    termsAcceptedByUserId: string | null;
    termsVersion: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  payoutAccounts: Array<{
    id: string;
    manualAccount: string | null;
    manualAccountHolder: string | null;
    manualMethod: "paypal" | "alipay" | string | null;
    manualNotes: string | null;
    provider: string;
    providerAccountId: string;
    stripeAccountId?: string | null;
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

export type PublisherSkillVersionRecord = {
  callCount: number;
  createdAt: string;
  id: string;
  installCount: number;
  manifest: Record<string, unknown>;
  reviewDecidedAt: string | null;
  reviewNotes: string | null;
  reviewRiskLevel: "low" | "medium" | "high" | null;
  reviewQueueAgeHours?: number | null;
  reviewSlaBusinessDays?: number | null;
  reviewSlaDueAt?: string | null;
  reviewSlaHoursRemaining?: number | null;
  reviewSlaStatus?: ReviewSlaStatus | string | null;
  reviewStatus: string | null;
  reviewSubmittedAt?: string | null;
  runtimeCheckCount: number;
  runtimeChecks: Array<{
    checkType: "example" | "manifest" | "runtime" | "security" | string;
    status: "failed" | "passed" | "queued" | "running" | "warning" | string;
    message: string | null;
    isBlocking?: boolean | null;
    fixCategory?: string | null;
    targetField?: string | null;
    nextAction?: string | null;
    latencyMs?: number | null;
    checkedAt?: string | null;
    createdAt?: string | null;
  }>;
  runtimeFailedCount: number;
  runtimePassedCount: number;
  runtimeWarningCount: number;
  status: "draft" | "submitted" | "verified" | "rejected" | "suspended";
  version: string;
};

export type PublisherCommercialBlocker =
  | "current_terms"
  | "payout"
  | "publisher_profile"
  | "publisher_status"
  | "review"
  | "terms";

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
    reviewQueueAgeHours?: number | null;
    reviewSlaBusinessDays?: number | null;
    reviewSlaDueAt?: string | null;
    reviewSlaHoursRemaining?: number | null;
    reviewSlaStatus?: ReviewSlaStatus | string | null;
    reviewSubmittedAt?: string | null;
  };
  runtime: {
    checkCount: number;
    passedCount: number;
    failedCount: number;
    warningCount: number;
    health: "healthy" | "warning" | "needs_attention" | "not_checked";
    checks?: Array<{
      checkType: "example" | "manifest" | "runtime" | "security" | string;
      status: "failed" | "passed" | "queued" | "running" | "warning" | string;
      message: string | null;
      isBlocking?: boolean | null;
      fixCategory?: string | null;
      targetField?: string | null;
      nextAction?: string | null;
      latencyMs?: number | null;
      checkedAt?: string | null;
      createdAt?: string | null;
    }>;
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
  commercial?: {
    blockers: PublisherCommercialBlocker[];
    paidActivationReady: boolean;
    payoutStatus: "not_configured" | "verification_required" | "verified" | "blocked" | null;
    publisherStatus: "pending" | "active" | "restricted" | "suspended" | null;
    requiresTermsVersion: string;
    termsAcceptedAt: string | null;
    termsVersion: string | null;
  };
  feedback?: {
    averageRating: number | null;
    publishedCount: number;
    pendingCount: number;
  };
  recentFeedback?: SkillFeedbackRecord[];
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
  marketplace?: {
    placement: "featured" | "standard" | "suppressed";
    reason: string | null;
    endsAt: string | null;
    updatedAt: string | null;
    appeal?: {
      id: string;
      appealReason: string;
      createdAt: string;
      currentPlacement: "featured" | "standard" | "suppressed";
      decidedAt: string | null;
      operatorReason: string | null;
      requestType: "featured_request" | "placement_review" | "suppression_appeal";
      requestedPlacement: "featured" | "standard";
      skillId: string;
      slaDueAt: string;
      status: "approved" | "closed" | "open" | "rejected" | "under_review";
    } | null;
    improvementHints: Array<{
      key: string;
      severity: "critical" | "positive" | "warning";
    }>;
  };
  versions?: PublisherSkillVersionRecord[];
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
  submittedSkillId: string | null;
  submittedSkillSlug: string | null;
  submittedSkillName: string | null;
  submittedSkillVerificationStatus: string | null;
  submittedSkillVersionId: string | null;
  submittedSkillVersion: string | null;
  submittedSkillReviewStatus: string | null;
  deliveryNote: string | null;
  evidenceUrl: string | null;
  submittedAt: string | null;
  decisionNote: string | null;
  decidedAt: string | null;
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
  currentVersion: string | null;
  targetVersion: string | null;
  targetReviewStatus: string | null;
  adoptionState: "awaiting_review" | "missing_version" | "not_version_update" | "ready" | "removed_install" | string;
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
  ledgerState: "awaiting_post" | "not_billable" | "not_postable" | "posted" | "renewal_due" | "trial_access";
  ledgerTransactionId: string | null;
  ledgerSourceReference: string | null;
  ledgerGrossCents: number | null;
  ledgerCurrency: string | null;
  ledgerStatus: string | null;
  ledgerPostedAt: string | null;
  ledgerInvoiceCount: number;
  renewalReady: boolean;
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

const apiUrl = getServerApiUrl();

function safeOperationValue<T>(value: T, _emptyValue: T): T {
  return value;
}

function emptyOnOperationError<T>(_error: unknown, emptyValue: T): T {
  return emptyValue;
}
const emptyLedger: FinanceLedger = {
  summary: {
    grossCents: 0,
    platformFeeCents: 0,
    publisherShareCents: 0,
    usageGrossCents: 0,
    usagePlatformFeeCents: 0,
    usagePublisherShareCents: 0,
    usageTransactionCount: 0,
    subscriptionGrossCents: 0,
    subscriptionPlatformFeeCents: 0,
    subscriptionPublisherShareCents: 0,
    subscriptionTransactionCount: 0,
    pendingBalanceCents: 0,
    availableBalanceCents: 0,
    unprocessedUsageCount: 0,
    unprocessedSubscriptionCount: 0,
    renewableSubscriptionCount: 0
  },
  recentTransactions: []
};

const emptyAdminIdentityDirectory: AdminIdentityDirectory = {
  organizations: [],
  summary: {
    activeTokenCount: 0,
    adminUserCount: 0,
    organizationCount: 0,
    userCount: 0
  },
  users: []
};

const emptyUserNotificationSummary: UserNotificationSummary = {
  failed: 0,
  read: 0,
  skipped: 0,
  topics: [],
  total: 0,
  unread: 0
};

const emptyUserNotificationInbox: UserNotificationInbox = {
  notifications: [],
  summary: emptyUserNotificationSummary
};

const emptyLaunchReadiness: LaunchReadinessReport = {
  checkedAt: "",
  environment: {
    appUrl: null,
    callbackBaseUrl: null,
    isProductionLike: process.env.SKILLHUB_ENV === "production" || process.env.NODE_ENV === "production",
    runtime: process.env.SKILLHUB_ENV ?? process.env.NODE_ENV ?? "development"
  },
  sections: [],
  summary: {
    blocker: 0,
    deferred: 0,
    ready: 0,
    status: "warning",
    warning: 0
  }
};

const emptyPlatformProviders: AdminPlatformProviderConfig = {
  email: {
    from: null,
    provider: "unconfigured",
    resendApiKeyConfigured: false,
    resendApiKeyLast4: null,
    smtpHost: null,
    smtpPasswordConfigured: false,
    smtpPasswordLast4: null,
    smtpPort: "465",
    smtpSecure: "true",
    smtpUser: null,
    source: "none",
    status: "disabled",
    updatedAt: null
  },
  oauth: [
    {
      callbackBaseUrl: null,
      clientId: null,
      clientSecretConfigured: false,
      clientSecretLast4: null,
      provider: "google",
      source: "none",
      status: "disabled",
      updatedAt: null
    },
    {
      callbackBaseUrl: null,
      clientId: null,
      clientSecretConfigured: false,
      clientSecretLast4: null,
      provider: "github",
      source: "none",
      status: "disabled",
      updatedAt: null
    }
  ]
};

const emptyPlatformConfig: AdminPlatformConfig = {
  ...emptyPlatformProviders,
  bootstrap: {
    appUrlConfigured: false,
    apiUrlConfigured: false,
    databaseConfigured: false,
    encryptionSecretConfigured: false,
    encryptionSecretSource: "none",
    encryptionSecretValid: false,
    r2Configured: false,
    serverApiUrlConfigured: false,
    sessionSecretConfigured: false,
    stripeLiveModeHint: "unknown",
    supabaseConfigured: false
  },
  launch: {
    activeProjects: 3,
    activePublishers: 2,
    publishedFeedback: 5,
    source: "default",
    successfulInvocations: 20,
    updatedAt: null,
    verifiedSkills: 5
  },
  payouts: {
    minPayoutCents: 5000,
    payoutReviewThresholdCents: 100000,
    source: "default",
    updatedAt: null
  },
  runtime: {
    disablePublicSignup: false,
    source: "default",
    updatedAt: null
  },
  paypal: {
    cancelUrl: null,
    clientIdConfigured: false,
    clientIdLast4: null,
    clientSecretConfigured: false,
    clientSecretLast4: null,
    environment: "sandbox",
    returnUrl: null,
    source: "none",
    status: "disabled",
    updatedAt: null,
    webhookIdConfigured: false,
    webhookIdLast4: null
  },
  stripe: {
    cancelUrl: null,
    connectClientIdConfigured: false,
    connectClientIdLast4: null,
    refreshUrl: null,
    returnUrl: null,
    secretKeyConfigured: false,
    secretKeyLast4: null,
    source: "none",
    status: "disabled",
    successUrl: null,
    updatedAt: null,
    webhookSecretConfigured: false,
    webhookSecretLast4: null
  },
  webhooks: {
    maxAttempts: 8,
    source: "default",
    timeoutMs: 8000,
    updatedAt: null
  }
};

const emptyPublisherPayoutSummary: PublisherPayoutSummary = {
  publisherProfile: null,
  balances: {
    pendingCents: 0,
    availableCents: 0,
    blockedCents: 0,
    paidCents: 0,
    currency: "usd",
    minPayoutCents: 5000,
    reviewThresholdCents: 100000
  },
  readiness: {
    blockers: ["publisher_profile_missing", "payout_account_missing", "no_available_balance"],
    canRequest: false,
    expectedStatus: null,
    nextAction: "create_publisher_profile"
  },
  payoutAccounts: [],
  payouts: []
};

const emptyPublisherAccountSummary: PublisherAccountSummary = {
  publisherProfile: null,
  payoutAccounts: [],
  onboardingSessions: []
};

const emptyOrganizationBillingSummary: OrganizationBillingSummary = {
  billingProfile: null,
  paymentMethods: [],
  summary: {
    defaultPaymentMethodStatus: "not_configured",
    invoiceReady: false,
    paymentMethodCount: 0,
    profileComplete: false
  }
};

export async function getFinanceLedger(): Promise<FinanceLedger> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return emptyLedger;
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

    return safeOperationValue((await response.json()) as FinanceLedger, emptyLedger);
  } catch (error) {
    return emptyOnOperationError(error, emptyLedger);
  }
}

export async function getAdminCommissionRules(): Promise<CommissionRuleRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/finance/commission-rules?limit=20`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Commission rules failed: ${response.status}`);
    }

    const payload = (await response.json()) as { rules: CommissionRuleRecord[] };
    return safeOperationValue(payload.rules, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getPublisherFinanceLedger(): Promise<FinanceLedger> {
  const token = await readWorkspaceToken();

  if (!token) {
    return emptyLedger;
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

    return safeOperationValue((await response.json()) as FinanceLedger, emptyLedger);
  } catch (error) {
    return emptyOnOperationError(error, emptyLedger);
  }
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.notifications, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminNotificationDeliveries(): Promise<AdminNotificationDelivery[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/notification-deliveries?limit=16`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin notification deliveries failed: ${response.status}`);
    }

    const payload = (await response.json()) as { deliveries: AdminNotificationDelivery[] };
    return safeOperationValue(payload.deliveries, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminWebhookDeliveries(): Promise<AdminWebhookDelivery[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/webhook-deliveries?limit=16`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin webhook deliveries failed: ${response.status}`);
    }

    const payload = (await response.json()) as { deliveries: AdminWebhookDelivery[] };
    return safeOperationValue(payload.deliveries, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminLaunchReadiness(): Promise<LaunchReadinessReport> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return emptyLaunchReadiness;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/launch-readiness`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin launch readiness failed: ${response.status}`);
    }

    const payload = (await response.json()) as { readiness: LaunchReadinessReport };
    return safeOperationValue(payload.readiness, emptyLaunchReadiness);
  } catch (error) {
    return emptyOnOperationError(error, emptyLaunchReadiness);
  }
}

export async function getAdminPlatformProviders(): Promise<AdminPlatformProviderConfig> {
  const config = await getAdminPlatformConfig();
  return {
    email: config.email,
    oauth: config.oauth
  };
}

export async function getAdminPlatformConfig(): Promise<AdminPlatformConfig> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return emptyPlatformConfig;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/platform-config`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Platform configuration failed: ${response.status}`);
    }

    const payload = (await response.json()) as { config: AdminPlatformConfig };
    return safeOperationValue(payload.config, emptyPlatformConfig);
  } catch (error) {
    return emptyOnOperationError(error, emptyPlatformConfig);
  }
}

export async function getAdminAuditLogs(): Promise<AdminAuditLogRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/audit-logs?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin audit logs failed: ${response.status}`);
    }

    const payload = (await response.json()) as { auditLogs: AdminAuditLogRecord[] };
    return safeOperationValue(payload.auditLogs, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminMarketplaceCuration(): Promise<AdminMarketplaceCurationData> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return {
      appeals: [],
      curation: [],
      message: "Sign in with an admin or support account to inspect marketplace ranking controls.",
      mode: "missing_token"
    };
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/marketplace-curation?limit=24`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Marketplace curation failed: ${response.status}`);
    }

    const payload = (await response.json()) as { curation: AdminMarketplaceCurationRecord[] };
    const appeals = await getAdminMarketplaceCurationAppeals(token);

    return {
      appeals,
      curation: payload.curation,
      mode: "live"
    };
  } catch (error) {
    return {
      appeals: [],
      curation: [],
      message: error instanceof Error ? error.message : "Marketplace curation is unavailable.",
      mode: "unavailable"
    };
  }
}

async function getAdminMarketplaceCurationAppeals(token: string): Promise<AdminMarketplaceCurationAppealRecord[]> {
  try {
    const response = await fetch(`${apiUrl}/v1/admin/marketplace-curation/appeals?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { appeals: AdminMarketplaceCurationAppealRecord[] };
    return payload.appeals;
  } catch {
    return [];
  }
}

export async function getAdminNotificationTemplates(): Promise<NotificationTemplateRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/notification-templates?limit=24`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Notification templates failed: ${response.status}`);
    }

    const payload = (await response.json()) as { templates: NotificationTemplateRecord[] };
    return safeOperationValue(payload.templates, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getPublicAgentModels(): Promise<PublicAgentModelRecord[]> {
  try {
    let response = await fetch(`${apiUrl}/v1/prompts/models`, {
      cache: "no-store"
    });

    if (response.status === 404) {
      response = await fetch(`${apiUrl}/v1/agents/models`, {
        cache: "no-store"
      });
    }

    if (!response.ok) {
      throw new Error(`Prompt models failed: ${response.status}`);
    }

    const payload = (await response.json()) as { models: PublicAgentModelRecord[] };
    return safeOperationValue(payload.models, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminAgentModels(): Promise<AdminAgentModelRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    let response = await fetch(`${apiUrl}/v1/admin/prompt-models?limit=24`, {
      cache: "no-store",
      headers
    });

    if (response.status === 404) {
      response = await fetch(`${apiUrl}/v1/admin/agent-models?limit=24`, {
        cache: "no-store",
        headers
      });
    }

    if (!response.ok) {
      throw new Error(`Admin prompt models failed: ${response.status}`);
    }

    const payload = (await response.json()) as { models: AdminAgentModelRecord[] };
    return safeOperationValue(payload.models, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminIdentityDirectory(): Promise<AdminIdentityDirectory> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return emptyAdminIdentityDirectory;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/admin/identity-directory?limit=12`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin identity directory failed: ${response.status}`);
    }

    const payload = (await response.json()) as { identity: AdminIdentityDirectory };
    return safeOperationValue(payload.identity, emptyAdminIdentityDirectory);
  } catch (error) {
    return emptyOnOperationError(error, emptyAdminIdentityDirectory);
  }
}

export async function getOrganizationTeamMembers(): Promise<OrganizationTeamMember[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.members, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getOrganizationWebhookEndpoints(): Promise<OrganizationWebhookEndpoint[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.endpoints, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminReviews(): Promise<AdminReviewRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.reviews, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getUserNotifications(): Promise<UserNotificationRecord[]> {
  return (await getUserNotificationInbox()).notifications;
}

export async function getUserNotificationInbox(): Promise<UserNotificationInbox> {
  const token = await readUserToken();

  if (!token) {
    return emptyUserNotificationInbox;
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

    return safeOperationValue({
      notifications,
      summary: payload.summary ?? summarizeUserNotifications(notifications)
    }, emptyUserNotificationInbox);
  } catch (error) {
    return emptyOnOperationError(error, emptyUserNotificationInbox);
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
    return [];
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
    return safeOperationValue(payload.preferences, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminPayouts(): Promise<PayoutRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.payouts, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getPublisherPayoutSummary(): Promise<PublisherPayoutSummary> {
  const token = await readWorkspaceToken();

  if (!token) {
    return emptyPublisherPayoutSummary;
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

    return safeOperationValue((await response.json()) as PublisherPayoutSummary, emptyPublisherPayoutSummary);
  } catch (error) {
    return emptyOnOperationError(error, emptyPublisherPayoutSummary);
  }
}

export async function getPublisherAccountSummary(): Promise<PublisherAccountSummary> {
  const token = await readWorkspaceToken();

  if (!token) {
    return emptyPublisherAccountSummary;
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

    return safeOperationValue((await response.json()) as PublisherAccountSummary, emptyPublisherAccountSummary);
  } catch (error) {
    return emptyOnOperationError(error, emptyPublisherAccountSummary);
  }
}

export async function getOrganizationBillingSummary(): Promise<OrganizationBillingSummary> {
  const token = await readWorkspaceToken();

  if (!token) {
    return emptyOrganizationBillingSummary;
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
    return safeOperationValue(payload.billing, emptyOrganizationBillingSummary);
  } catch (error) {
    return emptyOnOperationError(error, emptyOrganizationBillingSummary);
  }
}

export async function getPublisherSkills(): Promise<PublisherSkillRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.skills, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getPublisherBuyerRequests(): Promise<BuyerRequestRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.requests, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getDeveloperBuyerRequests(): Promise<BuyerRequestRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.requests, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getDeveloperProjects(): Promise<DeveloperProjectRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.projects, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getDeveloperProjectDetail(projectSlug: string): Promise<DeveloperProjectDetail | null> {
  const token = await readWorkspaceToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/developer/projects/${encodeURIComponent(projectSlug)}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Developer project detail failed: ${response.status}`);
    }

    const payload = (await response.json()) as { project: DeveloperProjectDetail };
    return safeOperationValue(payload.project, null);
  } catch {
    return null;
  }
}

export async function getProjectRefunds(projectSlug: string): Promise<RefundRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/projects/${encodeURIComponent(projectSlug)}/refunds?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Project refunds failed: ${response.status}`);
    }

    const payload = (await response.json()) as { refunds: RefundRecord[] };
    return safeOperationValue(payload.refunds, []);
  } catch {
    return [];
  }
}

export async function getProjectDisputes(projectSlug: string): Promise<DisputeRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/projects/${encodeURIComponent(projectSlug)}/disputes?limit=8`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Project disputes failed: ${response.status}`);
    }

    const payload = (await response.json()) as { disputes: DisputeRecord[] };
    return safeOperationValue(payload.disputes, []);
  } catch {
    return [];
  }
}

export async function getPublisherRefunds(): Promise<RefundRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.refunds, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getPublisherDisputes(): Promise<DisputeRecord[]> {
  const token = await readWorkspaceToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.disputes, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminRefunds(): Promise<RefundRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.refunds, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminDisputes(): Promise<DisputeRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.disputes, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminAbuseReports(): Promise<AbuseReportRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.reports, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminIncidents(): Promise<AdminIncidentRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.incidents, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
  }
}

export async function getAdminSkillFeedback(): Promise<SkillFeedbackRecord[]> {
  const token = await readAdminOperatorToken();

  if (!token) {
    return [];
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
    return safeOperationValue(payload.feedback, []);
  } catch (error) {
    return emptyOnOperationError(error, []);
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

