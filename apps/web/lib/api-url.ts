const defaultPublicApiUrl = "https://api.useskillhub.com";

export function getPublicApiUrl() {
  return normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL ?? defaultPublicApiUrl);
}

export function getServerApiUrl() {
  return normalizeApiUrl(
    process.env.SKILLHUB_SERVER_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      defaultPublicApiUrl,
  );
}

function normalizeApiUrl(value: string) {
  return value.replace(/\/+$/, "");
}
