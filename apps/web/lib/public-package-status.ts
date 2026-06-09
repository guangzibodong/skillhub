export const PUBLIC_PACKAGE_STATUS = {
  cliPackageName: null,
  cliPublished: false,
  sdkPackageName: null,
  sdkPublished: false,
} as const;

export function publicRestSearchCommand(apiUrl: string) {
  return `curl "${apiUrl.replace(/\/+$/, "")}/v1/skills/search?limit=50"`;
}

export function publicRestInspectCommand(apiUrl: string, slug: string) {
  return `curl "${apiUrl.replace(/\/+$/, "")}/v1/skills/${encodeURIComponent(slug)}"`;
}
