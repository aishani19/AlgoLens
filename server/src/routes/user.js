import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const ALLOWED_TOPICS = new Set([
  "arrays",
  "linked-list",
  "string",
  "stack",
  "queue",
  "recursion",
  "dynamic-programming",
]);

router.get("/progress", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT topic_id, progress_json, updated_at FROM user_topic_progress WHERE user_id = $1`,
      [req.userId]
    );
    const byTopic = {};
    for (const row of result.rows) {
      byTopic[row.topic_id] = row.progress_json;
    }
    return res.json({ progress: byTopic });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load progress" });
  }
});

router.put("/progress/:topicId", requireAuth, async (req, res) => {
  const { topicId } = req.params;
  if (!ALLOWED_TOPICS.has(topicId)) {
    return res.status(400).json({ error: "Unknown topic" });
  }
  const progress = req.body?.progress;
  if (progress === undefined || typeof progress !== "object" || Array.isArray(progress)) {
    return res.status(400).json({ error: "progress must be a JSON object" });
  }
  try {
    await pool.query(
      `INSERT INTO user_topic_progress (user_id, topic_id, progress_json)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (user_id, topic_id)
       DO UPDATE SET progress_json = EXCLUDED.progress_json, updated_at = NOW()`,
      [req.userId, topicId, JSON.stringify(progress)]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to save progress" });
  }
});

export default router;
