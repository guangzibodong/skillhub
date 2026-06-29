"use client";

import { useActionState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Github,
  Mail,
  Rocket,
  Save,
  Send,
  ShieldCheck,
  ToggleLeft,
  Webhook,
  XCircle,
} from "lucide-react";
import {
  saveEmailProviderAction,
  saveLaunchSettingsAction,
  saveOAuthProviderAction,
  savePayPalConfigAction,
  savePayoutSettingsAction,
  saveRuntimeSettingsAction,
  saveStripeConfigAction,
  saveWebhookSettingsAction,
  sendTestEmailAction,
  testPayPalConfigAction,
  testStripeConfigAction,
  type PlatformConfigActionState,
  type PlatformProviderActionState,
} from "@/lib/admin-platform-provider-actions";
import type { Locale } from "@/lib/i18n";
import type {
  AdminPlatformConfig,
  AdminEmailProviderConfig,
  AdminOAuthProviderConfig,
} from "@/lib/ops-data";

type AdminPlatformProviderManagerProps = {
  config: AdminPlatformConfig;
  locale: Locale;
};

const providerInitialState: PlatformProviderActionState = {
  message: "",
  status: "idle",
};

const sectionInitialState: PlatformConfigActionState = {
  message: "",
  status: "idle",
};

const copy = {
  en: {
    active: "Active",
    appUrl: "App URL",
    apiUrl: "API URL",
    callbackBaseUrl: "Callback base URL",
    cancelUrl: "Checkout cancel URL",
    clientId: "Client ID",
    clientSecret: "Client secret",
    configured: "Configured",
    connectClientId: "Connect client ID",
    database: "Database",
    disabled: "Disabled",
    email: "Email",
    emailFrom: "From address",
    emailProvider: "Email provider",
    github: "GitHub OAuth",
    google: "Google OAuth",
    keepSecret: "Leave blank to keep the existing secret.",
    last4: "last4",
    paypal: "PayPal",
    paypalClientId: "Client ID",
    paypalClientSecret: "Client secret",
    paypalEnvironment: "Environment",
    paypalReturnUrl: "Return URL",
    paypalCancelUrl: "Cancel URL",
    paypalWebhookId: "Webhook ID",
    launch: "Launch Gates",
    maxAttempts: "Max attempts",
    oauth: "OAuth",
    payouts: "Payout Rules",
    refreshUrl: "Connect refresh URL",
    returnUrl: "Connect return URL",
    runtime: "Runtime",
    save: "Save",
    saving: "Saving",
    secretKey: "Secret key",
    sendTest: "Send test",
    sessionSecret: "Session secret",
    smtpHost: "SMTP host",
    smtpPassword: "SMTP password",
    smtpPort: "SMTP port",
    smtpSecure: "Use TLS/SSL",
    smtpUser: "SMTP user",
    source: "Source",
    stripe: "Stripe",
    successUrl: "Checkout success URL",
    systemStatus: "Startup Status",
    testEmail: "Test recipient",
    testPayPal: "Verify PayPal",
    testStripe: "Verify Stripe",
    timeoutMs: "Timeout ms",
    title: "Platform configuration",
    unconfigured: "Unconfigured",
    updated: "Updated",
    webhooks: "Webhook Delivery",
    webhookSecret: "Webhook secret"
  },
  zh: {
    active: "启用",
    appUrl: "应用地址",
    apiUrl: "API 地址",
    callbackBaseUrl: "回调 Base URL",
    cancelUrl: "Checkout 取消 URL",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    configured: "已配置",
    connectClientId: "Connect Client ID",
    database: "数据库",
    disabled: "停用",
    email: "邮件",
    emailFrom: "发件地址",
    emailProvider: "邮件供应商",
    github: "GitHub OAuth",
    google: "Google OAuth",
    keepSecret: "留空会保留已有密钥。",
    last4: "后四位",
    paypal: "PayPal",
    paypalClientId: "Client ID",
    paypalClientSecret: "Client Secret",
    paypalEnvironment: "环境",
    paypalReturnUrl: "返回 URL",
    paypalCancelUrl: "取消 URL",
    paypalWebhookId: "Webhook ID",
    launch: "上线门槛",
    maxAttempts: "最大重试次数",
    oauth: "OAuth",
    payouts: "财务规则",
    refreshUrl: "Connect 刷新 URL",
    returnUrl: "Connect 返回 URL",
    runtime: "运行开关",
    save: "保存",
    saving: "保存中",
    secretKey: "Secret Key",
    sendTest: "发送测试",
    sessionSecret: "Session Secret",
    smtpHost: "SMTP Host",
    smtpPassword: "SMTP 密码",
    smtpPort: "SMTP 端口",
    smtpSecure: "使用 TLS/SSL",
    smtpUser: "SMTP 用户",
    source: "来源",
    stripe: "Stripe",
    successUrl: "Checkout 成功 URL",
    systemStatus: "启动状态",
    testEmail: "测试收件人",
    testPayPal: "校验 PayPal",
    testStripe: "校验 Stripe",
    timeoutMs: "超时毫秒",
    title: "平台配置",
    unconfigured: "未配置",
    updated: "更新时间",
    webhooks: "Webhook 投递",
    webhookSecret: "Webhook Secret"
  }
} as const;

