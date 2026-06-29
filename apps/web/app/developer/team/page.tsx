import { DeveloperWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Developer Team");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function DeveloperTeamPage({ searchParams }: PageProps) {
  return <DeveloperWorkspacePage searchParams={searchParams} section="team" />;
}
