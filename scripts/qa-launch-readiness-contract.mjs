const VALID_READINESS_STATUSES = new Set([
  "blocker",
  "deferred",
  "ready",
  "warning",
]);

const REQUIRED_READINESS_CONTRACT = new Map([
  [
    "identity",
    [
      "oauth_callback_base_url",
      "oauth_state_secret",
      "google_oauth",
      "github_oauth",
      "session_cookie_domain",
    ],
  ],
  [
    "email",
    [
      "email_auth_secret",
      "email_challenge_storage",
      "email_provider",
      "email_debug_codes",
    ],
  ],
  [
    "webhook",
    ["webhook_worker_schema", "webhook_timeout", "webhook_retry_cap"],
  ],
  [
    "marketplace_operations",
    [
      "database_connection",
      "schema_migrations",
      "operations_tables",
      "runtime_check_remediation",
      "buyer_request_delivery_package",
      "publisher_feedback_responses",
      "notification_delivery_schema",
      "notification_templates",
      "api_key_salt",
    ],
  ],
  [
    "launch_credibility",
    [
      "verified_skills_threshold",
      "active_publishers_threshold",
      "active_projects_threshold",
      "successful_invocations_threshold",
      "published_feedback_threshold",
    ],
  ],
  [
    "commercial",
    [
      "commission_rules",
      "payout_state",
      "manual_payout_accounts",
      "payout_explainability",
      "publisher_terms_acceptance",
      "payment_provider",
    ],
  ],
  [
    "guardrails",
    [
      "app_url",
      "demo_fallback",
      "legacy_signup",
      "service_token",
      "public_signup_policy",
      "auth_identity_storage",
    ],
  ],
]);

export function validateLaunchReadinessContract(readiness) {
  const errors = [];
  const summary = readiness?.summary;
  const hasSummary =
    isFiniteNumber(summary?.blocker) &&
    isFiniteNumber(summary?.warning) &&
    isFiniteNumber(summary?.ready) &&
    isFiniteNumber(summary?.deferred);

  if (
    !readiness ||
    typeof readiness !== "object" ||
    !hasSummary ||
    !VALID_READINESS_STATUSES.has(String(summary?.status)) ||
    !Array.isArray(readiness.sections)
  ) {
    return {
      errors: ["unexpected launch readiness payload shape"],
      itemCount: 0,
      sectionCount: 0,
    };
  }

  const sectionsByKey = new Map();
  const statusCounts = {
    blocker: 0,
    deferred: 0,
    ready: 0,
    warning: 0,
  };
  let itemCount = 0;

  readiness.sections.forEach((section, sectionIndex) => {
    if (
      !section ||
      typeof section !== "object" ||
      typeof section.key !== "string" ||
      typeof section.title !== "string" ||
      !VALID_READINESS_STATUSES.has(String(section.status)) ||
      !Array.isArray(section.items)
    ) {
      errors.push(
        `section ${sectionIndex} must include key, title, status, and items`,
      );
      return;
    }

    if (sectionsByKey.has(section.key)) {
      errors.push(`duplicate readiness section: ${section.key}`);
    }
    sectionsByKey.set(section.key, section);

    section.items.forEach((item, itemIndex) => {
      itemCount += 1;

      if (
        !item ||
        typeof item !== "object" ||
        typeof item.key !== "string" ||
        typeof item.label !== "string" ||
        typeof item.description !== "string" ||
        typeof item.action !== "string" ||
        typeof item.detail !== "string" ||
        !VALID_READINESS_STATUSES.has(String(item.status))
      ) {
        errors.push(
          `${section.key} item ${itemIndex} must include key, label, description, action, detail, and status`,
        );
        return;
      }

      statusCounts[item.status] += 1;
    });
  });

  for (const [sectionKey, requiredItemKeys] of REQUIRED_READINESS_CONTRACT) {
    const section = sectionsByKey.get(sectionKey);

    if (!section) {
      errors.push(`missing launch readiness section: ${sectionKey}`);
      continue;
    }

    const itemKeys = new Set(section.items.map((item) => item?.key));
    const missingItems = requiredItemKeys.filter(
      (itemKey) => !itemKeys.has(itemKey),
    );

    if (missingItems.length > 0) {
      errors.push(`${sectionKey} missing item(s): ${missingItems.join(", ")}`);
    }
  }

  for (const status of VALID_READINESS_STATUSES) {
    if (summary[status] !== statusCounts[status]) {
      errors.push(
        `summary ${status}=${summary[status]} does not match item count ${statusCounts[status]}`,
      );
    }
  }

  const expectedOverall = overallStatus(statusCounts);
  if (summary.status !== expectedOverall) {
    errors.push(
      `summary status=${summary.status} does not match expected ${expectedOverall}`,
    );
  }

  return {
    errors,
    itemCount,
    sectionCount: readiness.sections.length,
  };
}

function overallStatus(counts) {
  if (counts.blocker > 0) {
    return "blocker";
  }

  if (counts.warning > 0) {
    return "warning";
  }

  if (counts.ready === 0 && counts.deferred > 0) {
    return "deferred";
  }

  return "ready";
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
