import { NotFoundContent } from "@/components/not-found-content";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata("SkillHub Page Not Found");

export default function NotFound() {
  return <NotFoundContent locale="en" />;
}
