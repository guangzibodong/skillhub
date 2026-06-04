import { ArrowLeft, FileJson, LockKeyhole, UploadCloud } from "lucide-react";
import Link from "next/link";
import { PublishForm } from "@/components/publish-form";

export const dynamic = "force-dynamic";

export default function PublishPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="publish-shell">
      <header className="site-header site-header--publish">
        <Link className="brand brand--link" href="/" aria-label="SkillHub home">
          <div className="brand__mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <strong>SkillHub</strong>
            <small>publish console</small>
          </div>
        </Link>

        <div className="site-actions">
          <Link className="ghost-button" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            <span>Registry</span>
          </Link>
          <a className="primary-button" href={`${apiUrl}/health`}>
            <LockKeyhole size={17} aria-hidden="true" />
            <span>Gateway</span>
          </a>
        </div>
      </header>

      <section className="publish-hero" aria-labelledby="publish-heading">
        <div>
          <div className="eyebrow">
            <UploadCloud size={16} aria-hidden="true" />
            <span>Publish workflow</span>
          </div>
          <h1 id="publish-heading">Register a skill package.</h1>
          <p>
            Paste a SkillHub manifest, review the contract, and publish it into the live registry behind
            useskillhub.com.
          </p>
        </div>
        <div className="publish-hero__badge">
          <FileJson size={18} aria-hidden="true" />
          <span>skillhub.json</span>
        </div>
      </section>

      <PublishForm apiUrl={apiUrl} />
    </main>
  );
}
