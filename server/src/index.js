import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import { ensureSchema, pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ ok: true, db: true });
  } catch {
    return res.status(503).json({ ok: false, db: false });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Copy server/.env.example to server/.env");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error("JWT_SECRET must be set to a string at least 16 characters");
    process.exit(1);
  }
  await ensureSchema();
  app.listen(port, () => {
    console.log(`AlgoLens API http://localhost:${port}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
