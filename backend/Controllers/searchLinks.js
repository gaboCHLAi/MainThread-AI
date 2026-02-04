// src/Controllers/searchLinks.js
export async function searchLinks(page, keyword, maxResults = 10) {
  try {
    console.log(`🔎 Searching in Google: ${keyword}`);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    );

    await page.goto(
      `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      },
    );

    // პატარა delay — Google ნაკლებად გბლოკავს
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter(
          (href) =>
            href &&
            href.startsWith("http") &&
            !href.includes("google.") &&
            !href.includes("/search?"),
        );
    });

    const uniqueLinks = [...new Set(links)].slice(0, maxResults);

    console.log(`🔗 Found ${uniqueLinks.length} links`);

    return uniqueLinks;
  } catch (error) {
    console.error("❌ Error in searchLinks:", error.message);
    return [];
  }
}
