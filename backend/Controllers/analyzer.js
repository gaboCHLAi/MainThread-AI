// src/Controllers/audit.js
import getAiAdvice from "./getAiAdvice.js";
import lighthouse from "lighthouse";

export async function auditSite(page, url) {
  console.log(`🔎 ანალიზი დაიწყო საიტისთვის: ${url}...`);

  const options = {
    logLevel: "silent",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    // Port არ უნდა, რადგან Page უკვე გვაქვს
  };

  const runnerResult = await lighthouse(url, options);
  const resultData = runnerResult.lhr;

  const scores = {
    performance: Math.round(resultData.categories.performance.score * 100),
    accessibility: Math.round(resultData.categories.accessibility.score * 100),
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

  let aiAdvice = null;
  if (scores.performance < 90 || red.length > 0) {
    console.log("⚠️ აღმოჩენილია ხარვეზები. იწყება AI ანალიზი...");
    const issuesForAi = [...red, ...yellow].slice(0, 7);
    aiAdvice = await getAiAdvice(issuesForAi);
  } else {
    console.log("✅ საიტი მწვანე ზონაშია.");
    aiAdvice = "თქვენი საიტი მშვენივრად მუშაობს!";
  }

  return { scores, aiAdvice, red, yellow };
}
