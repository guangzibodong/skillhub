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
  const token = process.env.SKILLHUB_ADMIN_TOKEN;

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

export function formatMoney(cents: number | null | undefined, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format((cents ?? 0) / 100);
}
