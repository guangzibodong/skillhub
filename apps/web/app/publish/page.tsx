import { FileJson, UploadCloud } from "lucide-react";
import { PublishForm } from "@/components/publish-form";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="publish-shell">
      <SiteHeader
        active="publish"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/publish"
        subtitle={dictionary.publishPage.consoleSubtitle}
      />

      <section className="publish-hero" aria-labelledby="publish-heading">
        <div>
          <div className="eyebrow">
            <UploadCloud size={16} aria-hidden="true" />
            <span>{dictionary.publishPage.eyebrow}</span>
          </div>
          <h1 id="publish-heading">{dictionary.publishPage.title}</h1>
          <p>{dictionary.publishPage.description}</p>
        </div>
        <div className="publish-hero__badge">
          <FileJson size={18} aria-hidden="true" />
          <span>{dictionary.publishPage.badge}</span>
        </div>
      </section>

      <PublishForm apiUrl={apiUrl} labels={dictionary.publishForm} locale={locale} />
    </main>
  );
}
