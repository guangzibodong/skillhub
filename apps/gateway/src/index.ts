import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPermissionLevel, type SkillBillingModel, type SkillRuntime, type SkillSummary } from "@useskillhub/schema";
import {
  getRegistryStats,
  getSkillManifest,
  listSkillManifests,
  publishSkill,
  searchSkills
} from "./registry.js";
import {
  getPublicPublisherProfile,
  listPublicPublishers
} from "./public-publishers.js";
import { getPlatformOverview } from "./platform-overview.js";
import {
  decideReview,
  installSkill,
  listProjectInstalls,
  listProjectPolicies,
  listProjectUpdateInbox,
  listReviewQueue,
  submitSkillForReview,
  updateProjectInstallStatus,
  upsertProjectPolicy
} from "./operations.js";
import {
  createProjectApiKey,
  invokeSkill,
  listProjectMcpTools,
  listProjectApiKeys,
  revokeProjectApiKey,
  testInvokeProjectSkill
} from "./runtime.js";
import { createProjectSubscription, updateProjectSubscriptionStatus } from "./project-subscriptions.js";
import { upsertProjectUpdateAction } from "./project-updates.js";
import {
  listProjectSavedSkills,
  removeProjectSavedSkill,
  saveProjectSkill
} from "./project-saved-skills.js";
import {
  generateProjectInvoice,
  getProjectInvoice,
  invoiceToCsv,
  listProjectInvoices
} from "./project-invoices.js";
import {
  getOrganizationBillingSummary,
  updateOrganizationPaymentMethodStatus,
  upsertOrganizationBillingProfile,
  upsertOrganizationPaymentMethod
} from "./organization-billing.js";
import {
  createOrganizationWebhookEndpoint,
  listOrganizationWebhookEndpoints,
  rotateOrganizationWebhookSecret,
  updateOrganizationWebhookEndpoint
} from "./organization-webhooks.js";
import {
  listAdminWebhookDeliveries,
  processWebhookDeliveries
} from "./webhook-deliveries.js";
import { listAdminAuditLogs } from "./admin-audit-logs.js";
import { getAdminIdentityDirectory } from "./admin-identity.js";
import { getLaunchReadiness } from "./launch-readiness.js";
import {
  createOrganizationTeamMemberToken,
  listOrganizationTeamMembers,
  removeOrganizationTeamMember,
  upsertOrganizationTeamMember
} from "./organization-team.js";
import { getDeveloperProjectDetail, listDeveloperProjects } from "./developer-insights.js";
import { createDeveloperProject } from "./developer-projects.js";
import { getPublisherOverview } from "./publisher-overview.js";
import {
  createCommissionRule,
  getFinanceLedger,
  getPublisherFinanceLedger,
  listCommissionRules,
  listSkillPrices,
  processBillableUsage,
  processSubscriptionPeriods,
  releaseAvailableBalances,
  renewSubscriptionPeriods,
  setSkillPrice
} from "./billing.js";
import {
  decideNotificationDelivery,
  listAdminNotificationDeliveries,
  listAdminNotifications,
  listUserNotificationInbox,
  markAllUserNotificationsRead,
  markUserNotificationRead,
  processNotificationDeliveries
} from "./notifications.js";
import {
  listNotificationTemplates,
  upsertNotificationTemplate
} from "./notification-templates.js";
import {
  listAdminMarketplaceCuration,
  upsertMarketplaceCuration
} from "./marketplace-curation.js";
import {
  createPublisherMarketplaceCurationAppeal,
  decideMarketplaceCurationAppeal,
  listAdminMarketplaceCurationAppeals,
  listPublisherMarketplaceCurationAppeals
} from "./marketplace-curation-appeals.js";
import {
  listNotificationPreferences,
  upsertNotificationPreference
} from "./notification-preferences.js";
import {
  listPublisherSkills,
  listPublisherSkillVersions
} from "./publisher-insights.js";
import {
  decidePayout,
  getPublisherPayoutSummary,
  listAdminPayouts,
  requestPublisherPayout
} from "./payouts.js";
import {
  acceptPublisherTerms,
  completePayoutAccountOnboarding,
  createPayoutAccountOnboarding,
  getPublisherAccountSummary,
  upsertPublisherProfile
} from "./publisher.js";
import {
  createDispute,
  createRefundRequest,
  decideDispute,
  decideRefund,
  listAdminDisputes,
  listAdminRefunds,
  listProjectDisputes,
  listProjectRefunds,
  listPublisherDisputes,
  listPublisherRefunds
} from "./adjustments.js";
import {
  claimBuyerRequest,
  createBuyerRequest,
  decideBuyerRequest,
  listDeveloperBuyerRequests,
  listPublisherBuyerRequests,
  submitBuyerRequestBuild
} from "./buyer-requests.js";
import {
  createAbuseReport,
  decideAbuseReport,
  listAdminAbuseReports
} from "./trust-safety.js";
import {
  createAdminIncident,
  decideAdminIncident,
  listAdminIncidents
} from "./incidents.js";
import {
  createSkillFeedback,
  decideSkillFeedback,
  listAdminSkillFeedback,
  listPublicSkillFeedback,
  respondToSkillFeedback
} from "./skill-feedback.js";
import {
  authorize,
  completeOAuthLogin,
  createBootstrapUserToken,
  createOAuthAuthorizationUrl,
  createSignupUserToken,
  oauthErrorRedirectUrl,
  oauthSuccessRedirectUrl,
  publicSubject,
  requestEmailAccessCode,
  requireServiceAuthorization,
  sessionCookieHeader,
  verifyEmailAccessCode,
  type AuthRole,
  type OAuthProvider
} from "./auth.js";
import {
  disconnectAccountAuthIdentity,
  getAccountSummary,
  getAuthProviderStatuses,
  listAccountSessions,
  revokeAccountSession
} from "./account.js";

