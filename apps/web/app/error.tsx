"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="product-shell">
      <section className="not-found-shell" aria-labelledby="error-title">
        <div className="not-found-copy">
          <div className="eyebrow">
            <ShieldAlert size={16} aria-hidden="true" />
            <span>Runtime recovery / 运行恢复</span>
          </div>
          <h1 id="error-title">SkillHub could not render this view.</h1>
          <p>
            The page hit a recoverable application error. Try again, or return
            to the public marketplace while the team reviews the server logs.
          </p>
          <p className="not-found-copy__zh">
            页面渲染时遇到可恢复的应用错误。你可以重试，或先回到公开市场。
          </p>
          <div className="hero-actions not-found-actions">
            <button className="primary-button primary-button--large" onClick={reset} type="button">
              <RotateCcw size={18} aria-hidden="true" />
              <span>Try again</span>
            </button>
            <a className="secondary-button secondary-button--large" href="/marketplace?lang=en">
              Marketplace
            </a>
          </div>
          {error.digest ? <small className="error-digest">Error digest: {error.digest}</small> : null}
        </div>
      </section>
    </main>
  );
}
