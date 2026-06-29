import { AccountWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Account Commissions");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AccountCommissionsPage({ searchParams }: PageProps) {
  return <AccountWorkspacePage searchParams={searchParams} section="commissions" />;
}