export function AdminPlatformProviderManager({
  config,
  locale,
}: AdminPlatformProviderManagerProps) {
  const labels = copy[locale];
  const [oauthState, oauthAction, isSavingOAuth] = useActionState(
    saveOAuthProviderAction.bind(null, locale),
    providerInitialState,
  );
  const [emailState, emailAction, isSavingEmail] = useActionState(
    saveEmailProviderAction.bind(null, locale),
    providerInitialState,
  );
  const [testEmailState, testEmailAction, isSendingTestEmail] = useActionState(
    sendTestEmailAction.bind(null, locale),
    sectionInitialState,
  );
  const [stripeState, stripeAction, isSavingStripe] = useActionState(
    saveStripeConfigAction.bind(null, locale),
    sectionInitialState,
  );
  const [stripeTestState, stripeTestAction, isTestingStripe] = useActionState(
    testStripeConfigAction.bind(null, locale),
    sectionInitialState,
  );
  const [paypalState, paypalAction, isSavingPayPal] = useActionState(
    savePayPalConfigAction.bind(null, locale),
    sectionInitialState,
  );
  const [paypalTestState, paypalTestAction, isTestingPayPal] = useActionState(
    testPayPalConfigAction.bind(null, locale),
    sectionInitialState,
  );
  const [webhookState, webhookAction, isSavingWebhook] = useActionState(
    saveWebhookSettingsAction.bind(null, locale),
    sectionInitialState,
  );
  const [payoutState, payoutAction, isSavingPayout] = useActionState(
    savePayoutSettingsAction.bind(null, locale),
    sectionInitialState,
  );
  const [launchState, launchAction, isSavingLaunch] = useActionState(
    saveLaunchSettingsAction.bind(null, locale),
    sectionInitialState,
  );
  const [runtimeState, runtimeAction, isSavingRuntime] = useActionState(
    saveRuntimeSettingsAction.bind(null, locale),
    sectionInitialState,
  );

  return (
    <article className="ops-panel platform-provider-panel">
      <div className="card-kicker">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="platform-provider-grid">
        <section className="platform-provider-section">
          <h3>{labels.oauth}</h3>
          {config.oauth.map((provider) => {
            const state = oauthState.providerKey === provider.provider ? oauthState : null;
            return (
              <OAuthForm
                action={oauthAction}
                isSaving={isSavingOAuth && Boolean(state)}
                key={provider.provider}
                labels={labels}
                provider={provider}
                state={state}
              />
            );
          })}
        </section>

        <section className="platform-provider-section">
          <h3>{labels.email}</h3>
          <EmailForm
            action={emailAction}
            isSaving={isSavingEmail}
            labels={labels}
            provider={config.email}
            state={emailState}
          />
          <form action={testEmailAction} className="platform-provider-form platform-provider-form--inline">
            <label>
              <span>{labels.testEmail}</span>
              <input name="to" placeholder="admin@example.com" type="email" required />
            </label>
            <button className="secondary-button secondary-button--compact" disabled={isSendingTestEmail} type="submit">
              <Send size={15} aria-hidden="true" />
              <span>{isSendingTestEmail ? labels.saving : labels.sendTest}</span>
            </button>
            {testEmailState.status !== "idle" ? <SectionMessage state={testEmailState} /> : null}
          </form>
        </section>

        <section className="platform-provider-section platform-provider-section--wide">
          <h3>{labels.stripe}</h3>
          <form action={stripeAction} className="platform-provider-form platform-provider-form--payment">
            <ProviderHeading
              icon={<CreditCard size={16} aria-hidden="true" />}
              labels={labels}
              source={config.stripe.source}
              status={config.stripe.status}
              title={labels.stripe}
              updatedAt={config.stripe.updatedAt}
            />
            <div className="platform-provider-columns">
              <SecretInput configured={config.stripe.secretKeyConfigured} label={labels.secretKey} labels={labels} last4={config.stripe.secretKeyLast4} name="secretKey" />
              <SecretInput configured={config.stripe.webhookSecretConfigured} label={labels.webhookSecret} labels={labels} last4={config.stripe.webhookSecretLast4} name="webhookSecret" />
              <SecretInput configured={config.stripe.connectClientIdConfigured} label={labels.connectClientId} labels={labels} last4={config.stripe.connectClientIdLast4} name="connectClientId" />
              <TextInput defaultValue={config.stripe.successUrl} label={labels.successUrl} name="successUrl" />
              <TextInput defaultValue={config.stripe.cancelUrl} label={labels.cancelUrl} name="cancelUrl" />
              <TextInput defaultValue={config.stripe.returnUrl} label={labels.returnUrl} name="returnUrl" />
              <TextInput defaultValue={config.stripe.refreshUrl} label={labels.refreshUrl} name="refreshUrl" />
              <StatusSelect defaultValue={config.stripe.status} labels={labels} />
            </div>
            <div className="platform-provider-actions">
              <button className="secondary-button secondary-button--compact" disabled={isSavingStripe} type="submit">
                <Save size={15} aria-hidden="true" />
                <span>{isSavingStripe ? labels.saving : labels.save}</span>
              </button>
              {stripeState.status !== "idle" ? <SectionMessage state={stripeState} /> : null}
            </div>
          </form>
          <form action={stripeTestAction} className="platform-provider-test-form">
            <button className="secondary-button secondary-button--compact" disabled={isTestingStripe} type="submit">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{isTestingStripe ? labels.saving : labels.testStripe}</span>
            </button>
            {stripeTestState.status !== "idle" ? <SectionMessage state={stripeTestState} /> : null}
          </form>
        </section>

        <section className="platform-provider-section platform-provider-section--wide">
          <h3>{labels.paypal}</h3>
          <form action={paypalAction} className="platform-provider-form platform-provider-form--payment">
            <ProviderHeading
              icon={<CreditCard size={16} aria-hidden="true" />}
              labels={labels}
              source={config.paypal.source}
              status={config.paypal.status}
              title={labels.paypal}
              updatedAt={config.paypal.updatedAt}
            />
            <div className="platform-provider-columns">
              <SecretInput configured={config.paypal.clientIdConfigured} label={labels.paypalClientId} labels={labels} last4={config.paypal.clientIdLast4} name="clientId" />
              <SecretInput configured={config.paypal.clientSecretConfigured} label={labels.paypalClientSecret} labels={labels} last4={config.paypal.clientSecretLast4} name="clientSecret" />
              <SecretInput configured={config.paypal.webhookIdConfigured} label={labels.paypalWebhookId} labels={labels} last4={config.paypal.webhookIdLast4} name="webhookId" />
              <EnvironmentSelect defaultValue={config.paypal.environment} label={labels.paypalEnvironment} />
              <TextInput defaultValue={config.paypal.returnUrl} label={labels.paypalReturnUrl} name="returnUrl" />
              <TextInput defaultValue={config.paypal.cancelUrl} label={labels.paypalCancelUrl} name="cancelUrl" />
              <StatusSelect defaultValue={config.paypal.status} labels={labels} />
            </div>
            <div className="platform-provider-actions">
              <button className="secondary-button secondary-button--compact" disabled={isSavingPayPal} type="submit">
                <Save size={15} aria-hidden="true" />
                <span>{isSavingPayPal ? labels.saving : labels.save}</span>
              </button>
              {paypalState.status !== "idle" ? <SectionMessage state={paypalState} /> : null}
            </div>
          </form>
          <form action={paypalTestAction} className="platform-provider-test-form">
            <button className="secondary-button secondary-button--compact" disabled={isTestingPayPal} type="submit">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{isTestingPayPal ? labels.saving : labels.testPayPal}</span>
            </button>
            {paypalTestState.status !== "idle" ? <SectionMessage state={paypalTestState} /> : null}
          </form>
        </section>

        <SettingsForm
          action={webhookAction}
          icon={<Webhook size={16} aria-hidden="true" />}
          isSaving={isSavingWebhook}
          labels={labels}
          state={webhookState}
          title={labels.webhooks}
        >
          <NumberInput defaultValue={config.webhooks.timeoutMs} label={labels.timeoutMs} max={30000} min={1000} name="timeoutMs" />
          <NumberInput defaultValue={config.webhooks.maxAttempts} label={labels.maxAttempts} max={20} min={1} name="maxAttempts" />
          <MetaLine labels={labels} source={config.webhooks.source} updatedAt={config.webhooks.updatedAt} />
        </SettingsForm>

        <SettingsForm
          action={payoutAction}
          icon={<CreditCard size={16} aria-hidden="true" />}
          isSaving={isSavingPayout}
          labels={labels}
          state={payoutState}
          title={labels.payouts}
        >
          <NumberInput defaultValue={config.payouts.minPayoutCents} label="Minimum payout cents" min={0} name="minPayoutCents" />
          <NumberInput defaultValue={config.payouts.payoutReviewThresholdCents} label="Review threshold cents" min={0} name="payoutReviewThresholdCents" />
          <MetaLine labels={labels} source={config.payouts.source} updatedAt={config.payouts.updatedAt} />
        </SettingsForm>

        <SettingsForm
          action={launchAction}
          icon={<Rocket size={16} aria-hidden="true" />}
          isSaving={isSavingLaunch}
          labels={labels}
          state={launchState}
          title={labels.launch}
        >
          <NumberInput defaultValue={config.launch.verifiedSkills} label="Verified skills" min={0} name="verifiedSkills" />
          <NumberInput defaultValue={config.launch.activePublishers} label="Active publishers" min={0} name="activePublishers" />
          <NumberInput defaultValue={config.launch.activeProjects} label="Active projects" min={0} name="activeProjects" />
          <NumberInput defaultValue={config.launch.successfulInvocations} label="Successful invocations" min={0} name="successfulInvocations" />
          <NumberInput defaultValue={config.launch.publishedFeedback} label="Published feedback" min={0} name="publishedFeedback" />
          <MetaLine labels={labels} source={config.launch.source} updatedAt={config.launch.updatedAt} />
        </SettingsForm>

        <SettingsForm
          action={runtimeAction}
          icon={<ToggleLeft size={16} aria-hidden="true" />}
          isSaving={isSavingRuntime}
          labels={labels}
          state={runtimeState}
          title={labels.runtime}
        >
          <label className="platform-provider-form__check">
            <input defaultChecked={config.runtime.disablePublicSignup} name="disablePublicSignup" type="checkbox" />
            <span>Disable public signup</span>
          </label>
          <MetaLine labels={labels} source={config.runtime.source} updatedAt={config.runtime.updatedAt} />
        </SettingsForm>

        <section className="platform-provider-section">
          <h3>{labels.systemStatus}</h3>
          <div className="platform-status-list">
            <StatusLine label={labels.database} ready={config.bootstrap.databaseConfigured} />
            <StatusLine label={labels.sessionSecret} ready={config.bootstrap.sessionSecretConfigured} />
            <StatusLine label="Config encryption secret" ready={config.bootstrap.encryptionSecretValid} />
            <StatusLine label={labels.appUrl} ready={config.bootstrap.appUrlConfigured} />
            <StatusLine label={labels.apiUrl} ready={config.bootstrap.apiUrlConfigured} />
            <StatusLine label="Server API URL" ready={config.bootstrap.serverApiUrlConfigured} />
            <StatusLine label="Supabase service role" ready={config.bootstrap.supabaseConfigured} />
            <StatusLine label="R2 bucket" ready={config.bootstrap.r2Configured} />
          </div>
        </section>
      </div>
    </article>
  );
}

