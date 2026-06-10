import { redirect } from "next/navigation";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { roleLandingPath } from "@/lib/role-landing";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RoleLandingPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const session = await getWorkspaceSession();

  redirect(roleLandingPath(session.subject, locale) as Parameters<typeof redirect>[0]);
}
