import { createGrowthDetailMetadata, createGrowthStaticParams, GrowthDetailRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthDetailMetadata("integrations");
export const generateStaticParams = createGrowthStaticParams("integrations");

export default GrowthDetailRoute("integrations");
