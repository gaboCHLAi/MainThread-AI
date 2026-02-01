import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  throw new Error("❌ გთხოვთ დააყენოთ GEMINI_API_KEY .env-ში");
}

// შექმენი AI ინსტანსი
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * issues: array of Lighthouse audits (objects with title, value, score)
 * ამ ფუნქციას აბრუნებს AI-ს რჩევებს ქართულად
 */
export default async function getAiAdvice(issues) {
  if (!issues || issues.length === 0) {
    return "არ არსებობს გამოსასწორებელი საკითხები.";
  }

  const issuesSummary = issues
    .map((i) => `- ${i.title}: ${i.value}`)
    .join("\n");

  const prompt = `Lighthouse-ის ხარვეზებია:\n${issuesSummary}\n
  გთხოვ, ამიხსენი ქართულად რა უნდა გამოვასწორო, მოკლედ, გასაგებად.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // მუშა მოდელი უფასო/სტანდარტ key-ზე
      contents: prompt,
    });
    // response.text შეიცავს AI პასუხს
    return response.text;
  } catch (error) {
    console.error("❌ Gemini შეცდომა:", error.message);
    return "AI ანალიზი ვერ მოხერხდა.";
  }
}
