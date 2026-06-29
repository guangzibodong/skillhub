import { HomeFooter } from "@/components/home/footer";
import { SiteHeader } from "@/components/site-header";
import type { SiteHeaderActive } from "@/components/site-header-client";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, localizedHref, type Locale } from "@/lib/i18n";

type AppShellProps = {
  active?: SiteHeaderActive;
  children: React.ReactNode;
  locale: Locale;
  /* Retained for existing callers; SiteHeader pages do not need shell top padding. */
  flushTop?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export async function AppShell({
  active,
  children,
  locale,
  secondaryHref,
  secondaryLabel,
}: AppShellProps) {
  const dictionary = getDictionary(locale);
  const session = await getWorkspaceSession();
  const defaultSecondaryHref = session?.subject
    ? localizedHref("/account", locale)
    : localizedHref("/login", locale);
  const defaultSecondaryLabel = session?.subject
    ? locale === "zh"
      ? "个人中心"
      : "Account"
    : locale === "zh"
      ? "登录"
      : "Sign in";
  const resolvedSecondaryHref = secondaryHref ?? defaultSecondaryHref;
  const resolvedSecondaryLabel = secondaryLabel ?? defaultSecondaryLabel;

  return (
    <div className="app-shell app-shell--premium min-h-screen flex flex-col">
      <SiteHeader
        active={active}
        consoleHref={resolvedSecondaryHref}
        consoleLabel={resolvedSecondaryLabel}
        dictionary={dictionary}
        locale={locale}
        showStageBanner={false}
      />
      <main className="app-shell__main flex-1">
        {children}
      </main>
      <HomeFooter locale={locale} />
    </div>
  );
}