type Env = {
  Bindings: {
    DATABASE_URL?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;
    NODE_ENV?: string;
    RESEND_API_KEY?: string;
    SESSION_SECRET?: string;
    SKILLHUB_ADMIN_TOKEN?: string;
    SKILLHUB_API_KEY_SALT?: string;
    SKILLHUB_AUTH_BASE_URL?: string;
    SKILLHUB_AUTH_CALLBACK_BASE_URL?: string;
    SKILLHUB_AUTH_COOKIE_DOMAIN?: string;
    SKILLHUB_GITHUB_CLIENT_ID?: string;
    SKILLHUB_GITHUB_CLIENT_SECRET?: string;
    SKILLHUB_GOOGLE_CLIENT_ID?: string;
    SKILLHUB_GOOGLE_CLIENT_SECRET?: string;
    SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
    SKILLHUB_EMAIL_AUTH_SECRET?: string;
    SKILLHUB_EMAIL_FROM?: string;
    SKILLHUB_EMAIL_PROVIDER?: string;
    SKILLHUB_OAUTH_STATE_SECRET?: string;
    SKILLHUB_ENV: string;
    SKILLHUB_DISABLE_PUBLIC_SIGNUP?: string;
    SKILLHUB_ENABLE_DEMO_FALLBACK?: string;
    SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN?: string;
    SKILLHUB_WEBHOOK_MAX_ATTEMPTS?: string;
    SKILLHUB_WEBHOOK_TIMEOUT_MS?: string;
    PACKAGES?: R2Bucket;
  };
};

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const app = new Hono<Env>();
const anyAuthenticatedRole: AuthRole[] = [
  "service",
  "super_admin",
  "admin",
  "finance",
  "reviewer",
  "publisher",
  "developer",
  "owner",
  "support",
  "user"
];
const projectOperatorRoles: AuthRole[] = ["super_admin", "admin", "owner", "developer"];
const publisherOperatorRoles: AuthRole[] = ["super_admin", "admin", "owner", "publisher"];
const reviewOperatorRoles: AuthRole[] = ["super_admin", "admin", "reviewer"];
const financeOperatorRoles: AuthRole[] = ["super_admin", "admin", "finance"];
const organizationBillingRoles: AuthRole[] = ["super_admin", "admin", "owner", "finance"];
const organizationAdminRoles: AuthRole[] = ["super_admin", "admin", "owner"];
const organizationWebhookRoles: AuthRole[] = ["super_admin", "admin", "owner", "developer"];
const adminOperatorRoles: AuthRole[] = ["super_admin", "admin", "support"];
const curationOperatorRoles: AuthRole[] = ["super_admin", "admin", "reviewer"];
const trustOperatorRoles: AuthRole[] = ["super_admin", "admin", "reviewer", "support"];

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://useskillhub.com", "https://app.useskillhub.com"],
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"]
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "skillhub-gateway",
    env: c.env?.SKILLHUB_ENV ?? getProcessEnv("SKILLHUB_ENV") ?? "development"
  })
);

app.get("/v1/auth/me", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    subject: publicSubject(authorization.subject)
  });
});

app.get("/v1/auth/providers", (c) => {
  return c.json({
    providers: getAuthProviderStatuses(c.env)
  });
});

app.get("/v1/auth/oauth/:provider/start", async (c) => {
  const provider = parseOAuthProvider(c.req.param("provider"));

  if (!provider) {
    return c.json({ error: "OAuth provider must be google or github." }, 400);
  }

  try {
    return c.redirect(await createOAuthAuthorizationUrl(provider, c.env, c.req.query("returnTo")));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "OAuth provider is not configured." }, 400);
  }
});

app.get("/v1/auth/oauth/:provider/callback", async (c) => {
  const provider = parseOAuthProvider(c.req.param("provider"));

  if (!provider) {
    return c.redirect(oauthErrorRedirectUrl("OAuth provider must be google or github.", c.env));
  }

  const providerError = c.req.query("error");

  if (providerError) {
    return c.redirect(oauthErrorRedirectUrl(providerError, c.env));
  }

  try {
    const login = await completeOAuthLogin(
      provider,
      {
        code: c.req.query("code"),
        state: c.req.query("state")
      },
      c.env
    );
    const response = c.redirect(oauthSuccessRedirectUrl(login.returnTo, c.env));
    response.headers.append("Set-Cookie", sessionCookieHeader(login.accessToken.token, c.env));
    return response;
  } catch (error) {
    return c.redirect(oauthErrorRedirectUrl(error instanceof Error ? error.message : "OAuth login failed.", c.env));
  }
});

app.get("/v1/account", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Account center requires a user-scoped token." }, 403);
  }

  try {
    return c.json({
      account: await getAccountSummary(authorization.subject, c.env)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to read account summary." }, 400);
  }
});

app.get("/v1/account/sessions", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Account sessions require a user-scoped token." }, 403);
  }

  try {
    return c.json({
      sessions: await listAccountSessions(authorization.subject)
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to read account sessions." },
      accountSecurityErrorStatus(error)
    );
  }
});

app.post("/v1/account/sessions/:tokenId/revoke", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Account sessions require a user-scoped token." }, 403);
  }

  try {
    return c.json({
      session: await revokeAccountSession(authorization.subject, c.req.param("tokenId"))
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to revoke account session." },
      accountSecurityErrorStatus(error)
    );
  }
});

app.post("/v1/account/identities/:provider/disconnect", async (c) => {
  const provider = parseOAuthProvider(c.req.param("provider"));

  if (!provider) {
    return c.json({ error: "Connected login provider must be google or github." }, 400);
  }

  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Account identity disconnect requires a user-scoped token." }, 403);
  }

  try {
    return c.json({
      identity: await disconnectAccountAuthIdentity(authorization.subject, provider)
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to disconnect login identity." },
      accountSecurityErrorStatus(error)
    );
  }
});

app.post("/v1/auth/bootstrap-token", async (c) => {
  const authorization = await requireServiceAuthorization(c.req.header("Authorization"));

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        bootstrap: await createBootstrapUserToken((await c.req.json()) as Record<string, unknown>)
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create bootstrap user token." }, 400);
  }
});

app.post("/v1/auth/email/request-code", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  if (isPublicSignupDisabled(c.env) && body.mode !== "login") {
    return c.json({ error: "Public email access is disabled for this deployment." }, 403);
  }

  try {
    return c.json(
      {
        challenge: await requestEmailAccessCode(body, c.env)
      },
      201
    );
  } catch (error) {
    return c.json({ error: emailAccessErrorMessage(error) }, emailAccessErrorStatus(error));
  }
});

