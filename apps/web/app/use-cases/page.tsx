import { createGrowthHubMetadata, GrowthHubRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthHubMetadata("use-cases");

export default GrowthHubRoute("use-cases");
