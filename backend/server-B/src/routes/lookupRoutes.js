import express from "express";
import { flowForUserRequest } from "../Flows/flowForUserRequest.js";
const router = express.Router();

router.post("/analyze", flowForUserRequest);

export default router;
