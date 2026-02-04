// src/Controllers/searchLinks.js
export async function searchLinks(page, keyword, maxResults = 1) {
  const links = [];

  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(
      keyword,
    )}&ia=web`;

    console.log("🔍 DuckDuckGo search:", keyword);

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // პატარა human delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const results = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("a[data-testid='result-title-a']"),
      )
        .map((a) => a.href)
        .filter(
          (href) =>
            href && href.startsWith("http") && !href.includes("duckduckgo.com"),
        );
    });

    links.push(...results.slice(0, maxResults));
  } catch (err) {
    console.log("❌ DuckDuckGo error:", err.message);
  }

  return [...new Set(links)];
}
