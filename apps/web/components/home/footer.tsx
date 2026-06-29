"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { localizedHref, type Locale } from "@/lib/i18n";
import { companyInfo, companyLinks } from "@/lib/company-info";

type Props = {
  locale: Locale;
};

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: Record<Locale, FooterColumn[]> = {
  en: [
    {
      title: "Product",
      links: [
        { href: "/marketplace", label: "Find Skills" },
        { href: "/registry", label: "Skill API" },
        { href: "/pricing", label: "Plans" },
        { href: "/what-is-a-skill", label: "What is a Skill?" },
      ],
    },
    {
      title: "Developers",
      links: [
        { href: "/docs", label: "Docs & Guides" },
        { href: "/api", label: "API" },
        { href: "/mcp", label: "MCP Access" },
        { href: "/integrations", label: "Integrations" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/solutions", label: "Solutions" },
        { href: "/use-cases", label: "Use cases" },
        { href: "/examples", label: "Examples" },
        { href: "/blog", label: "Blog" },
      ],
    },
    {
      title: "Publishers",
      links: [
        { href: "/publish", label: "Publish Skill" },
        { href: "/publisher-review", label: "Review process" },
        { href: "/publishers", label: "Publisher directory" },
        { href: "/changelog", label: "Changelog" },
      ],
    },
    {
      title: "Trust",
      links: [
        { href: "/security", label: "Security & Trust" },
        { href: "/data-handling", label: "Data handling" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/support", label: "Support" },
      ],
    },
  ],
  zh: [
    {
      title: "产品",
      links: [
        { href: "/marketplace", label: "找技能" },
        { href: "/registry", label: "技能 API" },
        { href: "/pricing", label: "价格方案" },
        { href: "/what-is-a-skill", label: "什么是 Skill" },
      ],
    },
    {
      title: "开发者",
      links: [
        { href: "/docs", label: "使用文档" },
        { href: "/api", label: "API" },
        { href: "/mcp", label: "MCP 接入" },
        { href: "/integrations", label: "集成方式" },
      ],
    },
    {
      title: "资源",
      links: [
        { href: "/solutions", label: "解决方案" },
        { href: "/use-cases", label: "使用场景" },
        { href: "/examples", label: "示例模板" },
        { href: "/blog", label: "博客指南" },
      ],
    },
    {
      title: "发布者",
      links: [
        { href: "/publish", label: "发布技能" },
        { href: "/publisher-review", label: "审核流程" },
        { href: "/publishers", label: "发布者目录" },
        { href: "/changelog", label: "更新日志" },
      ],
    },
    {
      title: "信任",
      links: [
        { href: "/security", label: "安全合规" },
        { href: "/data-handling", label: "数据处理" },
        { href: "/privacy", label: "隐私政策" },
        { href: "/terms", label: "服务条款" },
      ],
    },
    {
      title: "公司",
      links: [
        { href: "/about", label: "关于我们" },
        { href: "/contact", label: "联系" },
        { href: "/support", label: "支持" },
      ],
    },
  ],
};

export function HomeFooter({ locale }: Props) {
  const columns = footerColumns[locale];
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const alternateLocale = locale === "zh" ? "en" : "zh";
  const alternateLocaleHref = localizedHrefWithCurrentSearch(
    pathname,
    alternateLocale,
    searchParams,
  );

  return (
    <footer className="home-footer" aria-label={locale === "zh" ? "站点页脚" : "Site footer"}>
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <a href={localizedHref("/", locale)} className="home-footer__logo" aria-label="SkillHub home">
            <span aria-hidden="true">S</span>
            <strong>SkillHub</strong>
          </a>
          <p>
            {locale === "zh"
              ? "面向 AI Agent 的 Skill 注册、审核、调用权限与记录和市场预览基础设施。"
              : "Skill API catalog, review, call permissions and logs, and marketplace preview infrastructure for AI Agent Skills."}
          </p>
        </div>

        <nav className="home-footer__links" aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}>
          {columns.map((column) => (
            <div className="home-footer__column" key={column.title}>
              <h2>{column.title}</h2>
              {column.links.map((link) => (
                <a href={localizedHref(link.href, locale)} key={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <section className="home-footer__contact" aria-label={locale === "zh" ? "联系信息" : "Contact information"}>
          <h2>{locale === "zh" ? "联系信息" : "Contact"}</h2>
          <p>
            {locale === "zh" ? "技术支持：" : "Technical support: "}
            <a href={companyLinks.supportMailto}>{companyInfo.supportEmail}</a>
          </p>
          <p>
            {locale === "zh" ? "商务合作：" : "Business cooperation: "}
            <a href={companyLinks.businessMailto}>{companyInfo.businessEmail}</a>
          </p>
          <p>{locale === "zh" ? "公司地址：" : "Address: "}{companyInfo.address}</p>
        </section>

        <div className="home-footer__bottom">
          <p>
            © {new Date().getFullYear()} SkillHub.{" "}
            {locale === "zh" ? "所有公开能力以预览状态和实际配置为准。" : "Public capabilities depend on preview state and live configuration."}
          </p>
          <div>
            <a href={localizedHref("/status", locale)}>{locale === "zh" ? "状态" : "Status"}</a>
            <a href={localizedHref("/contact", locale)}>{locale === "zh" ? "联系" : "Contact"}</a>
            <a href={alternateLocaleHref}>
              {locale === "zh" ? "EN" : "中文"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function localizedHrefWithCurrentSearch(
  pathname: string,
  locale: Locale,
  searchParams: Pick<URLSearchParams, "forEach">,
) {
  const nextParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key !== "lang") {
      nextParams.append(key, value);
    }
  });

  nextParams.set("lang", locale);
  const query = nextParams.toString();

  return `${pathname}${query ? `?${query}` : ""}`;
}
