// src/Controllers/searchEmails.js
export async function searchEmails(page) {
  try {
    const bodyText = await page.evaluate(() => document.body.innerText);

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = bodyText.match(emailRegex) || [];
    const uniqueEmails = [...new Set(emails)];

    console.log(`📧 Found emails: ${uniqueEmails.join(", ") || "none"}`);
    return uniqueEmails;
  } catch (error) {
    console.error("❌ Error in searchEmails:", error);
    return [];
  }
}
