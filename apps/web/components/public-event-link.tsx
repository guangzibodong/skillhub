"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackPublicEvent } from "@/lib/public-analytics";

type PublicEventLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: string;
  eventProperties?: Record<string, string | number | boolean | null | undefined>;
};

export function PublicEventLink({
  children,
  eventName,
  eventProperties,
  onClick,
  ...props
}: PublicEventLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackPublicEvent(eventName, eventProperties);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
