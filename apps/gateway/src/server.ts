import { serve } from "@hono/node-server";
import app from "./index.js";

const port = Number(process.env.PORT ?? "8787");
const hostname = process.env.HOST ?? "0.0.0.0";

serve({
  fetch: app.fetch,
  hostname,
  port
});

console.log(`SkillHub gateway listening on http://${hostname}:${port}`);
