import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = "scripts/qa-acceptance-team.mjs";

test("acceptance team QA preserves actionable launch readiness details", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /function collectReadinessDetails\(/);
  assert.match(source, /details:\s*blockerDetails/);
  assert.match(source, /details:\s*attentionDetails/);
  assert.match(
    source,
    /\.\.\.\(details && details\.length > 0 \? \{ details \} : \{\}\)/,
  );
  assert.match(source, /\$\{detail\.sectionKey\}\/\$\{detail\.itemKey\}/);
  assert.match(source, /detail\.action/);
  assert.match(source, /detail\.detail/);
});

test("skill detail hero metrics use localized preview fallback", async () => {
  const source = await readFile("apps/web/app/skills/[slug]/page.tsx", "utf8");

  assert.match(source, /previewMetric:\s*"Preview"/);
  assert.match(source, /previewMetric:\s*"\u9884\u89c8\u4e2d"/);
  assert.match(source, /formatMetricValue\(skill\.successRate,\s*locale\)/);
  assert.match(source, /formatMetricValue\(skill\.latency,\s*locale\)/);
  assert.doesNotMatch(source, /<strong>\{skill\.successRate\}<\/strong>/);
  assert.doesNotMatch(source, /<strong>\{skill\.latency\}<\/strong>/);
});