function OAuthForm({
  action,
  isSaving,
  labels,
  provider,
  state,
}: {
  action: (payload: FormData) => void;
  isSaving: boolean;
  labels: (typeof copy)["en" | "zh"];
  provider: AdminOAuthProviderConfig;
  state: PlatformProviderActionState | null;
}) {
  return (
    <form action={action} className="platform-provider-form">
      <input name="provider" type="hidden" value={provider.provider} />
      <ProviderHeading
        icon={provider.provider === "github" ? <Github size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
        labels={labels}
        title={provider.provider === "github" ? labels.github : labels.google}
        updatedAt={provider.updatedAt}
        status={provider.status}
        source={provider.source}
      />
      <TextInput defaultValue={provider.callbackBaseUrl} label={labels.callbackBaseUrl} name="callbackBaseUrl" required />
      <TextInput defaultValue={provider.clientId} label={labels.clientId} name="clientId" required />
      <SecretInput configured={provider.clientSecretConfigured} label={labels.clientSecret} labels={labels} last4={provider.clientSecretLast4} name="clientSecret" />
      <StatusSelect defaultValue={provider.status} labels={labels} />
      <button className="secondary-button secondary-button--compact" disabled={isSaving} type="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isSaving ? labels.saving : labels.save}</span>
      </button>
      {state && state.status !== "idle" ? <ProviderMessage state={state} /> : null}
    </form>
  );
}

function EmailForm({
  action,
  isSaving,
  labels,
  provider,
  state,
}: {
  action: (payload: FormData) => void;
  isSaving: boolean;
  labels: (typeof copy)["en" | "zh"];
  provider: AdminEmailProviderConfig;
  state: PlatformProviderActionState;
}) {
  return (
    <form action={action} className="platform-provider-form">
      <ProviderHeading
        icon={<Mail size={16} aria-hidden="true" />}
        labels={labels}
        title={labels.emailProvider}
        updatedAt={provider.updatedAt}
        status={provider.status}
        source={provider.source}
      />
      <label>
        <span>{labels.emailProvider}</span>
        <select defaultValue={provider.provider} name="provider">
          <option value="resend">Resend</option>
          <option value="smtp">SMTP</option>
          <option value="unconfigured">{labels.unconfigured}</option>
        </select>
      </label>
      <TextInput defaultValue={provider.from} label={labels.emailFrom} name="from" />
      <SecretInput configured={provider.resendApiKeyConfigured} label="Resend API key" labels={labels} last4={provider.resendApiKeyLast4} name="resendApiKey" />
      <TextInput defaultValue={provider.smtpHost} label={labels.smtpHost} name="smtpHost" />
      <NumberInput defaultValue={Number(provider.smtpPort ?? 465)} label={labels.smtpPort} max={65535} min={1} name="smtpPort" />
      <TextInput defaultValue={provider.smtpUser} label={labels.smtpUser} name="smtpUser" />
      <SecretInput configured={provider.smtpPasswordConfigured} label={labels.smtpPassword} labels={labels} last4={provider.smtpPasswordLast4} name="smtpPassword" />
      <label className="platform-provider-form__check">
        <input defaultChecked={(provider.smtpSecure ?? "true") !== "false"} name="smtpSecure" type="checkbox" />
        <span>{labels.smtpSecure}</span>
      </label>
      <StatusSelect defaultValue={provider.status} labels={labels} />
      <button className="secondary-button secondary-button--compact" disabled={isSaving} type="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isSaving ? labels.saving : labels.save}</span>
      </button>
      {state.status !== "idle" ? <ProviderMessage state={state} /> : null}
    </form>
  );
}

function SettingsForm({
  action,
  children,
  icon,
  isSaving,
  labels,
  state,
  title,
}: {
  action: (payload: FormData) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  isSaving: boolean;
  labels: (typeof copy)["en" | "zh"];
  state: PlatformConfigActionState;
  title: string;
}) {
  return (
    <section className="platform-provider-section">
      <h3>{title}</h3>
      <form action={action} className="platform-provider-form">
        <header className="platform-provider-heading">
          <div>
            {icon}
            <strong>{title}</strong>
          </div>
        </header>
        {children}
        <button className="secondary-button secondary-button--compact" disabled={isSaving} type="submit">
          <Save size={15} aria-hidden="true" />
          <span>{isSaving ? labels.saving : labels.save}</span>
        </button>
        {state.status !== "idle" ? <SectionMessage state={state} /> : null}
      </form>
    </section>
  );
}

function ProviderHeading({
  icon,
  labels,
  source,
  status,
  title,
  updatedAt,
}: {
  icon: React.ReactNode;
  labels: (typeof copy)["en" | "zh"];
  source: string;
  status: "active" | "disabled";
  title: string;
  updatedAt: string | null;
}) {
  return (
    <header className="platform-provider-heading">
      <div>
        {icon}
        <strong>{title}</strong>
      </div>
      <span className={status === "active" ? "status-chip" : "status-chip status-chip--neutral"}>
        {status === "active" ? labels.active : labels.disabled}
      </span>
      <small>
        {labels.source}: {source}
        {updatedAt ? ` / ${labels.updated}: ${formatDate(updatedAt)}` : ""}
      </small>
    </header>
  );
}

function MetaLine({
  labels,
  source,
  updatedAt,
}: {
  labels: (typeof copy)["en" | "zh"];
  source: string;
  updatedAt: string | null;
}) {
  return (
    <small>
      {labels.source}: {source}
      {updatedAt ? ` / ${labels.updated}: ${formatDate(updatedAt)}` : ""}
    </small>
  );
}

function TextInput({
  defaultValue,
  label,
  name,
  required,
}: {
  defaultValue: string | null;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <input defaultValue={defaultValue ?? ""} name={name} required={required} />
    </label>
  );
}

function NumberInput({
  defaultValue,
  label,
  max,
  min,
  name,
}: {
  defaultValue: number;
  label: string;
  max?: number;
  min?: number;
  name: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <input defaultValue={defaultValue} max={max} min={min} name={name} type="number" />
    </label>
  );
}

function SecretInput({
  configured,
  label,
  labels,
  last4,
  name,
}: {
  configured: boolean;
  label: string;
  labels: (typeof copy)["en" | "zh"];
  last4: string | null;
  name: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} placeholder={secretPlaceholder(configured, last4, labels)} type="password" />
      <small>{labels.keepSecret}</small>
    </label>
  );
}

