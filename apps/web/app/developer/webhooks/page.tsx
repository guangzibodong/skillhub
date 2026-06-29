import { DeveloperWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Developer Webhooks");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function DeveloperWebhooksPage({ searchParams }: PageProps) {
  return <DeveloperWorkspacePage searchParams={searchParams} section="webhooks" />;
}
