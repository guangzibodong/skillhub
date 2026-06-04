import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublishForm } from "@/components/publish-form";

export const dynamic = "force-dynamic";

export default function PublishPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="publish-shell">
      <header className="publish-header">
        <Link className="secondary-button" href="/">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Registry</span>
        </Link>
        <div>
          <h1>Publish Skill</h1>
          <p>Register a SkillHub manifest</p>
        </div>
      </header>
      <PublishForm apiUrl={apiUrl} />
    </main>
  );
}