function StatusSelect({
  defaultValue,
  labels,
}: {
  defaultValue: "active" | "disabled";
  labels: (typeof copy)["en" | "zh"];
}) {
  return (
    <label>
      <span>Status</span>
      <select defaultValue={defaultValue} name="status">
        <option value="active">{labels.active}</option>
        <option value="disabled">{labels.disabled}</option>
      </select>
    </label>
  );
}

function EnvironmentSelect({
  defaultValue,
  label,
}: {
  defaultValue: "live" | "sandbox";
  label: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <select defaultValue={defaultValue} name="environment">
        <option value="sandbox">sandbox</option>
        <option value="live">live</option>
      </select>
    </label>
  );
}

function StatusLine({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="platform-status-line">
      <span>{label}</span>
      <span className={ready ? "status-chip" : "status-chip status-chip--neutral"}>
        {ready ? "ready" : "missing"}
      </span>
    </div>
  );
}

function ProviderMessage({ state }: { state: PlatformProviderActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function SectionMessage({ state }: { state: PlatformConfigActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function secretPlaceholder(
  configured: boolean,
  last4: string | null,
  labels: (typeof copy)["en" | "zh"],
) {
  return configured ? `${labels.configured}${last4 ? ` (${labels.last4}: ${last4})` : ""}` : "";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