app.post("/v1/auth/email/verify-code", async (c) => {
  try {
    return c.json({
      login: await verifyEmailAccessCode((await c.req.json().catch(() => ({}))) as Record<string, unknown>, c.env)
    });
  } catch (error) {
    return c.json({ error: emailAccessErrorMessage(error) }, emailAccessErrorStatus(error));
  }
});

app.post("/v1/auth/signup", async (c) => {
  if (isPublicSignupDisabled(c.env)) {
    return c.json({ error: "Public signup is disabled for this deployment." }, 403);
  }

  if (!isLegacySignupTokenEnabled(c.env)) {
    return c.json({ error: "Legacy signup token creation is disabled. Use /v1/auth/email/request-code." }, 410);
  }

  try {
    return c.json(
      {
        signup: await createSignupUserToken((await c.req.json().catch(() => ({}))) as Record<string, unknown>)
      },
      201
    );
  } catch (error) {
    return c.json({ error: signupErrorMessage(error) }, 400);
  }
});

app.get("/v1/organization/team", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationAdminRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      members: await listOrganizationTeamMembers(authorization.subject.organizationId)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to read organization team." }, 400);
  }
});

app.post("/v1/organization/team/members", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationAdminRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        member: await upsertOrganizationTeamMember(
          authorization.subject.organizationId,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          authorization.subject.userId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save organization member." }, 400);
  }
});

app.post("/v1/organization/team/members/:userId/remove", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationAdminRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      await removeOrganizationTeamMember(
        authorization.subject.organizationId,
        c.req.param("userId"),
        authorization.subject.userId
      )
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to remove organization member." }, 400);
  }
});

app.post("/v1/organization/team/members/:userId/tokens", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationAdminRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      await createOrganizationTeamMemberToken(
        authorization.subject.organizationId,
        c.req.param("userId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      ),
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create organization member token." }, 400);
  }
});

app.get("/v1/organization/webhooks", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationWebhookRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      endpoints: await listOrganizationWebhookEndpoints(authorization.subject.organizationId)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to read organization webhooks." }, 400);
  }
});

app.post("/v1/organization/webhooks", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationWebhookRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      await createOrganizationWebhookEndpoint(
        authorization.subject.organizationId,
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      ),
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create organization webhook." }, 400);
  }
});

app.put("/v1/organization/webhooks/:endpointId", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationWebhookRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      endpoint: await updateOrganizationWebhookEndpoint(
        authorization.subject.organizationId,
        c.req.param("endpointId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update organization webhook." }, 400);
  }
});

app.post("/v1/organization/webhooks/:endpointId/rotate-secret", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationWebhookRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(await rotateOrganizationWebhookSecret(authorization.subject.organizationId, c.req.param("endpointId"), authorization.subject.userId));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to rotate organization webhook secret." }, 400);
  }
});

app.get("/v1/organization/billing", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationBillingRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      billing: await getOrganizationBillingSummary(authorization.subject.organizationId)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to read organization billing." }, 400);
  }
});

app.put("/v1/organization/billing/profile", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationBillingRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      billingProfile: await upsertOrganizationBillingProfile(
        authorization.subject.organizationId,
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update organization billing profile." }, 400);
  }
});

app.post("/v1/organization/billing/payment-methods", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationBillingRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        paymentMethod: await upsertOrganizationPaymentMethod(
          authorization.subject.organizationId,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to add organization payment method." }, 400);
  }
});

app.put("/v1/organization/billing/payment-methods/:paymentMethodId", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), organizationBillingRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      paymentMethod: await updateOrganizationPaymentMethodStatus(
        authorization.subject.organizationId,
        c.req.param("paymentMethodId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update organization payment method." }, 400);
  }
});

app.get("/v1/skills/search", async (c) => {
  const query = c.req.query("q")?.toLowerCase() ?? "";
  const tags = c.req.query("tags")?.split(",").filter(Boolean) ?? [];
  const limit = Number(c.req.query("limit") ?? "20");
  const permissionLevel = parsePermissionLevel(c.req.query("permissionLevel"));
  const runtimeType = parseRuntimeType(c.req.query("runtimeType") ?? c.req.query("runtime"));
  const billingModel = parseBillingModel(c.req.query("billingModel") ?? c.req.query("pricing"));
  const verificationStatus = parseVerificationStatus(c.req.query("verificationStatus") ?? c.req.query("verification"));
  const sort = parseSearchSort(c.req.query("sort"));

  try {
    const skills = await searchSkills({ billingModel, query, tags, limit, permissionLevel, runtimeType, sort, verificationStatus });

    return c.json({ skills });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to search skills." }, 500);
  }
});

app.get("/v1/publishers", async (c) => {
  return c.json({ publishers: await listPublicPublishers(Number(c.req.query("limit") ?? "20")) });
});

app.get("/v1/publishers/:slug", async (c) => {
  const publisher = await getPublicPublisherProfile(c.req.param("slug"));

  if (!publisher) {
    return c.json({ error: "Publisher not found." }, 404);
  }

  return c.json({ publisher });
});

app.get("/v1/stats", async (c) => c.json(await getRegistryStats()));

app.get("/v1/platform/overview", async (c) => c.json(await getPlatformOverview()));

app.get("/v1/developer/overview", async (c) => {
  const overview = await getPlatformOverview();
  return c.json(overview.developer);
});

app.get("/v1/developer/projects", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    projects: await listDeveloperProjects(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/developer/projects", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.organizationId) {
    return c.json({ error: "Project creation requires an organization-scoped user token." }, 403);
  }

  try {
    return c.json(
      {
        project: await createDeveloperProject((await c.req.json().catch(() => ({}))) as Record<string, unknown>, {
          actorUserId: authorization.subject.userId,
          organizationId: authorization.subject.organizationId
        })
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create project." }, 400);
  }
});

app.get("/v1/developer/projects/:projectSlug", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const project = await getDeveloperProjectDetail(c.req.param("projectSlug"), authorization.subject.organizationId);

  if (!project) {
    return c.json({ error: "Project not found." }, 404);
  }

  return c.json({ project });
});

