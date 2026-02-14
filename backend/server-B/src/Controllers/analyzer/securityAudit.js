export async function auditSecurity(url, page) {
  const securityReport = {
    url,
    https: false,

    headers: {
      csp: false,
      hsts: false,
      xFrameOptions: false,
      xContentTypeOptions: false,
      referrerPolicy: false,
    },

    thirdPartyRequests: new Set(),
    consoleErrors: [],
    deprecatedAPIs: false,
    xssRisk: "unknown",
    score: 0,
  };

  try {
    /* -----------------------------
       Network & Console Monitoring
    ------------------------------*/
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        securityReport.consoleErrors.push(msg.text());
      }
    });

    page.on("request", (req) => {
      try {
        const reqUrl = new URL(req.url());
        const mainUrl = new URL(url);
        if (reqUrl.hostname !== mainUrl.hostname) {
          securityReport.thirdPartyRequests.add(reqUrl.hostname);
        }
      } catch {}
    });

    /* -----------------------------
       Navigation
    ------------------------------*/
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    if (!response) throw new Error("No response");

    /* -----------------------------
       HTTPS check
    ------------------------------*/
    securityReport.https = response.url().startsWith("https://");

    /* -----------------------------
       Security Headers
    ------------------------------*/
    const headers = response.headers();

    securityReport.headers.csp =
      !!headers["content-security-policy"] ||
      !!headers["content-security-policy-report-only"];

    securityReport.headers.hsts = !!headers["strict-transport-security"];

    securityReport.headers.xFrameOptions = !!headers["x-frame-options"];

    securityReport.headers.xContentTypeOptions =
      !!headers["x-content-type-options"];

    securityReport.headers.referrerPolicy = !!headers["referrer-policy"];

    /* -----------------------------
       Deprecated APIs
    ------------------------------*/
    securityReport.deprecatedAPIs = await page.evaluate(() => {
      return "ActiveXObject" in window || "attachEvent" in document;
    });

    /* -----------------------------
       XSS Heuristic Check
    ------------------------------*/
    const xssResult = await page.evaluate(() => {
      try {
        const test = document.createElement("div");
        test.innerHTML = `<svg><script>window.__xssExecuted = true</script></svg>`;
        document.body.appendChild(test);
        return window.__xssExecuted === true;
      } catch {
        return false;
      }
    });

    securityReport.xssRisk = xssResult ? "HIGH" : "LOW";

    /* -----------------------------
       Third-party count
    ------------------------------*/
    securityReport.thirdPartyRequests = securityReport.thirdPartyRequests.size;

    /* -----------------------------
       Security Score (0–100)
    ------------------------------*/
    let score = 0;
    if (securityReport.https) score += 20;
    if (securityReport.headers.csp) score += 20;
    if (securityReport.headers.hsts) score += 15;
    if (securityReport.headers.xFrameOptions) score += 10;
    if (securityReport.headers.xContentTypeOptions) score += 10;
    if (securityReport.headers.referrerPolicy) score += 5;
    if (!securityReport.deprecatedAPIs) score += 10;
    if (securityReport.xssRisk === "LOW") score += 10;

    securityReport.score = score;
    return securityReport;
  } catch (err) {
    console.error("❌ Audit failed:", err.message);
    return securityReport;
  }
}
