import express from 'express';
import StudySession from '../models/StudySession.js';

const router = express.Router();

// ─── POST /api/tracking/session ─── Save a NEW study session
router.post('/session', async (req, res) => {
  try {
    const {
      userId, notebookId, materialId, startedAt, endedAt,
      inAppTime, externalTime, idleTime, totalTime,
      activities, productivityScore, page
    } = req.body;

    if (!userId || !startedAt) {
      return res.status(400).json({ ok: false, error: 'userId and startedAt are required' });
    }

    // Ignore sessions shorter than 10 seconds
    if (totalTime < 10) {
      return res.json({ ok: true, skipped: true, reason: 'Session too short (<10s)' });
    }

    const session = await StudySession.create({
      userId, notebookId, materialId, startedAt, endedAt,
      inAppTime: Math.round(inAppTime || 0),
      externalTime: Math.round(externalTime || 0),
      idleTime: Math.round(idleTime || 0),
      totalTime: Math.round(totalTime || 0),
      activities: activities || {},
      productivityScore: Math.round(productivityScore || 0),
      page: page || 'ai_studio'
    });

    console.log(`📊 Study session CREATED: ${Math.round(totalTime)}s for user ${userId} → ${session._id}`);
    res.json({ ok: true, sessionId: session._id });
  } catch (err) {
    console.error('❌ Tracking save error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── PUT /api/tracking/session/:id ─── Update an existing session (auto-save / final flush)
router.put('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      endedAt, inAppTime, externalTime, idleTime, totalTime,
      activities, productivityScore
    } = req.body;

    const updateData = {
      endedAt: endedAt || new Date().toISOString(),
      inAppTime: Math.round(inAppTime || 0),
      externalTime: Math.round(externalTime || 0),
      idleTime: Math.round(idleTime || 0),
      totalTime: Math.round(totalTime || 0),
      productivityScore: Math.round(productivityScore || 0),
    };

    // Update activities if provided
    if (activities) {
      updateData.activities = activities;
    }

    const session = await StudySession.findByIdAndUpdate(id, updateData, { new: true });

    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }

    console.log(`📊 Study session UPDATED: ${Math.round(totalTime)}s → ${id}`);
    res.json({ ok: true, sessionId: session._id });
  } catch (err) {
    console.error('❌ Tracking update error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── POST /api/tracking/session/:id (sendBeacon fallback — sendBeacon can only POST) ───
router.post('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      endedAt, inAppTime, externalTime, idleTime, totalTime,
      activities, productivityScore
    } = req.body;

    const updateData = {
      endedAt: endedAt || new Date().toISOString(),
      inAppTime: Math.round(inAppTime || 0),
      externalTime: Math.round(externalTime || 0),
      idleTime: Math.round(idleTime || 0),
      totalTime: Math.round(totalTime || 0),
      productivityScore: Math.round(productivityScore || 0),
    };

    if (activities) {
      updateData.activities = activities;
    }

    const session = await StudySession.findByIdAndUpdate(id, updateData, { new: true });

    if (!session) {
      // If session not found, create a new one (edge case)
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }

    console.log(`📊 Study session UPDATED (beacon): ${Math.round(totalTime)}s → ${id}`);
    res.json({ ok: true, sessionId: session._id });
  } catch (err) {
    console.error('❌ Tracking beacon update error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── GET /api/tracking/today/:userId ─── Today's study time
router.get('/today/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: startOfDay }
    });

    const totals = sessions.reduce((acc, s) => ({
      inAppTime: acc.inAppTime + (s.inAppTime || 0),
      externalTime: acc.externalTime + (s.externalTime || 0),
      idleTime: acc.idleTime + (s.idleTime || 0),
      totalTime: acc.totalTime + (s.totalTime || 0),
      messagesAsked: acc.messagesAsked + (s.activities?.messagesAsked || 0),
      sourcesOpened: acc.sourcesOpened + (s.activities?.sourcesOpened || 0),
      notesWritten: acc.notesWritten + (s.activities?.notesWritten || 0),
      summariesGenerated: acc.summariesGenerated + (s.activities?.summariesGenerated || 0),
      studyGuidesViewed: acc.studyGuidesViewed + (s.activities?.studyGuidesViewed || 0),
      sessionCount: acc.sessionCount + 1,
      avgScore: acc.avgScore + (s.productivityScore || 0),
    }), {
      inAppTime: 0, externalTime: 0, idleTime: 0, totalTime: 0,
      messagesAsked: 0, sourcesOpened: 0, notesWritten: 0,
      summariesGenerated: 0, studyGuidesViewed: 0,
      sessionCount: 0, avgScore: 0
    });

    if (totals.sessionCount > 0) {
      totals.avgScore = Math.round(totals.avgScore / totals.sessionCount);
    }

    res.json({ ok: true, ...totals });
  } catch (err) {
    console.error('❌ Tracking today error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── GET /api/tracking/stats/:userId ─── Weekly stats (last 7 days)
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: sevenDaysAgo }
    }).sort({ startedAt: 1 });

    // Group by day
    const dailyMap = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize all 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = {
        date: key,
        day: dayNames[d.getDay()],
        inAppTime: 0,
        externalTime: 0,
        idleTime: 0,
        totalTime: 0,
        sessionCount: 0,
        avgScore: 0,
        totalScore: 0
      };
    }

    // Fill with actual data
    sessions.forEach(s => {
      const key = new Date(s.startedAt).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].inAppTime += s.inAppTime;
        dailyMap[key].externalTime += s.externalTime;
        dailyMap[key].idleTime += s.idleTime;
        dailyMap[key].totalTime += s.totalTime;
        dailyMap[key].sessionCount += 1;
        dailyMap[key].totalScore += s.productivityScore || 0;
      }
    });

    // Calculate averages
    const weekly = Object.values(dailyMap).map(d => ({
      ...d,
      avgScore: d.sessionCount > 0 ? Math.round(d.totalScore / d.sessionCount) : 0
    }));

    // Total for the week
    const weekTotal = weekly.reduce((acc, d) => ({
      totalTime: acc.totalTime + d.totalTime,
      inAppTime: acc.inAppTime + d.inAppTime,
      externalTime: acc.externalTime + d.externalTime,
      sessionCount: acc.sessionCount + d.sessionCount,
    }), { totalTime: 0, inAppTime: 0, externalTime: 0, sessionCount: 0 });

    res.json({ ok: true, daily: weekly, weekTotal });
  } catch (err) {
    console.error('❌ Tracking stats error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── GET /api/tracking/streak/:userId ─── Current study streak
router.get('/streak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get distinct study days in last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: sixtyDaysAgo },
      totalTime: { $gte: 300 } // Only count sessions > 5 min
    }).select('startedAt').sort({ startedAt: -1 });

    // Get unique days
    const uniqueDays = new Set(
      sessions.map(s => new Date(s.startedAt).toISOString().split('T')[0])
    );

    // Count streak from today backwards
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (uniqueDays.has(key)) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken (skip today if not yet studied)
      }
    }

    res.json({ ok: true, streak, totalDays: uniqueDays.size });
  } catch (err) {
    console.error('❌ Tracking streak error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
