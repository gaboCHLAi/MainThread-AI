import "dotenv/config";
import { runFullFlow } from "./Flows/mainFlow.js";
import { keywords } from "./keywords.js";

const MY_EMAIL = process.env.EMAIL_USER;

(async () => {
  console.log("🚀 Starting full Puppeteer flow...");

  try {
    for (const keyword of keywords) {
      console.log(`🔎 Searching for keyword: ${keyword}`);
      await runFullFlow(keyword, MY_EMAIL); // აქ ყოველ keyword-ზე დაიძება flow
    }
    console.log("✅ All flows finished successfully");
  } catch (error) {
    console.error("❌ Error during flow:", error);
  }
})();
