import type { Route } from "next";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
};

export function AppLink({
  children,
  download,
  href,
  prefetch,
  replace,
  scroll,
  target,
  ...props
}: AppLinkProps) {
  if (!shouldUseClientNavigation(href, target, download)) {
    return (
      <a {...props} download={download} href={href} target={target}>
        {children}
      </a>
    );
  }

  return (
    <Link
      {...props}
      href={href as Route}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      target={target}
    >
      {children}
    </Link>
  );
}

function shouldUseClientNavigation(
  href: string,
  target: string | undefined,
  download: AnchorHTMLAttributes<HTMLAnchorElement>["download"],
) {
  if (target || download !== undefined) {
    return false;
  }

  if (
    href.startsWith("#") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  ) {
    return false;
  }

  return href.startsWith("/") || href.startsWith("?");
}
