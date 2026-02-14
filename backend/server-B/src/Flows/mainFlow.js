import { getBrowser, closeBrowser } from "../Controllers/browser.js";
import { searchLinks } from "../Controllers/searchLinks.js";
import { searchEmails } from "../Controllers/searchEmails.js";
import { auditSite } from "../Controllers/analyzer/lighthouseAudit.js";
import { sendEmail } from "../Controllers/emailSender.js";
import { detectPlatform } from "../Controllers/detectPlatform.js";
import { auditSecurity } from "../Controllers/analyzer/securityAudit.js";
import { getAiAdvice } from "../Controllers/getAiAdvice.js";

export async function runFullFlow(keyword, EMAIL) {
  const browser = await getBrowser();
  const batchSize = 5;
  const SitesResults = [];

  const mainPage = await browser.newPage();

  try {
    console.log("🚀 Searching for links...");
    const rawLinks = await searchLinks(mainPage, keyword, { debug: true });
    await mainPage.close();

    // 🛡️ ნაბიჯი 1: დუბლიკატების ფილტრი (რომ NASA-ს 15 ლინკიდან მხოლოდ 1 აიღოს)
    const seenDomains = new Set();
    const links = rawLinks.filter((url) => {
      try {
        const domain = new URL(url).hostname.replace("www.", "");
        if (seenDomains.has(domain)) {
          console.log(`⏭️ Skipping duplicate domain: ${domain}`);
          return false;
        }
        seenDomains.add(domain);
        return true;
      } catch (e) {
        return false;
      }
    });

    if (links.length === 0) {
      console.log(`❌ No unique links found for "${keyword}"`);
      return;
    }

    console.log(`🎯 Found ${links.length} unique sites to analyze.`);

    // 🔄 ლინკების დამუშავება ჯგუფებად
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      console.log(`📦 Processing batch: ${i / batchSize + 1}`);

      await Promise.all(
        batch.map(async (url) => {
          const newPage = await browser.newPage();
          try {
            console.log(`🔍 Analyzing: ${url}`);

            await newPage.goto(url, {
              waitUntil: "networkidle2",
              timeout: 60000,
            });

            // მეილის პოვნა (შეიძლება სხვა გვერდზე გადავიდეს)
            const emails = await searchEmails(newPage);
            if (!emails || emails.length === 0) {
              console.log(`📧 No emails for ${url}, skipping...`);
              return;
            }

            // 🏠 აუდიტამდე ვაბრუნებთ მთავარ გვერდზე (რომ ზუსტი პერფორმანსი დათვალოს)
            if (newPage.url() !== url) {
              await newPage.goto(url, {
                waitUntil: "networkidle2",
                timeout: 30000,
              });
            }

            // Lighthouse აუდიტი
            let audit = {
              success: false,
              mobileScores: null,
              desktopScores: null,
              issuesForAi: [],
            };
            try {
              audit = await auditSite(newPage, url);
            } catch (lhError) {
              console.warn(`⚠️ Lighthouse failed for ${url}`);
            }

            const securityData = await auditSecurity(url, newPage);
            const detect = await detectPlatform(url, newPage);

            const isProblematic = audit.success && (
              (audit.mobileScores?.performance < 90) || 
              (audit.desktopScores?.performance < 90) ||
              (audit.issuesForAi.length > 0)
            );

            if (isProblematic) {
              SitesResults.push({
                url,
                emails: emails.slice(0, 2),
                detect,
                // გადავაწოდოთ ორივე ქულა AI-სთვის
                mobileScores: audit.mobileScores,
                desktopScores: audit.desktopScores,
                issues: audit.issuesForAi,
                securityData,
              });
            }
          } catch (error) {
            console.error(`⚠️ Error processing ${url}:`, error.message);
          } finally {
            await newPage.close();
          }
        }),
      );
    }

    // 🤖 ნაბიჯი 2: AI ანალიზი და ინდივიდუალური მეილები
    if (SitesResults.length > 0) {
      console.log("🤖 Asking AI for batch advice (JSON mode)...");

      const aiResponses = await getAiAdvice(SitesResults);
      

      for (const response of aiResponses) {
        const originalData = SitesResults.find((s) => s.url === response.url);
        const targetEmail = originalData ? originalData.emails[0] : EMAIL;

        const emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #d9534f;">🛠️ რეკომენდაცია საიტისთვის: ${response.url}</h2>
            <p style="font-size: 16px; line-height: 1.5;">${response.advice}</p>
            <hr>
            <p style="color: #888;">ეს ანალიზი მომზადებულია სპეციალურად თქვენთვის.</p>
          </div>
        `;

        await sendEmail({
          to: EMAIL,
          subject: `🚨 პრობლემები აღმოჩენილია საიტზე: ${response.url}`,
          html: emailHtml,
        });

        console.log(`📧 Email sent to ${EMAIL} for ${response.url}`);
        return response;
      }
    } else {
      console.log("✅ No problematic sites found.");
    }
  } catch (error) {
    console.error("❌ Error in full flow:", error);
  } finally {
    // ✅ გადავაწოდოთ კონკრეტული ბრაუზერი დასახურად
    if (browser) {
      await closeBrowser(browser);
      console.log("🛑 Global Browser closed safely");
    }
  }
}
