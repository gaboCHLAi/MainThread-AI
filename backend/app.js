import express from "express";
import cors from "cors";
import getAiAdvice from "./getAiAdvice.js";
import { runAudit } from "./analyzer.js";
const app = express();
app.use(cors());
app.use(express.json());

// შევცვალოთ GET -> POST-ით
app.post("/analyze", async (req, res) => {
  try {
    // 1. ვიღებთ URL-ს, რომელიც React-დან მოვიდა
    const { url } = req.body;
    console.log(`🔎 ანალიზი დაიწყო საიტისთვის: ${url}`);

    if (!url) {
      return res.status(400).json({ error: "URL აუცილებელია" });
    }

    const report = await runAudit(url);
    // 4. ვაბრუნებთ პასუხს
    res.json(report);
  } catch (error) {
    console.error("❌ შეცდომა ბექენდზე:", error);
    res.status(500).json({ error: "ანალიზი ვერ მოხერხდა" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
