import { redirect } from "next/navigation";
import { getLocaleFromSearchParams } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgentsRedirectPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  redirect(locale === "zh" ? "/prompts?lang=zh" : "/prompts");
}
