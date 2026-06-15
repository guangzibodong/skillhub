import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = "scripts/qa-acceptance-team.mjs";

test("acceptance team QA preserves actionable launch readiness details", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /function collectReadinessDetails\(/);
  assert.match(source, /details:\s*blockerDetails/);
  assert.match(source, /details:\s*attentionDetails/);
  assert.match(source, /\.\.\.\(details && details\.length > 0 \? \{ details \} : \{\}\)/);
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
  const developerPage = await readFile("apps/web/app/developer/page.tsx", "utf8");
  const i18n = await readFile("apps/web/lib/i18n.ts", "utf8");
  const publisherPage = await readFile("apps/web/app/publisher/page.tsx", "utf8");
  const publisherCopy = await readFile("apps/web/lib/publisher-page-copy.ts", "utf8");

  assert.match(developerPage, /lockedTitle:\s*"Enter the developer workspace after sign-in\."/);
  assert.match(developerPage, /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u3002"/);
  assert.match(developerPage, /<h1[^>]*>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(developerPage, /<p[^>]*>\{labels\.lockedDescription\}<\/p>/);

  assert.match(publisherCopy, /lockedTitle:\s*"Enter the publisher workspace after sign-in\."/);
  assert.match(publisherCopy, /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u3002"/);
  assert.match(publisherPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(publisherPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(i18n, /lockedTitle:\s*"Enter the platform admin after sign-in\."/);
  assert.match(i18n, /lockedTitle:\s*"\u767b\u5f55\u540e\u8fdb\u5165\u5e73\u53f0\u7ba1\u7406\u540e\u53f0\u3002"/);
  assert.match(adminPage, /function AdminAccessGate\(/);
  assert.match(adminPage, /adminAccessCopyZh/);
  assert.match(adminPage, /adminAccessCopyEn/);
  assert.match(adminPage, /<h1>\{copy\.title\}<\/h1>/);
  assert.match(adminPage, /<p>\{copy\.body\}<\/p>/);
  assert.match(adminPage, /title:\s*"Operator sign-in required"/);
  assert.match(adminPage, /title:\s*"\u9700\u8981\u5148\u767b\u5f55\u8fd0\u8425\u8d26\u53f7"/);
});

test("admin login keeps operators on the admin workflow", async () => {
  const adminLogin = await readFile("apps/web/app/admin-login/page.tsx", "utf8");
  const authActions = await readFile("apps/web/lib/auth-actions.ts", "utf8");
  const loginPage = await readFile("apps/web/app/login/page.tsx", "utf8");
  const oauthPanel = await readFile("apps/web/components/auth-provider-panel.tsx", "utf8");
  const roleLanding = await readFile("apps/web/lib/role-landing.ts", "utf8");
  const roleLandingPage = await readFile("apps/web/app/role-landing/page.tsx", "utf8");
  const recoveryForm = await readFile("apps/web/components/session-login-form.tsx", "utf8");
  const passwordForm = await readFile("apps/web/components/workspace-signup-form.tsx", "utf8");

  assert.match(adminLogin, /returnTo:\s*locale === "zh" \? "\/admin\?lang=zh" : "\/admin\?lang=en"/);
  assert.match(adminLogin, /redirect\(`\/login\?\$\{params\.toString\(\)\}`\)/);

  assert.match(loginPage, /const returnTo = getSafeReturnTo\(params\.returnTo, locale\)/);
  assert.match(loginPage, /import \{ redirect \} from "next\/navigation"/);
  assert.match(loginPage, /import \{ roleCanOpenRequestedPath, roleLandingPath \} from "@\/lib\/role-landing"/);
  assert.match(loginPage, /if \(session\.subject\) \{/);
  assert.match(loginPage, /const landingPath = resolveSignedInLandingPath\(session\.subject, returnTo, locale\)/);
  assert.match(loginPage, /redirect\(landingPath as Parameters<typeof redirect>\[0\]\)/);
  assert.match(loginPage, /<AuthProviderPanel[\s\S]*returnTo=\{returnTo\}/);
  assert.match(loginPage, /<WorkspaceSignupForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/);
  assert.match(loginPage, /<SessionLoginForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/);
  assert.match(loginPage, /return localizedHref\("\/role-landing", locale\)/);
  assert.match(loginPage, /!isLoginRoute\(candidate\)/);
  assert.match(loginPage, /return roleLandingPath\(subject, locale\)/);

  assert.match(oauthPanel, /url\.searchParams\.set\("returnTo", returnTo \?\?/);
  assert.match(oauthPanel, /"\/role-landing\?lang=zh"/);
  assert.match(passwordForm, /<input[\s\S]*name="returnTo"[\s\S]*type="hidden"/);
  assert.match(passwordForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(passwordForm, /if \(state\.status === "success"\) \{/);
  assert.doesNotMatch(passwordForm, /state\.status === "success" && state\.subject/);
  assert.match(passwordForm, /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/);
  assert.match(recoveryForm, /<input[\s\S]*name="returnTo"[\s\S]*type="hidden"/);
  assert.match(recoveryForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(recoveryForm, /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/);

  assert.match(authActions, /const requestedReturnTo = normalizeReturnTo\(formData\.get\("returnTo"\)\)/);
  assert.match(authActions, /import \{ roleCanOpenRequestedPath, roleLandingPath \} from "@\/lib\/role-landing"/);
  assert.match(authActions, /redirectTo: resolveAuthRedirect\(subject, requestedReturnTo, locale\)/);
  assert.match(authActions, /function resolveAuthRedirect\(/);
  assert.match(authActions, /roleCanOpenRequestedPath\(subject, requestedReturnTo\)/);
  assert.match(authActions, /const remember = formData\.get\("remember"\) === "on"/);
  assert.match(authActions, /setSessionCookie\(token, \{ persistent: remember \}\)/);
  assert.match(authActions, /!candidate\.startsWith\("\/"\)/);
  assert.match(authActions, /candidate\.startsWith\("\/\/"\)/);
  assert.match(authActions, /candidate\.includes\(":\/\/"\)/);

  assert.match(roleLandingPage, /redirect\(roleLandingPath\(session\.subject, locale\) as Parameters<typeof redirect>\[0\]\)/);
  assert.match(roleLanding, /const adminRoles = new Set\(\["admin", "finance", "reviewer", "support", "super_admin"\]\)/);
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
  const oauthPanel = await readFile("apps/web/components/auth-provider-panel.tsx", "utf8");
  const globals = await readFile("apps/web/app/globals.css", "utf8");

  assert.match(loginPage, /<AppShell active="login" locale=\{locale\} flushTop>/);
  assert.match(loginPage, /className=\{`login-page-shell login-page-shell--\$\{locale\}`\}/);
  assert.match(loginPage, /className="login-stage"/);
  assert.match(loginPage, /LoginWorkspaceHero/);
  assert.match(loginPage, /LoginAuthCard/);
  assert.match(loginPage, /LoginPreviewNotice/);
  assert.match(loginPage, /RuntimeFlowVisual/);
  assert.match(loginPage, /LoginSessionCard/);
  assert.match(loginPage, /login-runtime-flow-v2/);
  assert.match(loginPage, /login-runtime-flow-v2__packet/);
  assert.match(loginPage, /className="login-signed-in-stack"/);
  assert.doesNotMatch(loginPage, /<LoginEmailCard[^\n]*isSignedIn/);
  assert.doesNotMatch(loginPage, /<p>\{labels\.recoveryBody\}<\/p>/);
  assert.match(loginPage, /\u767b\u5f55\u8d26\u53f7/);
  assert.match(loginPage, /Sign in to your/);
  assert.match(loginPage, /surface="embedded"/);
  assert.match(loginPage, /<WorkspaceSignupForm[\s\S]*locale=\{locale\}[\s\S]*returnTo=\{returnTo\}/);

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
  assert.doesNotMatch(oauthPanel, /\{provider\.label\} \{labels\.disabledAction\}/);

  assert.match(globals, /\.login-page-shell/);
  assert.match(globals, /\.login-stage/);
  assert.match(globals, /\.login-preview-bar/);
  assert.match(globals, /\.login-auth-card/);
  assert.match(globals, /\.login-value-grid/);
  assert.match(globals, /\.login-runtime-flow-v2/);
  assert.match(globals, /\.login-runtime-flow-v2__packet/);
  assert.match(globals, /\.login-runtime-node-v2--gateway/);
  assert.match(globals, /\.login-session-grid/);
  assert.match(globals, /\.login-signed-in-stack/);
  assert.match(globals, /\.login-switch-account-button/);
  assert.match(globals, /\.brand-google-mark/);
  assert.match(globals, /\.brand-microsoft-mark/);
  assert.match(globals, /\.brand-slack-mark/);
  assert.match(globals, /\.brand-apple-mark/);
  assert.match(globals, /\.brand-discord-mark/);
  assert.match(globals, /@keyframes login-runtime-line-glint/);
  assert.match(globals, /@keyframes login-runtime-node-breathe/);
  assert.match(globals, /@keyframes login-runtime-packet/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /\.login-footer/);
  assert.match(globals, /@media \(max-width: 760px\)/);
});

test("admin workspace opens as an operations console", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const globals = await readFile("apps/web/app/globals.css", "utf8");

  assert.match(adminPage, /className="operator-console"/);
  assert.match(adminPage, /signOutAction/);
  assert.match(adminPage, /className="operator-sidebar"/);
  assert.match(adminPage, /className="operator-nav"/);
  assert.match(adminPage, /className="operator-nav__group"/);
  assert.match(adminPage, /className="operator-topbar"/);
  assert.match(adminPage, /className="operator-topbar__actions"/);
  assert.match(adminPage, /className="operator-admin-live"/);
  assert.match(adminPage, /className="operator-admin-live__head"/);
  assert.match(adminPage, /className=\{`admin-operations-grid operator-admin-live__grid/);
  assert.match(adminPage, /className="operator-admin-live__stack"/);
  assert.match(adminPage, /id="launch-readiness"/);
  assert.match(adminPage, /id="admin-reviews"/);
  assert.match(adminPage, /id="admin-curation"/);
  assert.match(adminPage, /id="admin-ledger"/);
  assert.match(adminPage, /id="admin-commissions"/);
  assert.match(adminPage, /id="admin-notifications"/);
  assert.match(adminPage, /id="admin-webhooks"/);
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
  assert.match(globals, /\.operator-admin-live__grid/);
  assert.match(globals, /\.operator-admin-live__grid--single/);
  assert.match(globals, /\.operator-admin-live__stack/);
  assert.match(globals, /\.operator-admin-live__stack \.admin-commission-form/);
  assert.match(globals, /\.operator-admin-live__stack \.notification-delivery-actions/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /@media \(max-width: 1180px\)/);
  assert.match(globals, /@media \(max-width: 760px\)/);
});
