import { HomeNav, type NavPage } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import type { Locale } from "@/lib/i18n";

type AppShellProps = {
  active?: NavPage;
  children: React.ReactNode;
  locale: Locale;
  /** Set to true for pages that manage their own top padding (e.g. hero sections) */
  flushTop?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function AppShell({
  active,
  children,
  locale,
  flushTop,
  secondaryHref,
  secondaryLabel,
}: AppShellProps) {
  return (
    <div className="app-shell app-shell--premium min-h-screen flex flex-col">
      <HomeNav active={active} locale={locale} secondaryHref={secondaryHref} secondaryLabel={secondaryLabel} />
      <main className={`app-shell__main flex-1 ${flushTop ? "" : "pt-[88px]"}`}>
        {children}
      </main>
      <HomeFooter locale={locale} />
    </div>
  );
}
