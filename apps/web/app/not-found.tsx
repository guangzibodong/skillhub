import { BookOpenCheck, Home, LogIn, PackageSearch, SearchX, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { localizedHref } from "@/lib/i18n";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata("SkillHub Page Not Found");

const recoveryItems = [
  {
    title: "Marketplace recovery / 返回市场",
    body: "Search the live catalog, compare trust signals, and open a valid Skill detail page.",
    bodyZh: "回到实时目录，比较信任信号，并打开有效的 Skill 详情页。",
    icon: PackageSearch,
  },
  {
    title: "Account access / 账号入口",
    body: "If you expected a private workspace, sign in and use the role-aware account shortcuts.",
    bodyZh: "如果你要进入私有工作区，请先登录，再通过账号中心进入对应后台。",
    icon: LogIn,
  },
  {
    title: "Docs and API map / 文档和 API 地图",
    body: "For integration or publishing paths, use the docs instead of a stale shared link.",
    bodyZh: "如果你在接入或发布 Skill，请从文档重新进入，不要继续使用旧链接。",
    icon: BookOpenCheck,
  },
];

export default function NotFound() {
  return (
    <AppShell active="marketplace" locale="en">
      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <div className="eyebrow">
            <SearchX size={16} aria-hidden="true" />
            <span>Page not found / 页面没有找到</span>
          </div>
          <h1 id="not-found-title">This SkillHub path does not resolve.</h1>
          <p>
            The Skill, publisher, workspace, or document may have moved, failed
            review, or never existed. Use one of the recovery paths below.
          </p>
          <p className="not-found-copy__zh">
            这个页面没有找到。对应的 Skill、发布者、工作区或文档可能已经移动、尚未通过审核，或链接本身已经失效。
          </p>

          <div className="hero-actions not-found-actions">
            <a className="primary-button primary-button--large" href={localizedHref("/marketplace", "en")}>
              <PackageSearch size={18} aria-hidden="true" />
              <span>Back to marketplace</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/login", "en")}>
              <LogIn size={18} aria-hidden="true" />
              <span>Sign in</span>
            </a>
            <a className="ghost-button" href={localizedHref("/", "en")}>
              <Home size={17} aria-hidden="true" />
              <span>Home</span>
            </a>
          </div>
        </div>

        <aside className="not-found-panel" aria-label="Recovery options">
          <div className="not-found-panel__status">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>Safe recovery state</strong>
              <span>No private data is exposed on this recovery page.</span>
            </div>
          </div>

          <div className="not-found-recovery-list">
            {recoveryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="not-found-recovery-item" key={item.title}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <small>{item.bodyZh}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="not-found-panel__links">
            <a className="secondary-button secondary-button--compact" href={localizedHref("/docs", "en")}>
              <BookOpenCheck size={15} aria-hidden="true" />
              <span>Docs</span>
            </a>
            <a className="secondary-button secondary-button--compact" href={localizedHref("/support", "en")}>
              <LogIn size={15} aria-hidden="true" />
              <span>Support</span>
            </a>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
