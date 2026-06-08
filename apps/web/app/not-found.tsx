import {
  BookOpenCheck,
  Home,
  LogIn,
  PackageSearch,
  SearchX,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, localizedHref } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

const recoveryItems = [
  {
    body: "Search the live catalog, compare trust signals, and open a valid skill detail page.",
    bodyZh: "回到实时目录，比较信任信号，并打开有效的技能详情。",
    icon: PackageSearch,
    title: "Marketplace recovery",
    titleZh: "返回市场",
  },
  {
    body: "If you expected a private workspace, sign in and use the role-aware account shortcuts.",
    bodyZh: "如果你要进入私有工作区，请先登录，再通过账号中心进入对应后台。",
    icon: LogIn,
    title: "Account access",
    titleZh: "账号入口",
  },
  {
    body: "For an integration or publishing path, use the docs instead of a stale shared link.",
    bodyZh: "如果你在接入或发布技能，请从文档重新进入，不要继续使用旧链接。",
    icon: BookOpenCheck,
    title: "Docs and API map",
    titleZh: "文档和 API 地图",
  },
];

export default function NotFound() {
  const dictionary = getDictionary("en");

  return (
    <main className="product-shell">
      <Suspense fallback={<NotFoundHeaderFallback />}>
        <SiteHeader
          active="marketplace"
          apiUrl={apiUrl}
          dictionary={dictionary}
          locale="en"
          pathname="/not-found"
        />
      </Suspense>

      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <div className="eyebrow">
            <SearchX size={16} aria-hidden="true" />
            <span>Page not found / 页面没有找到</span>
          </div>
          <h1 id="not-found-title">This SkillHub path does not resolve.</h1>
          <p>
            The skill, publisher, workspace, or document may have moved, failed
            review, or never existed. SkillHub keeps broken routes inside the
            product shell so users can recover without losing the marketplace
            context.
          </p>
          <p className="not-found-copy__zh">
            这个页面没有找到。对应技能、发布者、工作区或文档可能已经移动、尚未通过审核，或链接本身已经失效。
          </p>

          <div className="hero-actions not-found-actions">
            <a
              className="primary-button primary-button--large"
              href={localizedHref("/marketplace", "zh")}
            >
              <PackageSearch size={18} aria-hidden="true" />
              <span>Back to marketplace / 返回市场</span>
            </a>
            <a
              className="secondary-button secondary-button--large"
              href={localizedHref("/login", "zh")}
            >
              <LogIn size={18} aria-hidden="true" />
              <span>Sign in / 登录</span>
            </a>
            <a className="ghost-button" href={localizedHref("/", "zh")}>
              <Home size={17} aria-hidden="true" />
              <span>Home / 首页</span>
            </a>
          </div>
        </div>

        <aside className="not-found-panel" aria-label="Recovery options">
          <div className="not-found-panel__status">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>Safe recovery state</strong>
              <span>安全恢复状态</span>
            </div>
          </div>

          <div className="not-found-recovery-list">
            {recoveryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="not-found-recovery-item" key={item.title}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>
                      {item.title} / {item.titleZh}
                    </strong>
                    <p>{item.body}</p>
                    <small>{item.bodyZh}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="not-found-panel__links">
            <a
              className="secondary-button secondary-button--compact"
              href={localizedHref("/docs", "zh")}
            >
              <BookOpenCheck size={15} aria-hidden="true" />
              <span>Docs / 文档</span>
            </a>
            <a
              className="secondary-button secondary-button--compact"
              href={localizedHref("/publish", "zh")}
            >
              <UploadCloud size={15} aria-hidden="true" />
              <span>Publish / 发布</span>
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}

function NotFoundHeaderFallback() {
  return (
    <header className="site-header not-found-header-fallback">
      <a
        className="brand brand--link"
        href={localizedHref("/", "en")}
        aria-label="SkillHub home"
      >
        <div className="brand__mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>SkillHub</strong>
          <small>useskillhub.com</small>
        </div>
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        <a href={localizedHref("/", "en")}>Home</a>
        <a
          className="site-nav__link--active"
          href={localizedHref("/marketplace", "en")}
        >
          Marketplace
        </a>
        <a href={localizedHref("/docs", "en")}>Docs</a>
      </nav>

      <div className="site-actions">
        <div className="language-switcher" aria-label="Language">
          <a
            className="language-switcher__item language-switcher__item--active"
            href={localizedHref("/not-found", "en")}
          >
            EN
          </a>
          <a
            className="language-switcher__item"
            href={localizedHref("/not-found", "zh")}
          >
            中文
          </a>
        </div>
        <a
          className="ghost-button site-action-secondary"
          href={localizedHref("/login", "en")}
        >
          <LogIn size={17} aria-hidden="true" />
          <span>Sign in</span>
        </a>
        <a
          className="primary-button site-action-publish"
          href={localizedHref("/publish", "en")}
        >
          <UploadCloud size={17} aria-hidden="true" />
          <span>Publish</span>
        </a>
      </div>
    </header>
  );
}
