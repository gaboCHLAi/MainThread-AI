import { getBrowser, closeBrowser } from "../Controllers/browser.js";
import { auditSite } from "../Controllers/analyzer/lighthouseAudit.js";
import { detectPlatform } from "../Controllers/detectPlatform.js";
import { auditSecurity } from "../Controllers/analyzer/securityAudit.js";
import { getAiAdvice } from "../Controllers/getAiAdvice.js";

export async function flowForUserRequest(req, res) {
  let browser;
  let mainPage;

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    browser = await getBrowser();

    // Open main page for platform and security detection
    mainPage = await browser.newPage();
    console.log(`🔍 Navigating to: ${url}`);
    await mainPage.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    // Lighthouse audit (Mobile and Desktop)
    let auditResults = {
      success: false,
      mobileScores: null,
      desktopScores: null,
      issuesForAi: [],
    };

    console.log("🚀 Starting Dual-Mode Lighthouse audit (Mobile + Desktop)...");
    auditResults = await auditSite(url);
    console.log("✅ Lighthouse audit finished for both modes");

    // 🔹 Platform detection
    let platform = "Unknown";
    try {
      platform = await detectPlatform(url, mainPage);
      console.log("🖥️ Platform detected:", platform);
    } catch {
      console.error("⚠️ Platform detect failed");
    }

    // 🔹 Security audit
    let securityResults = {};
    try {
      securityResults = await auditSecurity(url, mainPage);
      console.log("🔒 Security audit finished");
    } catch {
      console.error("⚠️ Security audit failed");
    }

    // Prepare data for AI (structured format)
    const sitesResults = [
      {
        url,
        issues: auditResults?.issuesForAi || [],
        result: {
          mobile: auditResults?.mobileScores,
          desktop: auditResults?.desktopScores,
          mobileAudits: auditResults?.mobileAudits,
          desktopAudits: auditResults?.desktopAudits,
          platform,
          security: securityResults,
        },
      },
    ];

    // AI advice
    let aiAdvice = null;
    try {
      aiAdvice = await getAiAdvice(sitesResults);
      console.log("🤖 AI advice generated");
    } catch (aiError) {
      console.error("⚠️ AI analysis failed:", aiError.message);
    }

    // Final response to frontend (spread auditResults into result)
    res.json({
      status: "ok",
      aiAdvice,
      result: {
        ...auditResults,
        platform,
        security: securityResults,
      },
    });
  } catch (err) {
    console.error("❌ Error in flowForUserRequest:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  } finally {
    if (mainPage) await mainPage.close().catch(() => {});
    if (browser) {
      await closeBrowser(browser);
      console.log("🛑 Browser closed safely");
    }
  }
}
