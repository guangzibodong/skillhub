import { createGrowthDetailMetadata, createGrowthStaticParams, GrowthDetailRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthDetailMetadata("solutions");
export const generateStaticParams = createGrowthStaticParams("solutions");

export default GrowthDetailRoute("solutions");
