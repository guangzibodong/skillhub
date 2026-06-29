"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

export function ClientNavigation() {
  const router = useRouter();

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || shouldUseNativeNavigation(anchor)) {
        return;
      }

      const targetUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);

      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash
      ) {
        return;
      }

      event.preventDefault();
      router.push(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` as Route);
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [router]);

  return null;
}

function shouldUseNativeNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") ?? "";

  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    anchor.hasAttribute("download") ||
    anchor.pathname.endsWith("/download") ||
    (anchor.target && anchor.target !== "_self")
  ) {
    return true;
  }

  const targetUrl = new URL(anchor.href);
  return targetUrl.origin !== window.location.origin;
}
