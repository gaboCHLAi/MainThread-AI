import "dotenv/config";
import { launch } from "chrome-launcher";
import getAiAdvice from "./getAiAdvice.js"; // იმპორტი აუცილებელია

export async function runAudit(url) {
  const { default: lighthouse } = await import("lighthouse");
  const chrome = await launch({
    chromeFlags: ["--headless"],
    userDataDir: process.env.TEMP_FOLDER,
  });

  const options = {
    logLevel: "silent",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  };

  console.log(`🚀 MainThread აანალიზებს: ${url}...`);

  try {
    const runnerResult = await lighthouse(url, options);
    const resultData = runnerResult.lhr;

    // 1. მთავარი ქულები
    const scores = {
      performance: Math.round(resultData.categories.performance.score * 100),
      accessibility: Math.round(
        resultData.categories.accessibility.score * 100,
      ),
      bestPractices: Math.round(
        resultData.categories["best-practices"].score * 100,
      ),
      seo: Math.round(resultData.categories.seo.score * 100),
    };

    // 2. ყველა აუდიტის დამუშავება
    const allProcessedAudits = Object.values(resultData.audits)
      .filter((audit) => audit.score !== null)
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        value:
          audit.displayValue ||
          (audit.numericValue
            ? `${Math.round(audit.numericValue)} ${audit.numericUnit || ""}`
            : "გამოსასწორებელია"),
        score: audit.score,
        description: audit.description.replace(/\[Learn more\]\(.*\).*/g, ""),
      }));

    // ზონებად დაყოფა
    const red = allProcessedAudits.filter((a) => a.score < 0.5);
    const yellow = allProcessedAudits.filter(
      (a) => a.score >= 0.5 && a.score < 0.9,
    );
    const green = allProcessedAudits.filter((a) => a.score >= 0.9);

    const finalReport = {
      url: resultData.finalUrl,
      scores: scores,
      red,
      yellow,
      green,
      aiAdvice: null,
    };

    // 3. SMART FILTER: თუ პერფორმანსი < 90 ან არის წითელი შეცდომები
    if (scores.performance < 90 || red.length > 0) {
      console.log("⚠️ აღმოჩენილია ხარვეზები. იწყება AI ანალიზი...");

      // ვაგზავნით JSON ფორმატს (ობიექტების მასივს)
      const issuesForAi = [...red, ...yellow].slice(0, 7);

      // აი აქ იძახებს მეორე ფაილის ფუნქციას
      finalReport.aiAdvice = await getAiAdvice(issuesForAi);
    } else {
      console.log("✅ საიტი მწვანე ზონაშია.");
      finalReport.aiAdvice = "თქვენი საიტი მშვენივრად მუშაობს!";
    }

    await chrome.kill();
    return finalReport;
  } catch (error) {
    console.error("❌ შეცდომა:", error.message);
    if (chrome) await chrome.kill();
  }
}
