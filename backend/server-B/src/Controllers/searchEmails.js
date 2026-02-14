// src/Controllers/searchEmails.js
export async function searchEmails(page) {
  const EMAIL_REGEX =
    /\b[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}\b/g;

  const PERSONAL_EMAIL_REGEX = /^[a-z]+\.[a-z]+@/i;

  const OWNER_KEYWORDS = [
    "info",
    "contact",
    "hello",
    "admin",
    "office",
    "business",
    "sales",
    "support",
    "inquiries",
    "media",
  ];

  const PRIORITY_PAGES = ["contact", "contact-us", "about", "about-us", "info"];

  const foundEmails = new Set();

  function cleanEmail(email) {
    return email
      .replace(/^mailto:/i, "")
      .split("?")[0]
      .trim()
      .toLowerCase();
  }

  function isOwnerLikeEmail(email) {
    if (PERSONAL_EMAIL_REGEX.test(email)) return false;
    if (email.includes("gmail.com")) return false;
    if (email.includes("yahoo.com")) return false;
    if (email.includes("outlook.com")) return false;

    return OWNER_KEYWORDS.some((k) => email.includes(k));
  }

  async function extractEmails() {
    // mailto links
    const mailtos = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(
        (a) => a.href,
      ),
    );

    for (const raw of mailtos) {
      const email = cleanEmail(raw);
      if (EMAIL_REGEX.test(email) && isOwnerLikeEmail(email)) {
        foundEmails.add(email);
      }
    }

    // text emails
    const bodyText = await page.evaluate(() => document.body.innerText);
    const textEmails = bodyText.match(EMAIL_REGEX) || [];

    for (const raw of textEmails) {
      const email = cleanEmail(raw);
      if (isOwnerLikeEmail(email)) {
        foundEmails.add(email);
      }
    }
  }

  try {
    // collect internal links (supports relative URLs)
    const internalLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.getAttribute("href"))
        .filter(Boolean)
        .map((href) => new URL(href, window.location.origin).href)
        .filter((href) => href.startsWith(window.location.origin)),
    );

    // priority pages first
    const priorityLinks = internalLinks.filter((link) =>
      PRIORITY_PAGES.some((p) => link.toLowerCase().includes(p)),
    );

    for (const link of priorityLinks) {
      console.log(`➡️ Checking priority page: ${link}`);
      await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await extractEmails();

      if (foundEmails.size > 0) {
        console.log("✅ Owner-like email found, stopping search");
        break;
      }
    }

    // fallback: current page
    if (foundEmails.size === 0) {
      console.log(
        "ℹ️ No owner email found on priority pages, checking homepage",
      );
      await extractEmails();
    }

    const result = [...foundEmails];
    console.log(`📧 Final emails: ${result.join(", ") || "none"}`);
    return result;
  } catch (err) {
    console.error("❌ Error in searchEmails:", err.message);
    return [];
  }
}
