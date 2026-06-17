import { createGrowthDetailMetadata, createGrowthStaticParams, GrowthDetailRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthDetailMetadata("blog");
export const generateStaticParams = createGrowthStaticParams("blog");

export default GrowthDetailRoute("blog");
