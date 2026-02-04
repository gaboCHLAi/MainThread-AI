// src/Controllers/searchEmails.js
export async function searchEmails(page) {
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const PRIORITY_PAGES = ["contact", "contact-us", "about", "about-us", "info"];

  const foundEmails = new Set();

  // 1️⃣ helper: extract emails from current page
  async function extractEmails() {
    // mailto:
    const mailtos = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="mailto:"]')).map((a) =>
        a.href.replace("mailto:", "").trim(),
      ),
    );

    mailtos.forEach((e) => foundEmails.add(e));

    // text emails
    const bodyText = await page.evaluate(() => document.body.innerText);
    const textEmails = bodyText.match(EMAIL_REGEX) || [];
    textEmails.forEach((e) => foundEmails.add(e));
  }

  try {
    // 2️⃣ collect all internal links
    const internalLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter((href) => href.startsWith(window.location.origin)),
    );

    // 3️⃣ find priority pages
    const priorityLinks = internalLinks.filter((link) =>
      PRIORITY_PAGES.some((p) => link.toLowerCase().includes(p)),
    );

    // 4️⃣ go through priority pages FIRST
    for (const link of priorityLinks) {
      console.log(`➡️ Checking priority page: ${link}`);
      await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 2000));
      await extractEmails();

      if (foundEmails.size > 0) break; // ❗ stop if found
    }

    // 5️⃣ fallback: check current page if nothing found
    if (foundEmails.size === 0) {
      console.log("ℹ️ No priority emails found, checking current page");
      await extractEmails();
    }

    const result = [...foundEmails];
    console.log(`📧 Found emails: ${result.join(", ") || "none"}`);
    return result;
  } catch (err) {
    console.error("❌ Error in searchEmails:", err.message);
    return [];
  }
}
