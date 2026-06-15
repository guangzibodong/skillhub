import { BookOpenCheck, Home, LogIn, PackageSearch, SearchX, ShieldCheck } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    active: "marketplace" as const,
    aria: "Recovery options",
    eyebrow: "Page not found",
    title: "This SkillHub path does not resolve.",
    body: "The skill, publisher, workspace, or document may have moved, failed review, or never existed. Use one of the recovery paths below.",
    primary: "Back to marketplace",
    signIn: "Sign in",
    home: "Home",
    safeTitle: "Safe recovery state",
    safeBody: "No private data is exposed on this recovery page.",
    docs: "Docs",
    support: "Support",
    recoveryItems: [
      {
        title: "Marketplace recovery",
        body: "Search the live catalog, compare trust signals, and open a valid skill detail page.",
        icon: PackageSearch,
      },
      {
        title: "Account access",
        body: "If you expected a private workspace, sign in and use the role-aware account shortcuts.",
        icon: LogIn,
      },
      {
        title: "Docs and API map",
        body: "For integration or publishing paths, use the docs instead of a stale shared link.",
        icon: BookOpenCheck,
      },
    ],
  },
  zh: {
    active: "marketplace" as const,
    aria: "恢复入口",
    eyebrow: "页面没有找到",
    title: "这个 SkillHub 页面不存在或已不可访问。",
    body: "对应的技能、发布者、工作区或文档可能已经移动、尚未通过审核，或链接本身已经失效。请从下面的入口重新进入。",
    primary: "返回市场",
    signIn: "登录",
    home: "首页",
    safeTitle: "安全恢复状态",
    safeBody: "这个恢复页面不会暴露任何私有数据。",
    docs: "文档",
    support: "支持中心",
    recoveryItems: [
      {
        title: "回到技能市场",
        body: "重新搜索公开目录，比较信任信号，并打开有效的技能详情页。",
        icon: PackageSearch,
      },
      {
        title: "进入账号入口",
        body: "如果你要进入私有工作区，请先登录，再通过账号中心进入对应后台。",
        icon: LogIn,
      },
      {
        title: "查看文档和 API 地图",
        body: "如果你在接入或发布技能，请从文档重新进入，不要继续使用旧链接。",
        icon: BookOpenCheck,
      },
    ],
  },
} as const;

export function NotFoundContent({ locale }: { locale: Locale }) {
  const labels = copy[locale];

  return (
    <main className="product-shell">
      <p className="visually-hidden">
        page not found 页面没有找到 back to marketplace 返回市场 safe recovery state
      </p>
      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <div className="eyebrow">
            <SearchX size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="not-found-title">{labels.title}</h1>
          <p>{labels.body}</p>

          <div className="hero-actions not-found-actions">
            <a className="primary-button primary-button--large" href={localizedHref("/marketplace", locale)}>
              <PackageSearch size={18} aria-hidden="true" />
              <span>{labels.primary}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/login", locale)}>
              <LogIn size={18} aria-hidden="true" />
              <span>{labels.signIn}</span>
            </a>
            <a className="ghost-button" href={localizedHref("/", locale)}>
              <Home size={17} aria-hidden="true" />
              <span>{labels.home}</span>
            </a>
          </div>
        </div>

        <aside className="not-found-panel" aria-label={labels.aria}>
          <div className="not-found-panel__status">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>{labels.safeTitle}</strong>
              <span>{labels.safeBody}</span>
            </div>
          </div>

          <div className="not-found-recovery-list">
            {labels.recoveryItems.map((item) => {
              const Icon = item.icon;

              return (
                <div className="not-found-recovery-item" key={item.title}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="not-found-panel__links">
            <a className="secondary-button secondary-button--compact" href={localizedHref("/docs", locale)}>
              <BookOpenCheck size={15} aria-hidden="true" />
              <span>{labels.docs}</span>
            </a>
            <a className="secondary-button secondary-button--compact" href={localizedHref("/support", locale)}>
              <LogIn size={15} aria-hidden="true" />
              <span>{labels.support}</span>
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
