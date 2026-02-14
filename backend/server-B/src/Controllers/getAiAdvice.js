import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  throw new Error("❌ გთხოვთ დააყენოთ GEMINI_API_KEY .env-ში");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getAiAdvice(SitesResults) {
  if (!SitesResults || SitesResults.length === 0) return [];

  try {
    // მოდელი შევცვალე სტაბილურ ვერსიაზე (1.5-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const sitesSummary = SitesResults.map((s) => {
      // ვამზადებთ მობილურის ხარვეზების ტექსტს
      const mAudits = s.result.mobileAudits
        ? s.result.mobileAudits.map((a) => `${a.title} (${a.value})`).join(", ")
        : "მონაცემები არ არის";

      // ვამზადებთ დესკტოპის ხარვეზების ტექსტს
      const dAudits = s.result.desktopAudits
        ? s.result.desktopAudits
            .map((a) => `${a.title} (${a.value})`)
            .join(", ")
        : "მონაცემები არ არის";

      const security = JSON.stringify(s.result.security);

      return `
        URL: ${s.url}
        --- MOBILE DATA ---
        Scores: ${JSON.stringify(s.result.mobile)}
        Issues: ${mAudits}
        
        --- DESKTOP DATA ---
        Scores: ${JSON.stringify(s.result.desktop)}
        Issues: ${dAudits}
        
        --- SECURITY ---
        Data: ${security}
      `;
    }).join("\n\n");

    const prompt = `შენ ხარ პროფესიონალი ვებ-ანალიტიკოსი. 
      გაანალიზე მოწოდებული მონაცემები და თითოეული საიტისთვის დაწერე ორი განსხვავებული რეკომენდაცია: 
      ერთი სპეციალურად მობილური ვერსიისთვის და მეორე დესკტოპისთვის.

      გაითვალისწინე: 
      - მობილურზე ყურადღება გაამახვილე სისწრაფესა და Throttling-ზე (cpuSlowdown).
      - დესკტოპზე ყურადღება გაამახვილე დიდ ეკრანზე გამოჩენილ ხარვეზებზე.
      - უსაფრთხოების ხარვეზები ახსენე ორივე ანალიზში, თუ ისინი კრიტიკულია.

      დააბრუნე პასუხი მხოლოდ JSON მასივის ფორმატში:
      [{
        "url": "საიტის ლინკი",
        "mobileAdvice": "ანალიზი ქართულად მობილურის ხარვეზებზე დაყრდნობით",
        "desktopAdvice": "ანალიზი ქართულად დესკტოპის ხარვეზებზე დაყრდნობით"
      }]

      მონაცემები:
      ${sitesSummary}`;

    console.log("🤖 AI იწყებს ანალიზს...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // ვუბრუნებთ დაპარსულ მასივს
    return JSON.parse(text);
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    // ვაბრუნებთ ცარიელ მასივს, რომ ციკლი (iterable) არ გაფუჭდეს
    return [];
  }
}
