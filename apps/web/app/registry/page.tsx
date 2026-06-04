import { Boxes, Code2, Filter, Plus, RadioTower, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SkillTable } from "@/components/skill-table";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { getGatewayStats, getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getMetricValue(metrics: Awaited<ReturnType<typeof getGatewayStats>>, label: string, fallback: string) {
  return metrics.find((metric) => metric.label === label)?.value ?? fallback;
}

export default async function RegistryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [skills, gatewayStats] = await Promise.all([getSkills(), getGatewayStats()]);
  const verifiedSkills = skills.filter((skill) => skill.verificationStatus === "verified").length;
  const visibleMetrics = [
    { label: dictionary.metrics.publishedSkills, value: String(Math.max(skills.length, Number(getMetricValue(gatewayStats, "Published skills", "0")) || 0)) },
    { label: dictionary.metrics.verified, value: String(Math.max(verifiedSkills, Number(getMetricValue(gatewayStats, "Verified", "0")) || 0)) },
    { label: dictionary.metrics.apiCalls, value: getMetricValue(gatewayStats, "API calls", "0") },
    { label: dictionary.metrics.avgLatency, value: getMetricValue(gatewayStats, "Avg latency", "--") }
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="registry" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/registry" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <Boxes size={16} aria-hidden="true" />
            <span>{dictionary.registryPage.eyebrow}</span>
          </div>
          <h1>{dictionary.registryPage.title}</h1>
          <p>{dictionary.registryPage.description}</p>
        </div>
        <a className="primary-button primary-button--large" href={localizedHref("/publish", locale)}>
          <Plus size={18} aria-hidden="true" />
          <span>{dictionary.home.newSkill}</span>
        </a>
      </section>

      <section className="registry-layout">
        <aside className="registry-aside">
          <div className="info-panel lift-card">
            <div className="card-kicker">
              <Filter size={16} aria-hidden="true" />
              <span>{dictionary.registryPage.filtersTitle}</span>
            </div>
            <div className="filter-cloud">
              {dictionary.registryPage.filters.map((filter) => (
                <span key={filter}>{filter}</span>
              ))}
            </div>
          </div>

          <div className="info-panel lift-card">
            <RadioTower size={20} aria-hidden="true" />
            <h2>{dictionary.registryPage.endpointTitle}</h2>
            <p>{dictionary.registryPage.endpointBody}</p>
            <code>{apiUrl}/v1/skills/search</code>
          </div>

          <div className="info-panel lift-card">
            <ShieldCheck size={20} aria-hidden="true" />
            <h2>{dictionary.registryPage.packageTitle}</h2>
            <p>{dictionary.registryPage.packageBody}</p>
          </div>
        </aside>

        <section className="registry-workbench registry-workbench--page" aria-labelledby="registry-page-heading">
          <div className="workbench-top">
            <div>
              <div className="card-kicker">
                <Boxes size={16} aria-hidden="true" />
                <span>{dictionary.home.registryEyebrow}</span>
              </div>
              <h2 id="registry-page-heading">{dictionary.home.registryTitle}</h2>
            </div>
            <div className="workbench-actions">
              <div className="search-box">
                <Search size={17} aria-hidden="true" />
                <input aria-label={dictionary.home.searchPlaceholder} placeholder={dictionary.home.searchPlaceholder} />
              </div>
              <a className="secondary-button" href={localizedHref("/docs", locale)}>
                <Code2 size={17} aria-hidden="true" />
                <span>{dictionary.nav.docs}</span>
              </a>
            </div>
          </div>

          <div className="metric-strip metric-strip--four">
            {visibleMetrics.map((item) => (
              <div className="metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <SkillTable apiUrl={apiUrl} labels={dictionary.skillTable} skills={skills} />
        </section>
      </section>
    </main>
  );
}
