"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RotateCcw, ShieldAlert } from "lucide-react";
import styles from "@/components/not-found-content.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "zh" ? "zh" : "en";
  const marketplaceHref =
    locale === "zh" ? "/marketplace?lang=zh" : "/marketplace?lang=en";
  const labels =
    locale === "zh"
      ? {
          body: "页面渲染时遇到可恢复的应用错误。你可以重试，或先回到找技能页面；我们会继续根据服务日志排查。",
          eyebrow: "运行恢复",
          marketplace: "返回找技能",
          retry: "重试",
          title: "SkillHub 暂时无法渲染这个页面。",
        }
      : {
          body: "The page hit a recoverable application error. Try again, or return to Find Skills while the team reviews the server logs.",
          eyebrow: "Runtime recovery",
          marketplace: "Find Skills",
          retry: "Try again",
          title: "SkillHub could not render this view.",
        };

  return (
    <main className={`product-shell ${styles.pageStyles}`}>
      <section className="not-found-shell" aria-labelledby="error-title">
        <div className="not-found-copy">
          <div className="eyebrow">
            <ShieldAlert size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="error-title">{labels.title}</h1>
          <p>{labels.body}</p>
          <div className="hero-actions not-found-actions">
            <button
              className="primary-button primary-button--large"
              onClick={reset}
              type="button"
            >
              <RotateCcw size={18} aria-hidden="true" />
              <span>{labels.retry}</span>
            </button>
            <Link
              className="secondary-button secondary-button--large"
              href={marketplaceHref}
            >
              {labels.marketplace}
            </Link>
          </div>
          {error.digest ? (
            <small className="error-digest">Error digest: {error.digest}</small>
          ) : null}
        </div>
      </section>
    </main>
  );
}
