import { createGrowthHubMetadata, GrowthHubRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthHubMetadata("examples");

export default GrowthHubRoute("examples");
