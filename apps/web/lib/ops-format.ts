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