app.get("/v1/developer/buyer-requests", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    requests: await listDeveloperBuyerRequests(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/developer/buyer-requests", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        request: await createBuyerRequest(
          authorization.subject.organizationId,
          (await c.req.json()) as Record<string, unknown>
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create buyer request." }, 400);
  }
});

app.post("/v1/developer/buyer-requests/:requestId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      request: await decideBuyerRequest(
        authorization.subject.organizationId,
        c.req.param("requestId"),
        (await c.req.json()) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update buyer request." }, 400);
  }
});

app.get("/v1/publisher/overview", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.organizationId) {
    return c.json({ error: "Publisher overview requires an organization-scoped user token." }, 403);
  }

  return c.json(await getPublisherOverview(authorization.subject.organizationId));
});

app.get("/v1/admin/overview", async (c) => {
  const overview = await getPlatformOverview();
  return c.json(overview.admin);
});

app.get("/v1/projects/:projectSlug/installed-skills", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    installedSkills: await listProjectInstalls(c.req.param("projectSlug"), authorization.subject.organizationId)
  });
});

app.post("/v1/projects/:projectSlug/installed-skills", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json()) as { skillSlug?: string; version?: string };

  if (!body.skillSlug) {
    return c.json({ error: "Missing skillSlug." }, 400);
  }

  try {
    const install = await installSkill({
      organizationId: authorization.subject.organizationId,
      projectSlug,
      skillSlug: body.skillSlug,
      version: body.version
    });

    return c.json({ install }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to install skill." }, 400);
  }
});

app.put("/v1/projects/:projectSlug/installed-skills/:skillSlug/status", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as {
    reason?: unknown;
    status?: "installed" | "suspended" | "removed";
  };

  if (!body.status) {
    return c.json({ error: "Missing install status." }, 400);
  }

  try {
    return c.json({
      install: await updateProjectInstallStatus(
        c.req.param("projectSlug"),
        c.req.param("skillSlug"),
        body.status,
        authorization.subject.organizationId,
        body.reason,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update install status." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/policies", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    policies: await listProjectPolicies(c.req.param("projectSlug"), authorization.subject.organizationId)
  });
});

app.put("/v1/projects/:projectSlug/policies/:skillSlug", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    const policy = await upsertProjectPolicy(
      projectSlug,
      c.req.param("skillSlug"),
      (await c.req.json()) as Record<string, unknown>,
      authorization.subject.organizationId
    );

    return c.json({ policy });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update policy." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/update-inbox", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    updates: await listProjectUpdateInbox(c.req.param("projectSlug"), authorization.subject.organizationId)
  });
});

app.put("/v1/projects/:projectSlug/update-inbox/:updateId/action", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      action: await upsertProjectUpdateAction(
        projectSlug,
        c.req.param("updateId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.organizationId,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update project update action." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/saved-skills", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    savedSkills: await listProjectSavedSkills(c.req.param("projectSlug"), authorization.subject.organizationId)
  });
});

app.post("/v1/projects/:projectSlug/saved-skills", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        savedSkill: await saveProjectSkill(
          c.req.param("projectSlug"),
          authorization.subject.organizationId,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save project skill." }, 400);
  }
});

