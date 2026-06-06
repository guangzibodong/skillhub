import {
  BookOpenCheck,
  ClipboardCheck,
  FileJson,
  Gauge,
  HandCoins,
  ListChecks,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { JourneyRail } from "@/components/journey-rail";
import { FlowStepList, StatusChip } from "@/components/operational-status";
import { PublishForm } from "@/components/publish-form";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { getPublishCopy } from "@/lib/publish-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const publishCopy = getPublishCopy(locale);
  const labels = publishCopy.page;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const signalIcons = [ClipboardCheck, ShieldCheck, Gauge, HandCoins];
  const stepIcons = [FileJson, ListChecks, ClipboardCheck, ShieldCheck, Gauge, BookOpenCheck, HandCoins];

  return (
    <main className="publish-shell">
      <SiteHeader
        active="publish"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/publish"
        subtitle={labels.consoleSubtitle}
      />

      <section className="publish-hero" aria-labelledby="publish-heading">
        <div>
          <div className="eyebrow">
            <UploadCloud size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="publish-heading">{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
        <div className="publish-hero__side">
          <div className="publish-hero__badge">
            <FileJson size={18} aria-hidden="true" />
            <span>{labels.badge}</span>
          </div>
          <div className="publish-hero__signals" aria-label={labels.signalLabel}>
            {labels.signals.map(([label, value], index) => {
              const Icon = signalIcons[index] ?? ClipboardCheck;

              return (
                <div key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <JourneyRail currentStep="publish" journey="publisher" locale={locale} />

      <section className="publish-pipeline" aria-labelledby="publish-pipeline-heading">
        <div className="publish-pipeline__head">
          <div>
            <div className="card-kicker">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.pipelineEyebrow}</span>
            </div>
            <h2 id="publish-pipeline-heading">{labels.pipelineTitle}</h2>
            <p>{labels.pipelineBody}</p>
          </div>
          <a className="secondary-button" href={localizedHref("/publisher", locale)}>
            <Gauge size={16} aria-hidden="true" />
            <span>{labels.publisherWorkspace}</span>
          </a>
        </div>
        <FlowStepList
          ariaLabel={labels.pipelineTitle}
          steps={labels.pipelineSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? ListChecks;

            return {
              body: step.body,
              icon: <Icon size={16} aria-hidden="true" />,
              title: step.title
            };
          })}
        />
        <StatusChip tone="neutral">{labels.badge}</StatusChip>
      </section>

      <PublishForm apiUrl={apiUrl} labels={publishCopy.form} locale={locale} />
    </main>
  );
}
