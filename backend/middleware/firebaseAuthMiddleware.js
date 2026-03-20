// middleware/firebaseAuthMiddleware.js
import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decoded;

    let user = await User.findOne({ uid });
    if (!user) user = await User.create({ uid, email, name });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
