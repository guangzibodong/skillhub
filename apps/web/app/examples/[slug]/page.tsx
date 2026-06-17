import { createGrowthDetailMetadata, createGrowthStaticParams, GrowthDetailRoute } from "@/lib/growth-routes";

export const dynamic = "force-dynamic";

export const generateMetadata = createGrowthDetailMetadata("examples");
export const generateStaticParams = createGrowthStaticParams("examples");

export default GrowthDetailRoute("examples");
