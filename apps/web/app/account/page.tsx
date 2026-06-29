import { AccountWorkspacePage } from "./workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Account");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AccountPage({ searchParams }: PageProps) {
  return <AccountWorkspacePage searchParams={searchParams} section="overview" />;
}
