import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runFullFlow } from "./Flows/mainFlow.js";
import { keywords } from "./keywords.js";
import lookupRoutes from "./routes/lookupRoutes.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const EMAIL = process.env.EMAIL_USER;

// API key required for all requests
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// API routes
app.use("/api", lookupRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Scraping API running on port ${PORT}`);
});

// Optional: background scraping (runs in parallel)
// (async () => {
//   console.log("Background scraping started");
//   for (const keyword of keywords) {
//     await runFullFlow(keyword, EMAIL);
//   }
// })();
