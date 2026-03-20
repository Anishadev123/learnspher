import express from "express";
import { createStudyMaterial, getUserMaterials } from "../controllers/studyMaterialController.js";
import { verifyFirebaseToken } from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();

router.post("/create", verifyFirebaseToken, createStudyMaterial);
router.get("/my-materials", verifyFirebaseToken, getUserMaterials);

export default router;
