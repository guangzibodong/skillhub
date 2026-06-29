import { DeveloperWorkspacePage } from "./workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Developer Workspace");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function DeveloperPage({ searchParams }: PageProps) {
  return <DeveloperWorkspacePage searchParams={searchParams} section="overview" />;
}
