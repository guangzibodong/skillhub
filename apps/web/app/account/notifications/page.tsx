import { AccountWorkspacePage } from "../workspace-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Account Notifications");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AccountNotificationsPage({ searchParams }: PageProps) {
  return <AccountWorkspacePage searchParams={searchParams} section="notifications" />;
}
