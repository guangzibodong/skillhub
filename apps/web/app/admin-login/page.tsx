import { redirect } from "next/navigation";
import { getLocaleFromSearchParams } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const params = new URLSearchParams({
    lang: locale,
    returnTo: locale === "zh" ? "/admin?lang=zh" : "/admin?lang=en"
  });

  redirect(`/login?${params.toString()}`);
}
