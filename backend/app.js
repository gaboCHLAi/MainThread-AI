import express from "express";
import cors from "cors";
import "dotenv/config"; // აი ეს დავამატეთ, რომ .env წაიკითხოს
import getAiAdvice from "./getAiAdvice.js";
import { runAudit } from "./analyzer.js";

const app = express();

// CORS-ის კონფიგურაცია (რომ ფრონტენდმა შეძლოს მოწერა)
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    console.log(`🔎 ანალიზი დაიწყო საიტისთვის: ${url}`);

    if (!url) {
      return res.status(400).json({ error: "URL აუცილებელია" });
    }

    const report = await runAudit(url);
    res.json(report);
  } catch (error) {
    console.error("❌ შეცდომა ბექენდზე:", error);
    res.status(500).json({ error: "ანალიზი ვერ მოხერხდა" });
  }
});

// !!! აი აქ არის მთავარი ცვლილება !!!
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