app.post("/v1/projects/:projectSlug/saved-skills/:savedSkillId/remove", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      savedSkill: await removeProjectSavedSkill(
        c.req.param("projectSlug"),
        authorization.subject.organizationId,
        c.req.param("savedSkillId")
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to remove project saved skill." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/refunds", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    refunds: await listProjectRefunds(projectSlug, authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.get("/v1/projects/:projectSlug/disputes", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    disputes: await listProjectDisputes(projectSlug, authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.get("/v1/projects/:projectSlug/invoices", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    invoices: await listProjectInvoices(projectSlug, authorization.subject.organizationId, Number(c.req.query("limit") ?? "20"))
  });
});

app.post("/v1/projects/:projectSlug/invoices/generate", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        invoice: await generateProjectInvoice(
          projectSlug,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          authorization.subject.organizationId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to generate project invoice." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/invoices/:invoiceId", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const invoice = await getProjectInvoice(projectSlug, c.req.param("invoiceId"), authorization.subject.organizationId);

  if (!invoice) {
    return c.json({ error: "Invoice not found." }, 404);
  }

  return c.json({ invoice });
});

app.get("/v1/projects/:projectSlug/invoices/:invoiceId/download", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const invoice = await getProjectInvoice(projectSlug, c.req.param("invoiceId"), authorization.subject.organizationId);

  if (!invoice) {
    return c.json({ error: "Invoice not found." }, 404);
  }

  return new Response(invoiceToCsv(invoice), {
    headers: {
      "Content-Disposition": `attachment; filename="${invoice.invoice.invoiceNumber}.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    },
    status: 200
  });
});

app.put("/v1/projects/:projectSlug/subscriptions/:subscriptionId/status", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { reason?: unknown; status?: string };

  if (!body.status) {
    return c.json({ error: "Missing subscription status." }, 400);
  }

  try {
    return c.json({
      subscription: await updateProjectSubscriptionStatus(
        projectSlug,
        c.req.param("subscriptionId"),
        body.status,
        authorization.subject.organizationId,
        body.reason,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update subscription status." }, 400);
  }
});

app.post("/v1/projects/:projectSlug/subscriptions", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        subscription: await createProjectSubscription(
          projectSlug,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          authorization.subject.organizationId,
          authorization.subject.userId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create project subscription." }, 400);
  }
});

app.get("/v1/projects/:projectSlug/api-keys", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    apiKeys: await listProjectApiKeys(projectSlug, authorization.subject.organizationId)
  });
});

app.post("/v1/projects/:projectSlug/api-keys", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { name?: string };

  try {
    return c.json(
      {
        apiKey: await createProjectApiKey(projectSlug, body.name, authorization.subject.organizationId)
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create API key." }, 400);
  }
});

app.post("/v1/projects/:projectSlug/api-keys/:keyId/revoke", async (c) => {
  const projectSlug = c.req.param("projectSlug");
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { reason?: unknown };

  try {
    return c.json({
      apiKey: await revokeProjectApiKey(
        projectSlug,
        c.req.param("keyId"),
        authorization.subject.organizationId,
        body.reason,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to revoke API key." }, 400);
  }
});

app.post("/v1/projects/:projectSlug/runtime/test", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), projectOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    const result = await testInvokeProjectSkill(
      c.req.param("projectSlug"),
      authorization.subject.organizationId,
      (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    );
    return c.json(result.body, result.status as 200 | 400 | 403 | 404 | 502);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to test skill invocation." }, 503);
  }
});

app.post("/v1/runtime/invoke", async (c) => {
  try {
    const result = await invokeSkill(
      c.req.header("Authorization"),
      (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    );
    return c.json(result.body, result.status as 200 | 400 | 401 | 403 | 502);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to invoke skill." }, 503);
  }
});

app.get("/v1/skills/:slug/prices", async (c) => {
  return c.json({
    prices: await listSkillPrices(c.req.param("slug"))
  });
});

app.post("/v1/skills/:slug/prices", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        price: await setSkillPrice(
          c.req.param("slug"),
          (await c.req.json()) as Record<string, unknown>,
          authorization.subject.organizationId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to set skill price." }, 400);
  }
});

app.get("/v1/admin/finance/ledger", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json(await getFinanceLedger());
});

app.get("/v1/admin/finance/commission-rules", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    rules: await listCommissionRules(Number(c.req.query("limit") ?? "30"))
  });
});

app.post("/v1/admin/finance/commission-rules", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        rule: await createCommissionRule((await c.req.json()) as Record<string, unknown>, authorization.subject.userId)
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create commission rule." }, 400);
  }
});

app.post("/v1/admin/finance/process-usage", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { limit?: number };

  try {
    return c.json(await processBillableUsage(body.limit));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to process billable usage." }, 400);
  }
});

app.post("/v1/admin/finance/process-subscriptions", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { limit?: number };

  try {
    return c.json(await processSubscriptionPeriods(body.limit));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to process subscription periods." }, 400);
  }
});

app.post("/v1/admin/finance/renew-subscriptions", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { limit?: number };

  try {
    return c.json(await renewSubscriptionPeriods(body.limit, authorization.subject.userId));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to renew subscription periods." }, 400);
  }
});

app.post("/v1/admin/finance/release-balances", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { limit?: number };

  try {
    return c.json(await releaseAvailableBalances(body.limit));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to release balances." }, 400);
  }
});

app.get("/v1/admin/finance/refunds", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    refunds: await listAdminRefunds(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/finance/refunds", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({ refund: await createRefundRequest((await c.req.json()) as Record<string, unknown>) }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to request refund." }, 400);
  }
});

app.post("/v1/admin/finance/refunds/:refundId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      refund: await decideRefund(c.req.param("refundId"), (await c.req.json()) as Record<string, unknown>)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update refund." }, 400);
  }
});

app.get("/v1/admin/finance/disputes", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    disputes: await listAdminDisputes(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/finance/disputes", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({ dispute: await createDispute((await c.req.json()) as Record<string, unknown>) }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to open dispute." }, 400);
  }
});

app.post("/v1/admin/finance/disputes/:disputeId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      dispute: await decideDispute(c.req.param("disputeId"), (await c.req.json()) as Record<string, unknown>)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update dispute." }, 400);
  }
});

app.get("/v1/admin/launch-readiness", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      readiness: await getLaunchReadiness(c.env)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to read launch readiness." }, 400);
  }
});

app.get("/v1/admin/notifications", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const limit = Number(c.req.query("limit") ?? "25");

  return c.json({
    notifications: await listAdminNotifications(limit)
  });
});

app.get("/v1/admin/notification-deliveries", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      deliveries: await listAdminNotificationDeliveries(Number(c.req.query("limit") ?? "25"), {
        channel: c.req.query("channel"),
        status: c.req.query("status")
      })
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to list notification deliveries." },
      500
    );
  }
});

app.post("/v1/admin/notification-deliveries/:notificationId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      delivery: await decideNotificationDelivery(
        c.req.param("notificationId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update notification delivery." }, 400);
  }
});

app.post("/v1/admin/notification-deliveries/process", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      await processNotificationDeliveries(
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        c.env,
        authorization.subject.userId
      )
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to process notification deliveries." }, 400);
  }
});

app.get("/v1/admin/webhook-deliveries", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      deliveries: await listAdminWebhookDeliveries(Number(c.req.query("limit") ?? "25"), {
        status: c.req.query("status")
      })
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to list webhook deliveries." },
      500
    );
  }
});

app.post("/v1/admin/webhook-deliveries/process", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      await processWebhookDeliveries(
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        c.env,
        authorization.subject.userId
      )
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to process webhook deliveries." }, 400);
  }
});

app.get("/v1/admin/audit-logs", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    auditLogs: await listAdminAuditLogs(Number(c.req.query("limit") ?? "30"))
  });
});

app.get("/v1/admin/marketplace-curation", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      curation: await listAdminMarketplaceCuration(Number(c.req.query("limit") ?? "30"))
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to list marketplace curation." },
      500
    );
  }
});

app.get("/v1/admin/marketplace-curation/appeals", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      appeals: await listAdminMarketplaceCurationAppeals(Number(c.req.query("limit") ?? "30"), c.req.query("status"))
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to list marketplace curation appeals." },
      500
    );
  }
});

app.post("/v1/admin/marketplace-curation/appeals/:appealId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), curationOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      appeal: await decideMarketplaceCurationAppeal(
        c.req.param("appealId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update marketplace curation appeal." }, 400);
  }
});

app.put("/v1/admin/marketplace-curation/:skillSlug", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), curationOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      curation: await upsertMarketplaceCuration(
        c.req.param("skillSlug"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update marketplace curation." }, 400);
  }
});

app.get("/v1/admin/identity", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    identity: await getAdminIdentityDirectory(Number(c.req.query("limit") ?? "12"))
  });
});

app.get("/v1/admin/notification-templates", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    templates: await listNotificationTemplates(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/notification-templates", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), adminOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        template: await upsertNotificationTemplate(
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          authorization.subject.userId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save notification template." }, 400);
  }
});

app.get("/v1/notifications", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId || !authorization.subject.organizationId) {
    return c.json({ error: "Notification inbox requires an organization-scoped user token." }, 403);
  }

  return c.json(
    await listUserNotificationInbox(
      authorization.subject.userId,
      authorization.subject.organizationId,
      Number(c.req.query("limit") ?? "25")
    )
  );
});

app.post("/v1/notifications/read-all", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId || !authorization.subject.organizationId) {
    return c.json({ error: "Notification inbox requires an organization-scoped user token." }, 403);
  }

  try {
    return c.json(
      await markAllUserNotificationsRead(
        authorization.subject.userId,
        authorization.subject.organizationId
      )
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to mark notifications read." }, 400);
  }
});

app.post("/v1/notifications/:notificationId/read", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId || !authorization.subject.organizationId) {
    return c.json({ error: "Notification inbox requires an organization-scoped user token." }, 403);
  }

  try {
    return c.json({
      notification: await markUserNotificationRead(
        authorization.subject.userId,
        authorization.subject.organizationId,
        c.req.param("notificationId")
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to mark notification read." }, 400);
  }
});

app.get("/v1/admin/abuse-reports", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    reports: await listAdminAbuseReports(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/abuse-reports/:reportId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      report: await decideAbuseReport(
        c.req.param("reportId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update abuse report." }, 400);
  }
});

app.get("/v1/admin/incidents", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    incidents: await listAdminIncidents(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/incidents", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        incident: await createAdminIncident(
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          authorization.subject.userId
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create incident." }, 400);
  }
});

app.post("/v1/admin/incidents/:incidentId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      incident: await decideAdminIncident(
        c.req.param("incidentId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update incident." }, 400);
  }
});

app.get("/v1/admin/skill-feedback", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    feedback: await listAdminSkillFeedback(c.req.query("status"), Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/skill-feedback/:feedbackId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), trustOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      feedback: await decideSkillFeedback(
        c.req.param("feedbackId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update skill feedback." }, 400);
  }
});

app.post("/v1/publisher/skill-feedback/:feedbackId/response", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId || !authorization.subject.organizationId) {
    return c.json({ error: "Publisher feedback responses require an organization-scoped user token." }, 403);
  }

  try {
    return c.json({
      feedback: await respondToSkillFeedback(
        c.req.param("feedbackId"),
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        {
          organizationId: authorization.subject.organizationId,
          userId: authorization.subject.userId
        }
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to respond to skill feedback." }, 400);
  }
});

app.get("/v1/notifications/preferences", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Notification preferences require a user-scoped token." }, 403);
  }

  return c.json({
    preferences: await listNotificationPreferences(authorization.subject.userId)
  });
});

app.put("/v1/notifications/preferences", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Notification preferences require a user-scoped token." }, 403);
  }

  try {
    return c.json({
      preference: await upsertNotificationPreference(
        authorization.subject.userId,
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update notification preference." }, 400);
  }
});

app.get("/v1/skills/:slug/feedback", async (c) => {
  return c.json(await listPublicSkillFeedback(c.req.param("slug"), Number(c.req.query("limit") ?? "12")));
});

app.post("/v1/skills/:slug/feedback", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Skill feedback requires a user-scoped token." }, 403);
  }

  try {
    return c.json(
      {
        feedback: await createSkillFeedback((await c.req.json().catch(() => ({}))) as Record<string, unknown>, {
          organizationId: authorization.subject.organizationId,
          skillSlug: c.req.param("slug"),
          userId: authorization.subject.userId
        })
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create skill feedback." }, 400);
  }
});

app.post("/v1/skills/:slug/abuse-reports", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), anyAuthenticatedRole);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.userId) {
    return c.json({ error: "Abuse reports require a user-scoped token." }, 403);
  }

  try {
    return c.json(
      {
        report: await createAbuseReport((await c.req.json().catch(() => ({}))) as Record<string, unknown>, {
          organizationId: authorization.subject.organizationId,
          skillSlug: c.req.param("slug"),
          userId: authorization.subject.userId
        })
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create abuse report." }, 400);
  }
});

app.get("/v1/publisher/payouts", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    publisherProfileId: c.req.query("publisherProfileId") ?? undefined,
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json(
    await getPublisherPayoutSummary(c.req.query("publisherProfileId") ?? undefined, authorization.subject.organizationId)
  );
});

app.get("/v1/publisher/skills", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    skills: await listPublisherSkills(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.get("/v1/publisher/skills/:skillSlug/versions", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    versions: await listPublisherSkillVersions(
      authorization.subject.organizationId,
      c.req.param("skillSlug"),
      Number(c.req.query("limit") ?? "20")
    )
  });
});

app.post("/v1/publisher/skills/:skillSlug/versions", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { manifest?: unknown };

  if (!body.manifest) {
    return c.json({ error: "Missing manifest." }, 400);
  }

  if (!isManifestForSkill(body.manifest, c.req.param("skillSlug"))) {
    return c.json({ error: "Manifest name must match the managed skill slug." }, 400);
  }

  try {
    return c.json(
      {
        version: await publishSkill(body.manifest, authorization.subject.organizationId, {
          actorUserId: authorization.subject.userId,
          source: "publisher_version_manager"
        })
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save skill version." }, 400);
  }
});

app.post("/v1/publisher/skills/:skillSlug/versions/:version/submit", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        review: await submitSkillForReview(
          c.req.param("skillSlug"),
          authorization.subject.organizationId,
          c.req.param("version")
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to submit skill version." }, 400);
  }
});

app.get("/v1/publisher/marketplace-appeals", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    appeals: await listPublisherMarketplaceCurationAppeals(
      authorization.subject.organizationId,
      Number(c.req.query("limit") ?? "50")
    )
  });
});

app.post("/v1/publisher/skills/:skillSlug/marketplace-appeals", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  if (!authorization.subject.organizationId) {
    return c.json({ error: "Marketplace curation appeals require an organization-scoped user token." }, 403);
  }

  try {
    return c.json(
      {
        appeal: await createPublisherMarketplaceCurationAppeal(
          c.req.param("skillSlug"),
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
          {
            actorUserId: authorization.subject.userId,
            organizationId: authorization.subject.organizationId
          }
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create marketplace curation appeal." }, 400);
  }
});

app.get("/v1/publisher/refunds", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    refunds: await listPublisherRefunds(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.get("/v1/publisher/disputes", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    disputes: await listPublisherDisputes(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.get("/v1/publisher/buyer-requests", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    requests: await listPublisherBuyerRequests(authorization.subject.organizationId, Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/publisher/buyer-requests/:requestId/claim", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      request: await claimBuyerRequest(authorization.subject.organizationId, c.req.param("requestId"))
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to claim buyer request." }, 400);
  }
});

app.post("/v1/publisher/buyer-requests/:requestId/submit", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    const body = (await c.req.json().catch(() => ({}))) as {
      deliveryNote?: string;
      evidenceUrl?: string;
      skillSlug?: string;
      version?: string;
    };

    return c.json({
      request: await submitBuyerRequestBuild(authorization.subject.organizationId, c.req.param("requestId"), body)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to submit buyer request build." }, 400);
  }
});

app.get("/v1/publisher/finance/ledger", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    publisherProfileId: c.req.query("publisherProfileId") ?? undefined,
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json(
    await getPublisherFinanceLedger(authorization.subject.organizationId, c.req.query("publisherProfileId") ?? undefined)
  );
});

app.post("/v1/publisher/payouts", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { publisherProfileId?: string; currency?: string };
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    publisherProfileId: body.publisherProfileId,
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({ payout: await requestPublisherPayout({ ...body, organizationId: authorization.subject.organizationId }) }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to request payout." }, 400);
  }
});

app.get("/v1/publisher/profile", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    publisherProfileId: c.req.query("publisherProfileId") ?? undefined,
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json(
    await getPublisherAccountSummary(authorization.subject.organizationId, c.req.query("publisherProfileId") ?? undefined)
  );
});

app.put("/v1/publisher/profile", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      publisherProfile: await upsertPublisherProfile(
        authorization.subject.organizationId,
        (await c.req.json()) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update publisher profile." }, 400);
  }
});

app.post("/v1/publisher/terms/accept", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      publisherProfile: await acceptPublisherTerms(
        authorization.subject.organizationId,
        (await c.req.json().catch(() => ({}))) as Record<string, unknown>,
        authorization.subject.userId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to accept publisher terms." }, 400);
  }
});

app.post("/v1/publisher/payout-account/onboarding", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json(
      {
        onboarding: await createPayoutAccountOnboarding(
          authorization.subject.organizationId,
          (await c.req.json().catch(() => ({}))) as Record<string, unknown>
        )
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to create payout onboarding." }, 400);
  }
});

app.post("/v1/publisher/payout-account/onboarding/complete", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      publisher: await completePayoutAccountOnboarding(
        authorization.subject.organizationId,
        (await c.req.json()) as Record<string, unknown>
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to complete payout onboarding." }, 400);
  }
});

app.get("/v1/admin/payouts", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({
    payouts: await listAdminPayouts(Number(c.req.query("limit") ?? "50"))
  });
});

app.post("/v1/admin/payouts/:payoutId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), financeOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  try {
    return c.json({
      payout: await decidePayout(c.req.param("payoutId"), (await c.req.json()) as Record<string, unknown>)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update payout." }, 400);
  }
});

app.post("/v1/skills/:slug/submit", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json().catch(() => ({}))) as { version?: string };

  try {
    return c.json(
      {
        review: await submitSkillForReview(c.req.param("slug"), authorization.subject.organizationId, body.version)
      },
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to submit skill." }, 400);
  }
});

app.get("/v1/admin/reviews", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), reviewOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  return c.json({ reviews: await listReviewQueue() });
});

app.post("/v1/admin/reviews/:reviewId/decision", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), reviewOperatorRoles);

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json()) as { status?: "approved" | "rejected" | "blocked"; notes?: string };

  if (!body.status || !["approved", "rejected", "blocked"].includes(body.status)) {
    return c.json({ error: "Decision status must be approved, rejected, or blocked." }, 400);
  }

  try {
    return c.json({
      review: await decideReview(c.req.param("reviewId"), {
        status: body.status,
        notes: body.notes
      })
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to record review decision." }, 400);
  }
});

app.get("/v1/skills/:slug", async (c) => {
  const skill = await getSkillManifest(c.req.param("slug"));

  if (!skill) {
    return c.json({ error: "Skill not found." }, 404);
  }

  return c.json(skill);
});

app.post("/v1/skills", async (c) => {
  const authorization = await authorize(c.req.header("Authorization"), publisherOperatorRoles, {
    requireOrganization: true
  });

  if (!authorization.ok) {
    return c.json({ error: authorization.error }, authorization.status);
  }

  const body = (await c.req.json()) as { manifest?: unknown };

  if (!body.manifest) {
    return c.json({ error: "Missing manifest." }, 400);
  }

  try {
    return c.json(
      await publishSkill(body.manifest, authorization.subject.organizationId, {
        actorUserId: authorization.subject.userId,
        source: "manifest_publish"
      }),
      201
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to publish skill." }, 400);
  }
});

app.post("/mcp", async (c) => {
  const request = (await c.req.json()) as JsonRpcRequest;

  if (request.method === "initialize") {
    return rpc(request.id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        resources: {},
        tools: {}
      },
      serverInfo: {
        name: "SkillHub",
        version: "0.1.0"
      }
    });
  }

  if (request.method === "notifications/initialized") {
    return new Response(null, { status: 204 });
  }

  if (request.method === "ping") {
    return rpc(request.id, {});
  }

  if (request.method === "tools/list") {
    const authorizationHeader = c.req.header("Authorization");

    if (authorizationHeader) {
      try {
        const projectTools = await listProjectMcpTools(authorizationHeader);

        if (projectTools.status !== 200) {
          return rpcError(request.id, -32001, projectTools.body.error ?? "Unable to list project MCP tools.");
        }

        return rpc(request.id, {
          tools: projectTools.body.tools
        });
      } catch (error) {
        return rpcError(request.id, -32002, error instanceof Error ? error.message : "Unable to list project MCP tools.");
      }
    }

    const manifests = await listSkillManifests();

    return rpc(request.id, {
      tools: manifests.map((skill) => ({
        name: skill.name,
        title: skill.displayName,
        description: skill.description,
        inputSchema: skill.inputSchema,
        annotations: {
          tags: skill.tags,
          permissionLevel: getPermissionLevel(skill.permissions)
        }
      }))
    });
  }

  if (request.method === "tools/call") {
    const toolName = typeof request.params?.name === "string" ? request.params.name : "";

    if (!toolName) {
      return rpcError(request.id, -32602, "Missing MCP tool name.");
    }

    try {
      const result = await invokeSkill(c.req.header("Authorization"), {
        input: request.params?.arguments ?? {},
        skillSlug: toolName
      });
      const runtimeBody = result.body as Record<string, unknown>;
      const isError = result.status !== 200 || runtimeBody.status !== "success";

      return rpc(request.id, {
        content: [
          {
            type: "text",
            text: mcpToolCallText(runtimeBody, isError)
          }
        ],
        isError,
        structuredContent: runtimeBody
      });
    } catch (error) {
      return rpc(request.id, {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Unable to call SkillHub MCP tool."
          }
        ],
        isError: true
      });
    }
  }

  if (request.method === "resources/list") {
    const manifests = await listSkillManifests();

    return rpc(request.id, {
      resources: manifests.map((skill) => ({
        uri: `skillhub://skills/${skill.name}`,
        name: skill.displayName,
        description: skill.description,
        mimeType: "application/json"
      }))
    });
  }

  if (request.method === "resources/read") {
    const manifests = await listSkillManifests();
    const uri = String(request.params?.uri ?? "");
    const slug = uri.replace("skillhub://skills/", "");
    const skill = manifests.find((item) => item.name === slug);

    if (!skill) {
      return rpcError(request.id, -32004, "Resource not found.");
    }

    return rpc(request.id, {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(skill, null, 2)
        }
      ]
    });
  }

  return rpcError(request.id, -32601, "Method not found.");
});

