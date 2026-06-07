export function redactSecrets(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer <redacted>")
    .replace(/shub_[A-Za-z0-9._~+/-]+/g, "shub_<redacted>")
    .replace(/skh_[A-Za-z0-9._~+/-]+/g, "skh_<redacted>")
    .replace(/whsec_[A-Za-z0-9._~+/-]+/g, "whsec_<redacted>")
    .replace(/sk-[A-Za-z0-9._~+/-]+/g, "sk-<redacted>");
}

export function findSensitiveLeaks(text) {
  const leaks = [];
  const rawPatterns = [
    [/Bearer\s+[A-Za-z0-9._~+/-]+/i, "authorization bearer"],
    [/shub_[A-Za-z0-9._~+/-]{8,}/, "user token"],
    [/skh_[A-Za-z0-9._~+/-]{8,}/, "project api key"],
    [/whsec_[A-Za-z0-9._~+/-]{8,}/, "webhook signing secret"],
    [/sk-[A-Za-z0-9._~+/-]{20,}/, "provider key"],
    [/"deliveryPreviewCode"\s*:/i, "email verification preview code"],
    [/"apiKey"\s*:\s*"[^"<\[]/i, "raw apiKey field"],
  ];

  for (const [pattern, label] of rawPatterns) {
    if (pattern.test(text)) {
      leaks.push(label);
    }
  }

  try {
    const parsed = JSON.parse(text);
    inspectSensitiveKeys(parsed, [], leaks);
  } catch {
    // Pattern scans above still protect non-JSON text.
  }

  return leaks;
}

function inspectSensitiveKeys(value, path, leaks) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectSensitiveKeys(item, [...path, String(index)], leaks),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    const normalizedKey = key.toLowerCase();

    if (
      typeof child === "string" &&
      normalizedKey === "code" &&
      child &&
      !isRedactedValue(child)
    ) {
      leaks.push(`${nextPath.join(".")} contains an unredacted code`);
    }

    if (
      typeof child === "string" &&
      (normalizedKey === "authorization" ||
        normalizedKey === "password" ||
        normalizedKey === "api_key" ||
        normalizedKey === "apikey") &&
      child &&
      !isRedactedValue(child)
    ) {
      leaks.push(`${nextPath.join(".")} contains sensitive value`);
    }

    inspectSensitiveKeys(child, nextPath, leaks);
  }
}

function isRedactedValue(value) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("redacted") ||
    normalized === "configured" ||
    normalized === "missing" ||
    normalized.startsWith("missing ") ||
    normalized.includes("not configured")
  );
}
