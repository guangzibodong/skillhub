import { createGrowthDetailMetadata, createGrowthStaticParams, GrowthDetailRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthDetailMetadata("use-cases");
export const generateStaticParams = createGrowthStaticParams("use-cases");

export default GrowthDetailRoute("use-cases");
