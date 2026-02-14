import express from "express";
import { analyzeURL } from "../controllers/analyzeURL.js";
const router = express.Router();

router.post("/analyze", analyzeURL);

export default router;
