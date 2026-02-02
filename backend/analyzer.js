import "dotenv/config";
import puppeteer from "puppeteer";
import getAiAdvice from "./getAiAdvice.js"; // თუ შენ გაქვს ეს ფაილი

export async function runAudit(url) {
  const { default: lighthouse } = await import("lighthouse");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "true",
  });

  const options = {
    logLevel: "silent",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: new URL(browser.wsEndpoint()).port,
  };

  console.log(`🚀 MainThread აანალიზებს: ${url}...`);

  try {
    const runnerResult = await lighthouse(url, options);
    const resultData = runnerResult.lhr;

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

    const red = allProcessedAudits.filter((a) => a.score < 0.5);
    const yellow = allProcessedAudits.filter(
      (a) => a.score >= 0.5 && a.score < 0.9,
    );
    const green = allProcessedAudits.filter((a) => a.score >= 0.9);

    const finalReport = {
      url: resultData.finalUrl,
      scores,
      red,
      yellow,
      green,
      aiAdvice: null,
    };

    if (scores.performance < 90 || red.length > 0) {
      console.log("⚠️ აღმოჩენილია ხარვეზები. იწყება AI ანალიზი...");
      const issuesForAi = [...red, ...yellow].slice(0, 7);
      finalReport.aiAdvice = await getAiAdvice(issuesForAi);
    } else {
      console.log("✅ საიტი მწვანე ზონაშია.");
      finalReport.aiAdvice = "თქვენი საიტი მშვენივრად მუშაობს!";
    }

    await browser.close();
    return finalReport;
  } catch (error) {
    console.error("❌ შეცდომა:", error.message);
    if (browser) await browser.close();
  }
}
