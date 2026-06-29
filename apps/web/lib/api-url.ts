const defaultLocalApiUrl = "http://localhost:8787";
const defaultLocalAppUrl = "http://localhost:3000";

export function getPublicApiUrl() {
  return normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL ?? defaultLocalApiUrl);
}

export function getServerApiUrl() {
  return normalizeApiUrl(
    process.env.SKILLHUB_SERVER_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      defaultLocalApiUrl,
  );
}

export function getPublicAppUrl() {
  return normalizeApiUrl(process.env.NEXT_PUBLIC_APP_URL ?? defaultLocalAppUrl);
}

function normalizeApiUrl(value: string) {
  return value.replace(/\/+$/, "");
}
