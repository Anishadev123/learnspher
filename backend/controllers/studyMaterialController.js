import StudyMaterial from "../models/StudyMaterial.js";
import { generateStudyMaterial } from "../service/llmService.js";

export const createStudyMaterial = async (req, res) => {
  try {
    const input = req.body;
    const firebaseUid = req.user.uid; // ✅ extracted from Firebase token

    const aiOutput = await generateStudyMaterial(input);

    const newMaterial = new StudyMaterial({
      firebaseUid,
      ...input,
      output: aiOutput,
    });

    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate study material" });
  }
};

export const getUserMaterials = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const materials = await StudyMaterial.find({ firebaseUid }).sort({ createdAt: -1 });
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};
