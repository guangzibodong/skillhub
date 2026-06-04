type RouteContext = {
  params: Promise<{
    invoiceId: string;
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { invoiceId, slug } = await context.params;
  const token = process.env.SKILLHUB_USER_TOKEN ?? process.env.SKILLHUB_ADMIN_TOKEN;

  if (!token) {
    return new Response("Set SKILLHUB_USER_TOKEN or SKILLHUB_ADMIN_TOKEN before downloading invoices.", {
      status: 401
    });
  }

  const response = await fetch(
    `${getApiUrl()}/v1/projects/${encodeURIComponent(slug)}/invoices/${encodeURIComponent(invoiceId)}/download`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  const body = await response.text();

  return new Response(body, {
    headers: {
      "Content-Disposition": response.headers.get("Content-Disposition") ?? `attachment; filename="${invoiceId}.csv"`,
      "Content-Type": response.headers.get("Content-Type") ?? "text/csv; charset=utf-8"
    },
    status: response.status
  });
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
