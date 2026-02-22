import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";

// Resolve file path so the Worker can load this same file
const __filename = fileURLToPath(import.meta.url);

/**
 * Run Lighthouse audit in the given mode (mobile or desktop)
 */
async function runAudit(url, mode) {
  // If we are on the main thread, run the audit in a Worker
  if (isMainThread) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { url, mode },
      });

      worker.on("message", (data) => {
        if (data.success) resolve(data.result);
        else reject(new Error(data.error));
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  // Code below runs only inside the Worker
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--remote-debugging-port=0",
      ],
    });

    const endpoint = browser.wsEndpoint();
    const port = parseInt(new URL(endpoint).port);

    const options = {
      port: port,
      logLevel: "silent",
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor: mode,
      screenEmulation:
        mode === "mobile"
          ? {
              mobile: true,
              width: 390,
              height: 844,
              deviceScaleFactor: 3,
              disabled: false,
            }
          : {
              mobile: false,
              width: 1350,
              height: 940,
              deviceScaleFactor: 1,
              disabled: false,
            },
      throttlingMethod: "simulate",
      throttling: {
        cpuSlowdownMultiplier: mode === "mobile" ? 4 : 1,
      },
      disableFullPageScreenshot: true,
      disableStorageReset: false,
    };

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

    const processedAudits = Object.values(resultData.audits)
      .filter((audit) => audit.score !== null)
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        value:
          audit.displayValue ||
          (audit.numericValue ? `${Math.round(audit.numericValue)}` : "Issue"),
        score: audit.score,
        description:
          audit.description?.replace(/\[Learn more\]\(.*\).*/g, "") || "",
      }));

    return { scores, audits: processedAudits };
  } catch (error) {
    throw error;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Full parallel audit (Mobile + Desktop)
 */
export async function auditSite(url) {
  console.log(`Lighthouse audit started: ${url}`);

  try {
    // Run mobile and desktop audits in parallel (each in its own Worker)
    const [mobileResults, desktopResults] = await Promise.all([
      runAudit(url, "mobile"),
      runAudit(url, "desktop"),
    ]);

    const redIssues = [
      ...mobileResults.audits.filter((a) => a.score < 0.5),
      ...desktopResults.audits.filter((a) => a.score < 0.5),
    ];

    console.log("Lighthouse audit finished (parallel mode)");

    return {
      success: true,
      mobileScores: mobileResults.scores,
      desktopScores: desktopResults.scores,
      mobileAudits: mobileResults.audits.filter((a) => a.score < 0.9),
      desktopAudits: desktopResults.audits.filter((a) => a.score < 0.9),
      issuesForAi: redIssues,
    };
  } catch (error) {
    console.error("❌ Lighthouse audit error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Worker entry: run audit and send result back to main thread
if (!isMainThread) {
  runAudit(workerData.url, workerData.mode)
    .then((result) => parentPort.postMessage({ success: true, result }))
    .catch((error) =>
      parentPort.postMessage({ success: false, error: error.message }),
    );
}