function mcpToolCallText(body: Record<string, unknown>, isError: boolean) {
  if (isError) {
    return JSON.stringify(
      {
        error: body.error ?? "Skill invocation failed.",
        code: body.code ?? body.status ?? "runtime_error",
        invocationId: body.invocationId ?? null,
        policy: body.policy ?? null
      },
      null,
      2
    );
  }

  const output = body.output;

  return typeof output === "string" ? output : JSON.stringify(output ?? body, null, 2);
}

function rpc(id: JsonRpcRequest["id"], result: unknown) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    result
  });
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message }
  });
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}

function isPublicSignupDisabled(env: Env["Bindings"] | undefined) {
  const value = (env?.SKILLHUB_DISABLE_PUBLIC_SIGNUP ?? getProcessEnv("SKILLHUB_DISABLE_PUBLIC_SIGNUP"))?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function isLegacySignupTokenEnabled(env: Env["Bindings"] | undefined) {
  const value = (env?.SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN ?? getProcessEnv("SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN"))?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function signupErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to create workspace signup.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("organizations_slug") || (message.includes("duplicate") && message.includes("slug"))) {
    return "Workspace slug is already taken.";
  }

  return error.message || "Unable to create workspace signup.";
}

function emailAccessErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to complete email verification.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("organizations_slug") || (message.includes("duplicate") && message.includes("slug"))) {
    return "Workspace slug is already taken.";
  }

  return error.message || "Unable to complete email verification.";
}

