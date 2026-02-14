import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lookupRoutes from "./routes/lookupRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", lookupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`server runing on port ${PORT}`);
});
