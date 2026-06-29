import { DeveloperWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Developer Demand");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function DeveloperDemandPage({ searchParams }: PageProps) {
  return <DeveloperWorkspacePage searchParams={searchParams} section="demand" />;
}
