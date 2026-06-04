import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPermissionLevel, type SkillSummary } from "@useskillhub/schema";
import {
  getRegistryStats,
  getSkillManifest,
  listSkillManifests,
  publishSkill,
  searchSkills
} from "./registry.js";
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
  listProjectApiKeys,
  revokeProjectApiKey
} from "./runtime.js";
import { updateProjectSubscriptionStatus } from "./project-subscriptions.js";
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
import { getDeveloperProjectDetail, listDeveloperProjects } from "./developer-insights.js";
import { getPublisherOverview } from "./publisher-overview.js";
import {
  getFinanceLedger,
  getPublisherFinanceLedger,
  listSkillPrices,
  processBillableUsage,
  releaseAvailableBalances,
  setSkillPrice
} from "./billing.js";
import {
  listAdminNotifications,
  listUserNotifications,
  markUserNotificationRead
} from "./notifications.js";
import {
  listNotificationPreferences,
  upsertNotificationPreference
} from "./notification-preferences.js";
import { listPublisherSkills } from "./publisher-insights.js";
import {
  decidePayout,
  getPublisherPayoutSummary,
  listAdminPayouts,
  requestPublisherPayout
} from "./payouts.js";
import {
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
  authorize,
  createBootstrapUserToken,
  publicSubject,
  requireServiceAuthorization,
  type AuthRole
} from "./auth.js";

type Env = {
  Bindings: {
    SKILLHUB_ENV: string;
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
const adminOperatorRoles: AuthRole[] = ["super_admin", "admin", "support"];
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
  const permissionLevel = c.req.query("permissionLevel") as SkillSummary["permissionLevel"] | undefined;
  const skills = await searchSkills({ query, tags, limit, permissionLevel });

  return c.json({ skills });
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

  const body = (await c.req.json().catch(() => ({}))) as { status?: "installed" | "suspended" | "removed" };

  if (!body.status) {
    return c.json({ error: "Missing install status." }, 400);
  }

  try {
    return c.json({
      install: await updateProjectInstallStatus(
        c.req.param("projectSlug"),
        c.req.param("skillSlug"),
        body.status,
        authorization.subject.organizationId
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

  const body = (await c.req.json().catch(() => ({}))) as { status?: string };

  if (!body.status) {
    return c.json({ error: "Missing subscription status." }, 400);
  }

  try {
    return c.json({
      subscription: await updateProjectSubscriptionStatus(
        projectSlug,
        c.req.param("subscriptionId"),
        body.status,
        authorization.subject.organizationId
      )
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to update subscription status." }, 400);
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

  try {
    return c.json({
      apiKey: await revokeProjectApiKey(projectSlug, c.req.param("keyId"), authorization.subject.organizationId)
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to revoke API key." }, 400);
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

  return c.json({
    notifications: await listUserNotifications(
      authorization.subject.userId,
      authorization.subject.organizationId,
      Number(c.req.query("limit") ?? "25")
    )
  });
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
    return c.json({
      request: await submitBuyerRequestBuild(authorization.subject.organizationId, c.req.param("requestId"))
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

  try {
    return c.json(
      {
        review: await submitSkillForReview(c.req.param("slug"), authorization.subject.organizationId)
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
    return c.json(await publishSkill(body.manifest, authorization.subject.organizationId), 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to publish skill." }, 400);
  }
});

app.post("/mcp", async (c) => {
  const request = (await c.req.json()) as JsonRpcRequest;
  const manifests = await listSkillManifests();

  if (request.method === "tools/list") {
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

  if (request.method === "resources/list") {
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

export default app;
