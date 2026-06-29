import { AccountWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Account Security");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AccountSecurityPage({ searchParams }: PageProps) {
  return <AccountWorkspacePage searchParams={searchParams} section="security" />;
}
