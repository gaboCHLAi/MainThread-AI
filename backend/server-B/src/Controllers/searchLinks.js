export async function searchLinks(
  page,
  keyword,
  {
    maxResults = 1,
    waitUntil = "networkidle2", // შევცვალე უფრო საიმედოზე
    timeout = 60000,
    debug = false,
  } = {},
) {
  const BAD_DOMAINS = [
    "duckduckgo.com",
    "facebook.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "twitter.com",
    "wikipedia.org",
    "google.com",
  ];

  const BAD_EXTENSIONS = [".pdf", ".jpg", ".png", ".zip", ".doc", ".docx"];
  const links = [];

  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(keyword)}&ia=web`;

    if (debug) console.log("🔍 Searching:", searchUrl);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    );

    await page.goto(searchUrl, { waitUntil, timeout });

    // ✅ page.waitForTimeout-ის ნაცვლად ვიყენებთ ამას:
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 1500) + 1000),
    );

    // დაველოდოთ სანამ შედეგები გამოჩნდება (DuckDuckGo-სთვის ეს სელექტორი კარგია)
    try {
      await page.waitForSelector('a[data-testid="result-title-a"]', {
        timeout: 5000,
      });
    } catch (e) {
      if (debug)
        console.log(
          "⚠️ Could not find specific result selector, trying general extraction...",
        );
    }

    const results = await page.evaluate(
      (BAD_DOMAINS, BAD_EXTENSIONS) => {
        // DuckDuckGo-ს ძირითადი შედეგები ხშირად ამ ატრიბუტით მოდის
        const elements = Array.from(document.querySelectorAll("a[href]"));

        return elements
          .map((a) => a.href)
          .filter((href) => {
            if (!href || !href.startsWith("http")) return false;
            if (BAD_DOMAINS.some((d) => href.includes(d))) return false;
            if (BAD_EXTENSIONS.some((ext) => href.toLowerCase().endsWith(ext)))
              return false;

            // დამატებითი ფილტრი: DuckDuckGo-ს შიდა სერვისული ლინკები
            if (href.includes("/?q=") || href.includes("duckduckgo.com/t/"))
              return false;

            return href.length > 15;
          });
      },
      BAD_DOMAINS,
      BAD_EXTENSIONS,
    );

    const normalized = [
      ...new Set(results.map((url) => url.replace(/\/$/, "").toLowerCase())),
    ];

    links.push(...normalized.slice(0, maxResults));

    if (debug) console.log("✅ Links found:", links.length, links);
  } catch (err) {
    console.error("❌ DuckDuckGo error:", err.message);
  }

  return links;
}
