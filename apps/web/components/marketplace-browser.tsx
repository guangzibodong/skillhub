"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Copy, ExternalLink, Search, ShieldCheck, Star, Timer, Zap } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import {
  localizeText,
  marketplaceCategories,
  type MarketplaceSkill
} from "@/lib/marketplace-data";
import { publisherSlugFromName } from "@/lib/public-publishers";

type MarketplaceBrowserProps = {
  locale: Locale;
  skills: MarketplaceSkill[];
};

const labels = {
  en: {
    search: "Search skills, integrations, permissions",
    results: "results",
    copy: "Copy install",
    copied: "Copied",
    details: "Details",
    by: "by",
    allPricing: "All pricing",
    free: "Free",
    perCall: "Per call",
    subscription: "Subscription",
    success: "success",
    latency: "latency",
    install: "install",
    catalog: "SkillHub Catalog",
    risk: {
      low: "low",
      medium: "medium",
      high: "high"
    }
  },
  zh: {
    search: "搜索技能、集成、权限",
    results: "个结果",
    copy: "复制安装",
    copied: "已复制",
    details: "详情",
    by: "来自",
    allPricing: "全部价格",
    free: "免费",
    perCall: "按次调用",
    subscription: "订阅",
    success: "成功率",
    latency: "延迟",
    install: "安装",
    catalog: "SkillHub 技能目录",
    risk: {
      low: "低风险",
      medium: "中风险",
      high: "高风险"
    }
  }
} as const;

const pricingOptions = [
  { key: "all", label: { en: "All pricing", zh: "全部价格" } },
  { key: "free", label: { en: "Free", zh: "免费" } },
  { key: "per_call", label: { en: "Per call", zh: "按次调用" } },
  { key: "subscription", label: { en: "Subscription", zh: "订阅" } }
] as const;

export function MarketplaceBrowser({ locale, skills }: MarketplaceBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof marketplaceCategories)[number]["key"]>("all");
  const [pricing, setPricing] = useState<(typeof pricingOptions)[number]["key"]>("all");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const dictionary = labels[locale];

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const text = [
        localizeText(skill.name, locale),
        localizeText(skill.summary, locale),
        localizeText(skill.category, locale),
        skill.author,
        skill.runtime,
        ...skill.tags[locale]
      ]
        .join(" ")
        .toLowerCase();

      const queryMatch = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const categoryMatch = category === "all" || skill.categoryKey === category;
      const pricingMatch = pricing === "all" || skill.billing === pricing;

      return queryMatch && categoryMatch && pricingMatch;
    });
  }, [category, locale, pricing, query, skills]);

  function copyInstall(skill: MarketplaceSkill) {
    void navigator.clipboard.writeText(skill.installsCommand.cli).then(() => {
      setCopiedSlug(skill.slug);
      window.setTimeout(() => setCopiedSlug(null), 1400);
    });
  }

  return (
    <section className="market-browser" aria-labelledby="market-browser-heading">
      <div className="market-browser__top">
        <div>
          <div className="card-kicker">
            <Search size={16} aria-hidden="true" />
            <span id="market-browser-heading">{dictionary.catalog}</span>
          </div>
          <strong>{filteredSkills.length} {dictionary.results}</strong>
        </div>
        <label className="market-search">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={dictionary.search} />
        </label>
      </div>

      <div className="market-filter-row" aria-label="Category filters">
        {marketplaceCategories.map((item) => (
          <button
            className={category === item.key ? "filter-button filter-button--active" : "filter-button"}
            key={item.key}
            onClick={() => setCategory(item.key)}
            type="button"
          >
            {localizeText(item.label, locale)}
          </button>
        ))}
      </div>

      <div className="market-filter-row" aria-label="Pricing filters">
        {pricingOptions.map((item) => (
          <button
            className={pricing === item.key ? "filter-button filter-button--active" : "filter-button"}
            key={item.key}
            onClick={() => setPricing(item.key)}
            type="button"
          >
            {localizeText(item.label, locale)}
          </button>
        ))}
      </div>

      <div className="market-card-grid">
        {filteredSkills.map((skill) => (
          <article className="market-skill-card lift-card" key={skill.slug}>
            <div className="market-skill-card__head">
              <div className="market-skill-card__icon" aria-hidden="true">
                <Zap size={18} />
              </div>
              <div>
                <span>{localizeText(skill.category, locale)}</span>
                <h2>{localizeText(skill.name, locale)}</h2>
                <a className="market-skill-card__publisher" href={localizedHref(`/publishers/${publisherSlugFromName(skill.author)}`, locale)}>
                  {dictionary.by} {skill.author}
                </a>
              </div>
              <span className={`risk-badge risk-badge--${skill.risk}`}>{dictionary.risk[skill.risk]}</span>
            </div>

            <p>{localizeText(skill.summary, locale)}</p>

            <div className="market-skill-card__meta">
              <span>
                <Star size={14} aria-hidden="true" />
                {skill.rating}
              </span>
              <span>
                <BadgeCheck size={14} aria-hidden="true" />
                {skill.successRate} {dictionary.success}
              </span>
              <span>
                <Timer size={14} aria-hidden="true" />
                {skill.latency} {dictionary.latency}
              </span>
            </div>

            <div className="tag-list">
              {skill.tags[locale].slice(0, 4).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="install-strip" aria-label={`${dictionary.install}: ${localizeText(skill.name, locale)}`}>
              <code>{skill.installsCommand.cli}</code>
              <button aria-label={`${dictionary.copy}: ${localizeText(skill.name, locale)}`} onClick={() => copyInstall(skill)} type="button">
                <Copy size={15} aria-hidden="true" />
                {copiedSlug === skill.slug ? dictionary.copied : dictionary.copy}
              </button>
            </div>

            <div className="market-skill-card__foot">
              <div>
                <span>{skill.price[locale]}</span>
                <strong>{localizeText(skill.verification, locale)}</strong>
              </div>
              <a className="secondary-button" href={localizedHref(`/skills/${skill.slug}`, locale)}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{dictionary.details}</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