function emailAccessErrorStatus(error: unknown): 400 | 403 | 404 | 503 {
  if (!(error instanceof Error)) {
    return 400;
  }

  const message = error.message.toLowerCase();

  if (message.includes("database_url") || message.includes("not available") || message.includes("secret is not configured")) {
    return 503;
  }

  if (message.includes("not found")) {
    return 404;
  }

  if (message.includes("too many failed attempts") || message.includes("already been used")) {
    return 403;
  }

  return 400;
}

function accountSecurityErrorStatus(error: unknown): 400 | 403 | 404 | 503 {
  if (!(error instanceof Error)) {
    return 400;
  }

  if (error.message.includes("DATABASE_URL") || error.message.includes("not available")) {
    return 503;
  }

  if (error.message.includes("not found")) {
    return 404;
  }

  if (error.message.includes("current session") || error.message.includes("another provider")) {
    return 403;
  }

  return 400;
}

function isManifestForSkill(value: unknown, skillSlug: string) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !("name" in value)) {
    return false;
  }

  return (value as { name?: unknown }).name === skillSlug;
}

function parseOAuthProvider(value: string): OAuthProvider | null {
  return value === "google" || value === "github" ? value : null;
}

function parsePermissionLevel(value: string | undefined): SkillSummary["permissionLevel"] | undefined {
  return value === "low" || value === "medium" || value === "high" ? value : undefined;
}

function parseRuntimeType(value: string | undefined): SkillRuntime["type"] | undefined {
  const normalized = value?.toLowerCase();

  if (normalized === "http" || normalized === "mcp" || normalized === "local") {
    return normalized;
  }

  return undefined;
}

function parseBillingModel(value: string | undefined): SkillBillingModel | undefined {
  if (value === "free" || value === "per_call" || value === "subscription") {
    return value;
  }

  return undefined;
}

function parseVerificationStatus(value: string | undefined): SkillSummary["verificationStatus"] | undefined {
  if (
    value === "deprecated" ||
    value === "draft" ||
    value === "rejected" ||
    value === "submitted" ||
    value === "suspended" ||
    value === "verified"
  ) {
    return value;
  }

  return undefined;
}

function parseSearchSort(value: string | undefined): "adoption" | "low_risk" | "recommended" | "recent" | "success" | undefined {
  if (value === "adoption" || value === "recommended" || value === "recent" || value === "success") {
    return value;
  }

  if (value === "lowRisk" || value === "low-risk" || value === "low_risk") {
    return "low_risk";
  }

  return undefined;
}

export default app;
