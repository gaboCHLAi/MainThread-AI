// src/Flows/mainFlow.js
import { getBrowser, closeBrowser } from "../Controllers/browser.js";
import { searchLinks } from "../Controllers/searchLinks.js";
import { searchEmails } from "../Controllers/searchEmails.js";
import { auditSite } from "../Controllers/analyzer.js";
import { sendEmail } from "../Controllers/emailSender.js";

export async function runFullFlow(keyword, recipientEmail) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // 1️⃣ Google search → links
    const links = await searchLinks(page, keyword);

    if (links.length === 0) {
      console.log(`❌ No links found for "${keyword}"`);
      return;
    }

    // 2️⃣ თითოეული ლინკის ანალიზი
    for (const url of links) {
      console.log(`🔍 Analyzing: ${url}`);

      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      const audit = await auditSite(page, url);
      const emails = await searchEmails(page);

      // 3️⃣ ფილტრი — მხოლოდ პრობლემური საიტები
      if (audit.red.length > 0 || audit.scores.performance < 90) {
        const emailHtml = `
          <h2>Audit Report</h2>
          <p><b>URL:</b> ${url}</p>
          <p><b>Scores:</b> ${JSON.stringify(audit.scores)}</p>
          <p><b>AI Advice:</b> ${audit.aiAdvice}</p>
          <p><b>Found Emails:</b> ${emails.join(", ") || "none"}</p>
        `;

        await sendEmail({
          to: recipientEmail,
          subject: `🚨 Site needs fixes: ${url}`,
          html: emailHtml,
        });
      } else {
        console.log("✅ Site is healthy, skipped email");
      }
    }

    console.log("✅ Full flow finished successfully");
  } catch (error) {
    console.error("❌ Error in full flow:", error);
  } finally {
    await page.close();
    await closeBrowser();
  }
}
