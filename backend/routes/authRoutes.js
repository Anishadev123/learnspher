import express from "express";
import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decoded;

    // Save or find user in MongoDB
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, name });
    }

    res.status(200).json({
      message: "User verified",
      user: { uid: user.uid, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Firebase verification failed:", err.message);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

export default router;