test("workspace locked heroes use access-first copy", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const developerPage = await readFile(
    "apps/web/app/developer/workspace-page.tsx",
    "utf8",
  );
  const i18n = await readFile("apps/web/lib/i18n.ts", "utf8");
  const publisherPage = await readFile(
    "apps/web/app/publisher/page.tsx",
    "utf8",
  );
  const publisherCopy = await readFile(
    "apps/web/lib/publisher-page-copy.ts",
    "utf8",
  );

  assert.match(
    developerPage,
    /lockedTitle:\s*"Enter the developer workspace after sign-in\."/,
  );
  assert.match(
    developerPage,
    /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u3002"/,
  );
  assert.match(developerPage, /function DeveloperLockedContent\(/);
  assert.match(
    developerPage,
    /statusText=\{hasWorkspaceSession\s*\?\s*labels\.lockedTitle\s*:\s*labels\.lockedTitle\}/,
  );
  assert.match(developerPage, /<h2>\{title\}<\/h2>/);
  assert.match(developerPage, /<p>\{body\}<\/p>/);

  assert.match(
    publisherCopy,
    /lockedTitle:\s*"Enter the publisher workspace after sign-in\."/,
  );
  assert.match(
    publisherCopy,
    /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u3002"/,
  );
  assert.match(publisherPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(publisherPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(
    i18n,
    /lockedTitle:\s*"Enter the platform admin after sign-in\."/,
  );
  assert.match(
    i18n,
    /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u5e73\u53f0\u7ba1\u7406\u540e\u53f0\u3002"/,
  );
  assert.match(adminPage, /function AdminAccessGate\(/);
  assert.match(adminPage, /adminAccessCopyZh/);
  assert.match(adminPage, /adminAccessCopyEn/);
  assert.match(adminPage, /<h1>\{copy\.title\}<\/h1>/);
  assert.match(adminPage, /<p>\{copy\.body\}<\/p>/);
  assert.match(adminPage, /title:\s*"Operator sign-in required"/);
  assert.match(
    adminPage,
    /title:\s*"\u9700\u8981\u5148\u767b\u5f55\u8fd0\u8425\u8d26\u53f7"/,
  );
});

test("admin readiness target links fall back to visible panels", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const switcher = await readFile(
    "apps/web/app/admin/admin-panel-switcher.tsx",
    "utf8",
  );
  const readinessPanel = await readFile(
    "apps/web/components/admin-launch-readiness-panel.tsx",
    "utf8",
  );
  const dashboardPage = await readFile(
    "apps/web/app/dashboard/page.tsx",
    "utf8",
  );

  assert.match(
    adminPage,
    /const availableAdminPanelIds = buildAvailableAdminPanelIds\(adminPermissions\)/,
  );
  assert.match(adminPage, /availablePanelIds=\{availableAdminPanelIds\}/);
  assert.match(adminPage, /function buildAvailableAdminPanelIds\(/);

  assert.match(readinessPanel, /availablePanelIds\?: readonly string\[\]/);
  assert.match(readinessPanel, /function adminPanelIdFromHref\(/);
  assert.match(readinessPanel, /availablePanelIds\.has\(targetPanelId\)/);
  assert.match(
    readinessPanel,
    /localizedHref\("\/admin#launch-readiness", locale\)/,
  );
  assert.match(readinessPanel, /function repairHrefFor\(key: string\)/);
  assert.match(readinessPanel, /function repairAnchorId\(key: string\)/);
  assert.match(readinessPanel, /id=\{repairAnchorId\(item\.key\)\}/);
  assert.match(readinessPanel, /id=\{readinessItemAnchorId\(item\.key\)\}/);

  for (const key of [
    "email_auth_secret",
    "email_challenge_storage",
    "password_credential_storage",
    "email_debug_codes",
    "email_provider",
    "github_oauth",
    "google_oauth",
    "legacy_signup",
    "notification_delivery_schema",
    "oauth_callback_base_url",
    "oauth_providers",
    "oauth_state_secret",
    "public_signup_policy",
    "session_cookie_domain",
  ]) {
    assert.match(
      readinessPanel,
      new RegExp(`${key}: \\{[\\s\\S]*?href: repairHrefFor\\("${key}"\\)`),
    );
    assert.doesNotMatch(
      readinessPanel,
      new RegExp(`${key}: \\{[\\s\\S]*?href: "/login"`),
    );
  }

  assert.match(switcher, /const \[unavailablePanelId, setUnavailablePanelId\]/);
  assert.match(switcher, /const activateUnavailablePanel = useCallback/);
  assert.match(switcher, /const activatePanelAnchor = useCallback/);
  assert.match(switcher, /function panelIdFromHash\(/);
  assert.match(switcher, /function isLaunchReadinessInternalAnchor\(/);
  assert.match(switcher, /value\.startsWith\("readiness-repair-"\)/);
  assert.match(switcher, /value\.startsWith\("readiness-item-"\)/);
  assert.match(switcher, /operator-panel-notice/);

  assert.match(dashboardPage, /href: "\/admin#admin-reviews"/);
  assert.match(dashboardPage, /href: "\/admin#launch-readiness"/);
  assert.match(
    dashboardPage,
    /<a href=\{localizedHref\(step\.href, locale\)\}>/,
  );
});

test("admin exit opens confirmation before submitting sign out", async () => {
  const switcher = await readFile(
    "apps/web/app/admin/admin-panel-switcher.tsx",
    "utf8",
  );
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");

  assert.match(adminPage, /async function signOut\(\)/);
  assert.match(adminPage, /await signOutAction\(locale\)/);
  assert.match(
    switcher,
    /const \[isSignOutDialogOpen, setIsSignOutDialogOpen\]/,
  );
  assert.match(switcher, /role="dialog"/);
  assert.match(switcher, /aria-modal="true"/);
  assert.match(switcher, /setIsSignOutDialogOpen\(true\)/);
  assert.match(switcher, /form action=\{signOutAction\}/);
  assert.match(switcher, /operator-signout-dialog/);
  assert.doesNotMatch(
    switcher,
    /<button className="operator-exit-button" type="submit">/,
  );
});

test("all sign out flows redirect to the login page", async () => {
  const accountSignOut = await readFile(
    "apps/web/components/account-sidebar-sign-out.tsx",
    "utf8",
  );
  const adminSwitcher = await readFile(
    "apps/web/app/admin/admin-panel-switcher.tsx",
    "utf8",
  );
  const authActions = await readFile("apps/web/lib/auth-actions.ts", "utf8");
  const loginPage = await readFile("apps/web/app/login/page.tsx", "utf8");

  assert.match(
    authActions,
    /export async function signOutAction\(locale: Locale\)/,
  );
  assert.match(
    authActions,
    /export async function signOutClientAction\(locale: Locale\)/,
  );
  assert.match(authActions, /redirect\(signOutRedirectPath\(locale\)\)/);
  assert.match(authActions, /return \{ redirectTo: signOutRedirectPath\(locale\) \}/);
  assert.match(authActions, /function signOutRedirectPath\(locale: Locale\)/);
  assert.match(
    authActions,
    /locale === "zh" \? "\/login\?lang=zh" : "\/login\?lang=en"/,
  );
  assert.match(authActions, /revalidatePath\("\/login"\)/);
  assert.match(accountSignOut, /useTransition/);
  assert.match(accountSignOut, /await signOutClientAction\(locale\)/);
  assert.match(accountSignOut, /router\.replace\(result\.redirectTo as Parameters<typeof router\.replace>\[0\]\)/);
  assert.match(accountSignOut, /loading=\{isPending\}/);
  assert.match(accountSignOut, /message\.error\(labels\.error\)/);
  assert.doesNotMatch(
    accountSignOut,
    /form action=\{signOutAction\.bind\(null, locale\)\}/,
  );
  assert.match(
    loginPage,
    /form action=\{signOutAction\.bind\(null, locale\)\}/,
  );
  assert.match(adminSwitcher, /form action=\{signOutAction\}/);
});

test("inline help stays visible when page motion is enabled", async () => {
  const inlineHelp = await readFile("apps/web/components/inline-help.tsx", "utf8");
  const inlineHelpCss = await readFile(
    "apps/web/components/inline-help.module.css",
    "utf8",
  );
  const siteMotion = await readFile("apps/web/components/site-motion.tsx", "utf8");

  assert.match(inlineHelp, /data-motion-ignore="inline-help"/);
  assert.match(
    siteMotion,
    /element\.querySelector\("\[data-motion-ignore\], \.motion-ignore"\)/,
  );
  assert.match(inlineHelpCss, /visibility:\s*visible/);
  assert.match(inlineHelpCss, /min-width:\s*30px/);
  assert.match(inlineHelpCss, /flex:\s*0 0 16px/);
});

test("admin login keeps operators on the admin workflow", async () => {
  const adminLogin = await readFile(
    "apps/web/app/admin-login/page.tsx",
    "utf8",
  );
  const authActions = await readFile("apps/web/lib/auth-actions.ts", "utf8");
  const loginPage = await readFile("apps/web/app/login/page.tsx", "utf8");
  const oauthPanel = await readFile(
    "apps/web/components/auth-provider-panel.tsx",
    "utf8",
  );
  const roleLanding = await readFile("apps/web/lib/role-landing.ts", "utf8");
  const roleLandingPage = await readFile(
    "apps/web/app/role-landing/page.tsx",
    "utf8",
  );
  const recoveryForm = await readFile(
    "apps/web/components/session-login-form.tsx",
    "utf8",
  );
  const passwordForm = await readFile(
    "apps/web/components/workspace-signup-form.tsx",
    "utf8",
  );

  assert.match(
    adminLogin,
    /returnTo:\s*locale === "zh" \? "\/admin\?lang=zh" : "\/admin\?lang=en"/,
  );
  assert.match(adminLogin, /redirect\(`\/login\?\$\{params\.toString\(\)\}`\)/);

  assert.match(
    loginPage,
    /const returnTo = getSafeReturnTo\(params\.returnTo, locale\)/,
  );
  assert.match(loginPage, /import \{ redirect \} from "next\/navigation"/);
  assert.match(
    loginPage,
    /import \{ roleCanOpenRequestedPath, roleLandingPath \} from "@\/lib\/role-landing"/,
  );
  assert.match(loginPage, /if \(session\.subject\) \{/);
  assert.match(
    loginPage,
    /const landingPath = resolveSignedInLandingPath\(\s*session\.subject,\s*returnTo,\s*locale,\s*\)/,
  );
  assert.match(
    loginPage,
    /redirect\(landingPath as Parameters<typeof redirect>\[0\]\)/,
  );
  assert.match(loginPage, /<AuthProviderPanel[\s\S]*returnTo=\{returnTo\}/);
  assert.match(
    loginPage,
    /<WorkspaceSignupForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/,
  );
  assert.match(
    loginPage,
    /<SessionLoginForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/,
  );
  assert.match(loginPage, /return localizedHref\("\/role-landing", locale\)/);
  assert.match(loginPage, /!isLoginRoute\(candidate\)/);
  assert.match(loginPage, /return roleLandingPath\(subject, locale\)/);

  assert.match(oauthPanel, /url\.searchParams\.set\("returnTo", returnTo \?\?/);
  assert.match(oauthPanel, /"\/role-landing\?lang=zh"/);
  assert.match(
    passwordForm,
    /<input[\s\S]*name="returnTo"[\s\S]*type="hidden"/,
  );
  assert.match(passwordForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(passwordForm, /if \(state\.status === "success"\) \{/);
  assert.doesNotMatch(
    passwordForm,
    /state\.status === "success" && state\.subject/,
  );
  assert.match(
    passwordForm,
    /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/,
  );
  assert.match(
    recoveryForm,
    /<input[\s\S]*name="returnTo"[\s\S]*type="hidden"/,
  );
  assert.match(recoveryForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(
    recoveryForm,
    /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/,
  );

  assert.match(
    authActions,
    /const requestedReturnTo = normalizeReturnTo\(formData\.get\("returnTo"\)\)/,
  );
  assert.match(
    authActions,
    /import \{ roleCanOpenRequestedPath, roleLandingPath \} from "@\/lib\/role-landing"/,
  );
  assert.match(
    authActions,
    /redirectTo: resolveAuthRedirect\(subject, requestedReturnTo, locale\)/,
  );
  assert.match(authActions, /function resolveAuthRedirect\(/);
  assert.match(
    authActions,
    /roleCanOpenRequestedPath\(subject, requestedReturnTo\)/,
  );
  assert.match(
    authActions,
    /const remember = formData\.get\("remember"\) === "on"/,
  );
  assert.match(
    authActions,
    /setSessionCookie\(token, \{ persistent: remember \}\)/,
  );
  assert.match(authActions, /!candidate\.startsWith\("\/"\)/);
  assert.match(authActions, /candidate\.startsWith\("\/\/"\)/);
  assert.match(authActions, /candidate\.includes\(":\/\/"\)/);

  assert.match(
    roleLandingPage,
    /redirect\(roleLandingPath\(session\.subject, locale\) as Parameters<typeof redirect>\[0\]\)/,
  );
  assert.match(
    roleLanding,
    /const adminRoles = new Set\(\["admin", "finance", "reviewer", "support", "super_admin"\]\)/,
  );
  assert.match(roleLanding, /export function roleCanOpenRequestedPath\(/);
  assert.match(roleLanding, /isRoute\(pathname, "\/admin"\)/);
  assert.match(roleLanding, /isRoute\(pathname, "\/publisher"\)/);
  assert.match(roleLanding, /isRoute\(pathname, "\/developer"\)/);
  assert.match(roleLanding, /return `\/admin\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/publisher\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/developer\$\{suffix\}`/);
  assert.doesNotMatch(roleLanding, /return `\/dashboard\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/account\$\{suffix\}`/);
});

test("login page uses state-aware workspace layout with gated OAuth providers", async () => {
  const loginPage = await readFile("apps/web/app/login/page.tsx", "utf8");
  const oauthPanel = await readFile(
    "apps/web/components/auth-provider-panel.tsx",
    "utf8",
  );
  const globals = await readFile("apps/web/app/login/login.module.css", "utf8");
  const globalCss = await readFile("apps/web/app/globals.css", "utf8");

  assert.match(
    loginPage,
    /<AppShell active="login" locale=\{locale\} flushTop>/,
  );
  assert.match(
    loginPage,
    /className=\{`login-page-shell login-page-shell--\$\{locale\} \$\{styles\.pageStyles\}`\}/,
  );
  assert.match(loginPage, /className="login-stage"/);
  assert.match(loginPage, /LoginWorkspaceHero/);
  assert.match(loginPage, /LoginAuthCard/);
  assert.match(loginPage, /LoginPreviewNotice/);
  assert.match(loginPage, /LoginTechBackdrop/);
  assert.match(loginPage, /LoginSessionCard/);
  assert.match(loginPage, /login-workspace-hero-v2/);
  assert.match(loginPage, /login-metric-strip-v2/);
  assert.match(loginPage, /className="login-signed-in-stack"/);
  assert.doesNotMatch(loginPage, /<LoginEmailCard[^\n]*isSignedIn/);
  assert.doesNotMatch(loginPage, /<p>\{labels\.recoveryBody\}<\/p>/);
  assert.match(loginPage, /\u767b\u5f55\u8d26\u53f7/);
  assert.match(loginPage, /Sign in to your/);
  assert.match(loginPage, /surface="embedded"/);
  assert.match(
    loginPage,
    /<WorkspaceSignupForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/,
  );

  assert.match(oauthPanel, /visibleProviders/);
  assert.match(oauthPanel, /GitHub/);
  assert.match(oauthPanel, /Google/);
  assert.doesNotMatch(oauthPanel, /Microsoft/);
  assert.doesNotMatch(oauthPanel, /Slack/);
  assert.doesNotMatch(oauthPanel, /Apple/);
  assert.doesNotMatch(oauthPanel, /Discord/);
  assert.match(oauthPanel, /disabled/);
  assert.match(oauthPanel, /BrandProviderIcon/);
  assert.match(oauthPanel, /oauth-provider-button__label/);
  assert.match(oauthPanel, /oauth-provider-button__lock/);
  assert.match(oauthPanel, /oauth-provider-button--disabled/);
  assert.match(oauthPanel, /<button[\s\S]*disabled[\s\S]*type="button"/);
  assert.match(oauthPanel, /<a[\s\S]*href=\{action\.href\}/);
  assert.doesNotMatch(
    oauthPanel,
    /\{provider\.label\} \{labels\.disabledAction\}/,
  );

  assert.match(globals, /\.login-page-shell/);
  assert.match(globals, /\.login-stage/);
  assert.match(globals, /\.login-preview-notice/);
  assert.match(globals, /\.login-auth-card/);
  assert.match(globals, /\.login-value-grid/);
  assert.match(globals, /\.login-tech-backdrop/);
  assert.match(globals, /\.login-workspace-hero-v2/);
  assert.match(globals, /\.login-metric-strip-v2/);
  assert.match(globals, /\.login-session-grid/);
  assert.match(globals, /\.login-signed-in-stack/);
  assert.match(globals, /\.login-session-text-v2/);
  assert.match(globalCss, /\.brand-google-mark/);
  assert.match(globalCss, /\.brand-microsoft-mark/);
  assert.match(globalCss, /\.brand-slack-mark/);
  assert.match(globalCss, /\.brand-apple-mark/);
  assert.match(globalCss, /\.brand-discord-mark/);
  assert.match(globals, /@keyframes login-scan-pass/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /\.login-recovery-v2/);
  assert.match(globals, /@media \(max-width: 760px\)/);
});

test("admin workspace opens as an operations console", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const adminPanelSwitcher = await readFile(
    "apps/web/app/admin/admin-panel-switcher.tsx",
    "utf8",
  );
  const globals = await readFile("apps/web/app/admin/admin.module.css", "utf8");

  assert.match(adminPage, /AdminPanelSwitcher/);
  assert.match(adminPage, /className=\{styles\.pageStyles\}/);
  assert.match(adminPage, /signOutAction/);
  assert.match(
    adminPanelSwitcher,
    /className=\{`operator-console \$\{className\}`\}/,
  );
  assert.match(adminPanelSwitcher, /className="operator-sidebar"/);
  assert.match(adminPanelSwitcher, /className="operator-nav"/);
  assert.match(adminPanelSwitcher, /role="tablist"/);
  assert.match(adminPanelSwitcher, /role=\{panelId \? "tab" : undefined\}/);
  assert.match(adminPanelSwitcher, /role="tabpanel"/);
  assert.match(adminPanelSwitcher, /className="operator-nav__group"/);
  assert.match(adminPanelSwitcher, /className="operator-topbar"/);
  assert.match(adminPanelSwitcher, /className="operator-topbar__actions"/);
  assert.match(adminPanelSwitcher, /className="operator-admin-live"/);
  assert.match(adminPanelSwitcher, /className="operator-admin-live__head"/);
  assert.match(adminPanelSwitcher, /className="operator-panel-workbench"/);
  assert.match(adminPanelSwitcher, /className="operator-module-panel"/);
  assert.match(
    adminPanelSwitcher,
    /onClickCapture=\{handleSwitchableLinkClick\}/,
  );
  assert.match(adminPanelSwitcher, /window\.history\.pushState/);
  assert.match(adminPanelSwitcher, /window\.addEventListener\("hashchange"/);
  assert.match(adminPage, /id: "operator-overview"/);
  assert.match(adminPage, /id: "launch-readiness"/);
  assert.match(adminPage, /id: "admin-reviews"/);
  assert.match(adminPage, /id: "admin-curation"/);
  assert.match(adminPage, /id: "admin-ledger"/);
  assert.match(adminPage, /id: "admin-commissions"/);
  assert.match(adminPage, /id: "admin-notifications"/);
  assert.match(adminPage, /id: "admin-webhooks"/);
  assert.match(adminPage, /id: "admin-audit"/);
  assert.doesNotMatch(adminPage, /OperatingEvidenceChain/);

  assert.match(globals, /\.operator-console/);
  assert.match(globals, /\.operator-sidebar/);
  assert.match(globals, /\.operator-nav/);
  assert.match(globals, /\.operator-nav__group/);
  assert.match(globals, /\.operator-nav__item/);
  assert.match(globals, /\.operator-topbar/);
  assert.match(globals, /\.operator-topbar__actions/);
  assert.match(globals, /\.operator-admin-live/);
  assert.match(globals, /\.operator-admin-live__head/);
  assert.match(globals, /\.operator-panel-workbench/);
  assert.match(globals, /\.operator-module-panel/);
  assert.match(globals, /\.operator-panel-workbench \.admin-commission-form/);
  assert.match(
    globals,
    /\.operator-panel-workbench \.notification-delivery-actions/,
  );
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /@media \(max-width: 1180px\)/);
  assert.match(globals, /@media \(max-width: 760px\)/);
});
