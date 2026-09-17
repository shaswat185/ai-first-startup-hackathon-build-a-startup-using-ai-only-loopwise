import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

async function main() {
  await connectDB();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`[server] FixMyBusiness API running on http://localhost:${env.port}`);
    console.log(`[server] Environment: ${env.nodeEnv}`);
    console.log(`[server] Allowed client origin: ${env.clientUrl}`);
    if (!env.groqApiKey || !env.groqModel) {
      console.warn("[server] GROQ_API_KEY or GROQ_MODEL not set. AI diagnosis will fail until configured.");
    }
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
