"use client";

type PublicEventProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, properties?: PublicEventProperties) => void;
    plausible?: (eventName: string, options?: { props?: PublicEventProperties }) => void;
  }
}

export function trackPublicEvent(eventName: string, properties: PublicEventProperties = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer?.push({ event: eventName, ...properties });
  window.gtag?.("event", eventName, properties);
  window.plausible?.(eventName, { props: properties });
}
