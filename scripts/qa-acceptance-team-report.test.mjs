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
  assert.match(developerPage, /lockedTitle:\s*"登录后进入开发者工作台。"/);
  assert.match(developerPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(developerPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(publisherCopy, /lockedTitle:\s*"Enter the publisher workspace after sign-in\."/);
  assert.match(publisherCopy, /lockedTitle:\s*"登录后进入发布者工作台。"/);
  assert.match(publisherPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(publisherPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(i18n, /lockedTitle:\s*"Enter the platform admin after sign-in\."/);
  assert.match(i18n, /lockedTitle:\s*"登录后进入平台管理后台。"/);
  assert.match(adminPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(adminPage, /<p>\{labels\.lockedDescription\}<\/p>/);
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
  assert.match(loginPage, /<AuthProviderPanel[\s\S]*returnTo=\{returnTo\}/);
  assert.match(loginPage, /<WorkspaceSignupForm locale=\{locale\} returnTo=\{returnTo\}/);
  assert.match(loginPage, /<SessionLoginForm locale=\{locale\} returnTo=\{returnTo\}/);
  assert.match(loginPage, /return localizedHref\("\/role-landing", locale\)/);

  assert.match(oauthPanel, /url\.searchParams\.set\("returnTo", returnTo \?\?/);
  assert.match(oauthPanel, /"\/role-landing\?lang=zh"/);
  assert.match(passwordForm, /<input name="returnTo" type="hidden"/);
  assert.match(passwordForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(passwordForm, /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/);
  assert.match(recoveryForm, /<input name="returnTo" type="hidden"/);
  assert.match(recoveryForm, /localizedHref\("\/role-landing", locale\)/);
  assert.match(recoveryForm, /router\.replace\(target as Parameters<typeof router\.replace>\[0\]\)/);

  assert.match(authActions, /const requestedReturnTo = normalizeReturnTo\(formData\.get\("returnTo"\)\)/);
  assert.match(authActions, /redirectTo: requestedReturnTo \?\? roleLandingPath\(subject, locale\)/);
  assert.match(authActions, /!candidate\.startsWith\("\/"\)/);
  assert.match(authActions, /candidate\.startsWith\("\/\/"\)/);
  assert.match(authActions, /candidate\.includes\(":\/\/"\)/);

  assert.match(roleLandingPage, /redirect\(roleLandingPath\(session\.subject, locale\) as Parameters<typeof redirect>\[0\]\)/);
  assert.match(roleLanding, /const adminRoles = new Set\(\["admin", "finance", "reviewer", "support", "super_admin"\]\)/);
  assert.match(roleLanding, /return `\/admin\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/publisher\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/developer\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/dashboard\$\{suffix\}`/);
  assert.match(roleLanding, /return `\/account\$\{suffix\}`/);
});

test("login page uses dense workspace layout with gated planned OAuth providers", async () => {
  const loginPage = await readFile("apps/web/app/login/page.tsx", "utf8");
  const oauthPanel = await readFile("apps/web/components/auth-provider-panel.tsx", "utf8");
  const globals = await readFile("apps/web/app/globals.css", "utf8");

  assert.match(loginPage, /className="product-shell login-product-shell"/);
  assert.match(loginPage, /className=\{[\s\S]*"login-workspace login-workspace--signed-in"/);
  assert.match(loginPage, /LoginWorkspaceHero/);
  assert.match(loginPage, /LoginSessionCard/);
  assert.match(loginPage, /登录/);
  assert.match(loginPage, /Sign in to/);
  assert.match(loginPage, /<WorkspaceSignupForm locale=\{locale\} returnTo=\{returnTo\}/);

  assert.match(oauthPanel, /plannedProviders/);
  assert.match(oauthPanel, /Microsoft/);
  assert.match(oauthPanel, /Slack/);
  assert.match(oauthPanel, /BrandProviderIcon/);
  assert.match(oauthPanel, /oauth-provider-button__label/);
  assert.match(oauthPanel, /oauth-provider-button--disabled/);
  assert.doesNotMatch(oauthPanel, /href=\{`Microsoft/);
  assert.doesNotMatch(oauthPanel, /href=\{`Slack/);
  assert.doesNotMatch(oauthPanel, /\{provider\.label\} \{labels\.disabledAction\}/);

  assert.match(globals, /\.login-workspace/);
  assert.match(globals, /--login-top-align:\s*clamp/);
  assert.match(globals, /\.login-product-shell\s*\{[\s\S]*overflow-x:\s*clip/);
  assert.match(globals, /\.login-panel-stack\s*\{[\s\S]*padding:\s*var\(--login-top-align\)/);
  assert.match(globals, /\.login-workspace-hero__scene/);
  assert.match(globals, /\.login-session-grid/);
  assert.match(globals, /\.brand-google-mark/);
  assert.match(globals, /\.brand-microsoft-mark/);
  assert.match(globals, /\.brand-slack-mark/);
  assert.match(globals, /@keyframes login-grid-drift/);
  assert.match(globals, /@keyframes login-ring-pulse/);
  assert.match(globals, /\.login-scene-dot/);
  assert.match(globals, /\.login-neural-field/);
  assert.match(globals, /\.login-neural-node/);
  assert.match(globals, /\.login-neural-link/);
  assert.match(globals, /@keyframes login-neural-node/);
  assert.match(globals, /@keyframes login-neural-packet/);
  assert.match(globals, /\.login-footer/);
  assert.match(globals, /@media \(max-width: 760px\)/);
});

test("admin workspace opens as an operations console", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const globals = await readFile("apps/web/app/globals.css", "utf8");

  assert.match(adminPage, /className="product-shell admin-console-page"/);
  assert.match(adminPage, /className="admin-console-shell"/);
  assert.match(adminPage, /className="admin-sidebar-nav"/);
  assert.match(adminPage, /id="admin-orders"/);
  assert.match(adminPage, /adminConsoleLabels\.payment\.title/);
  assert.match(adminPage, /adminConsoleLabels\.analytics\.title/);
  assert.match(adminPage, /Stripe checkout/);
  assert.match(adminPage, /Alipay/);
  assert.match(adminPage, /Search index pending/);
  assert.match(adminPage, /搜索索引待接入/);
  assert.match(adminPage, /账本 GMV/);

  assert.match(globals, /\.admin-console-shell/);
  assert.match(globals, /\.admin-sidebar-nav/);
  assert.match(globals, /\.admin-kpi-grid/);
  assert.match(globals, /\.admin-order-panel/);
  assert.match(globals, /\.admin-payment-panel/);
  assert.match(globals, /@media \(max-width: 1180px\)/);
});
