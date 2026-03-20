// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // connect DB
import "./config/firebaseAdmin.js"; // init firebase admin
import studyMaterialRoutes from "./routes/studyMaterialRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // your frontend origin
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/study", studyMaterialRoutes);
// Routes
import audioRoutes from "./routes/tools/audio.js";
import studyMaterialRoutesTools from "./routes/tools/studyGuide.js";
import reportRoutes from "./routes/tools/report.js";
import summaryPdfRoutes from "./routes/tools/summaryPdf.js";

app.use("/api/tools/audio", audioRoutes);
app.use("/api/tools/study", studyMaterialRoutesTools);
app.use("/api/tools/report", reportRoutes);
app.use("/api/tools/summary-pdf", summaryPdfRoutes);



app.listen(5000, () => console.log("🚀 Server running on port 5000"));
