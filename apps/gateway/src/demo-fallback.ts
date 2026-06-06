type RuntimeEnv = Record<string, string | undefined>;

function runtimeEnv(): RuntimeEnv {
  return typeof process === "undefined" ? {} : process.env;
}

export function isProductionRuntime(env: RuntimeEnv = runtimeEnv()) {
  return (
    env.SKILLHUB_ENV === "production" ||
    env.NODE_ENV === "production" ||
    env.VERCEL_ENV === "production"
  );
}

export function allowDemoFallback(env: RuntimeEnv = runtimeEnv()) {
  return (
    !isProductionRuntime(env) || env.SKILLHUB_ENABLE_DEMO_FALLBACK === "true"
  );
}

export function demoFallback<T>(
  fallbackValue: T,
  productionValue: T,
  env: RuntimeEnv = runtimeEnv(),
): T {
  return allowDemoFallback(env) ? fallbackValue : productionValue;
}
