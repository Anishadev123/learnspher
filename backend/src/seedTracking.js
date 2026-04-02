/**
 * 🌱 Seed Script — Study Tracking Data
 *
 * Usage:
 *   node src/seedTracking.js
 *
 * Auto-detects the first user from MongoDB and seeds 7 days
 * of realistic study session data for the dashboard analytics.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import StudySession from "./models/StudySession.js";

// Import User model from the main backend (not src)
const UserSchema = new mongoose.Schema({
  uid: String,
  email: String,
  name: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// ─── Helpers ───
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Generate sessions for a given day ───
function generateSessionsForDay(userId, date) {
  const sessions = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const sessionCount = isWeekend ? rand(1, 2) : rand(2, 4);
  const pages = ["ai_studio", "study_material", "ai_studio", "ai_studio"];

  for (let s = 0; s < sessionCount; s++) {
    const hour = rand(8, 22);
    const minute = rand(0, 59);

    const startedAt = new Date(date);
    startedAt.setHours(hour, minute, rand(0, 59), 0);

    const durationMin = rand(5, 90);
    const endedAt = new Date(startedAt.getTime() + durationMin * 60 * 1000);

    const inAppTime = rand(durationMin * 30, durationMin * 50);
    const externalTime = rand(0, durationMin * 10);
    const idleTime = rand(0, durationMin * 8);
    const totalTime = inAppTime + externalTime;

    const messagesAsked = rand(0, 8);
    const sourcesOpened = rand(0, 4);
    const notesWritten = rand(0, 3);
    const summariesGenerated = rand(0, 2);
    const studyGuidesViewed = rand(0, 1);

    // External clicks
    const externalClicks = [];
    const extClickCount = rand(0, 3);
    for (let e = 0; e < extClickCount; e++) {
      const isYT = Math.random() > 0.4;
      const leftAt = new Date(startedAt.getTime() + rand(60, durationMin * 30) * 1000);
      const clickDuration = rand(30, 600);
      const returnedAt = new Date(leftAt.getTime() + clickDuration * 1000);
      externalClicks.push({
        type: isYT ? "youtube" : "website",
        url: isYT
          ? `https://www.youtube.com/watch?v=${pick(["dQw4w9WgXcQ", "jNQXAC9IVRw", "9bZkp7q19f0", "kJQP7kiw5Fk", "3tmd-ClpJxA"])}`
          : `https://${pick(["docs.python.org", "developer.mozilla.org", "stackoverflow.com", "medium.com", "en.wikipedia.org"])}/article-${rand(100, 999)}`,
        leftAt,
        returnedAt,
        duration: clickDuration,
      });
    }

    // Productivity score (mirrors useStudyTracker logic)
    let base = 0;
    if (inAppTime >= 3600) base = 45;
    else if (inAppTime >= 1800) base = 35;
    else if (inAppTime >= 900) base = 20;
    else if (inAppTime >= 300) base = 10;

    const msgBonus = Math.min(messagesAsked * 3, 15);
    const srcBonus = Math.min(sourcesOpened * 2, 10);
    const noteBonus = Math.min(notesWritten * 5, 15);
    const sumBonus = Math.min((summariesGenerated + studyGuidesViewed) * 5, 10);
    const extBonus = Math.min(externalClicks.length * 2, 6);
    const totalSession = inAppTime + externalTime + idleTime;
    const idlePenalty = totalSession > 0 && idleTime / totalSession > 0.5 ? 10 : 0;
    const productivityScore = Math.max(0, Math.min(100, base + msgBonus + srcBonus + noteBonus + sumBonus + extBonus - idlePenalty));

    sessions.push({
      userId,
      notebookId: null,
      materialId: null,
      startedAt,
      endedAt,
      inAppTime,
      externalTime,
      idleTime,
      totalTime,
      activities: {
        messagesAsked,
        sourcesOpened,
        notesWritten,
        summariesGenerated,
        studyGuidesViewed,
        externalClicks,
      },
      productivityScore,
      page: pick(pages),
    });
  }

  return sessions;
}

// ─── Main ───
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Auto-detect user
    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) {
      console.error("❌ No users found in the database. Please sign in to the app first.");
      process.exit(1);
    }

    const userId = user.uid;
    console.log(`👤 Found user: ${user.name || user.email || userId}`);
    console.log(`   UID: ${userId}\n`);

    // Clear existing sessions for this user
    const deleted = await StudySession.deleteMany({ userId });
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing sessions\n`);

    const allSessions = [];

    // Generate 7 days of data (today + 6 past days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const daySessions = generateSessionsForDay(userId, date);
      allSessions.push(...daySessions);

      const dayName = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const totalMin = Math.round(daySessions.reduce((sum, s) => sum + s.totalTime, 0) / 60);
      const avgScore = Math.round(daySessions.reduce((sum, s) => sum + s.productivityScore, 0) / daySessions.length);

      console.log(`📅 ${dayName}: ${daySessions.length} sessions, ~${totalMin} min, avg score ${avgScore}`);
    }

    // Insert all sessions
    await StudySession.insertMany(allSessions);

    // Summary
    const totalMinutes = Math.round(allSessions.reduce((sum, s) => sum + s.totalTime, 0) / 60);
    const avgOverall = Math.round(allSessions.reduce((sum, s) => sum + s.productivityScore, 0) / allSessions.length);

    console.log(`\n🎉 Seeded ${allSessions.length} study sessions!`);
    console.log(`   Total study time: ~${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`);
    console.log(`   Average productivity: ${avgOverall}/100`);
    console.log(`\n📊 Open the Dashboard to see your analytics widget!`);

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Done.");
  }
}

seed();
