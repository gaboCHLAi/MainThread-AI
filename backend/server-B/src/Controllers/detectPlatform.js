export async function detectPlatform(url, page) {
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    const html = await page.content();

    const result = {
      cms: "Unknown",
      frontend: [],
      backend: [],
      libraries: [],
    };

    /* ---------------- CMS Detection ---------------- */

    if (/wp-content|wp-includes/.test(html)) result.cms = "WordPress";
    else if (/cdn\.shopify\.com/.test(html)) result.cms = "Shopify";
    else if (/\/templates\/|\/components\//.test(html)) result.cms = "Joomla";
    else if (/wix\.com/.test(html)) result.cms = "Wix";
    else if (/drupal\.org/.test(html)) result.cms = "Drupal";
    else if (/squarespace\.com/.test(html)) result.cms = "Squarespace";

    /* ---------------- Frontend ---------------- */

    if (/React\.createElement|data-reactroot/.test(html))
      result.frontend.push("React");

    if (/new Vue\(|id="app"/.test(html)) result.frontend.push("Vue");

    if (/ng-app/.test(html)) result.frontend.push("Angular");

    if (/jQuery/.test(html)) result.frontend.push("jQuery");

    /* ---------------- CSS Libraries ---------------- */

    if (/bootstrap/i.test(html)) result.libraries.push("Bootstrap");
    if (/tailwind/i.test(html)) result.libraries.push("TailwindCSS");

    /* ---------------- Server Headers ---------------- */

    const headers = response?.headers() || {};
    const serverHeader = headers["server"]?.toLowerCase() || "";

    if (/apache/.test(serverHeader) || html.includes("PHP"))
      result.backend.push("PHP");

    if (/nginx/.test(serverHeader)) result.backend.push("Nginx");

    if (/asp\.net/.test(html)) result.backend.push("ASP.NET");

    if (/express/.test(html)) result.backend.push("Node.js");

    if (/django/.test(html)) result.backend.push("Python/Django");

    return result;
  } catch (err) {
    console.error("Puppeteer detect failed:", err.message);
    return {
      cms: "Unknown",
      frontend: [],
      backend: [],
      libraries: [],
    };
  }
}
