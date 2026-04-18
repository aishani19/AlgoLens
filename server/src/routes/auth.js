import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "14d" });
}

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body || {};
  if (!email || !username || !password) {
    return res.status(400).json({ error: "email, username, and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      [email.trim().toLowerCase(), username.trim(), passwordHash]
    );
    const user = result.rows[0];
    const token = signToken(user.id);
    return res.status(201).json({ user: { id: user.id, email: user.email, username: user.username }, token });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Email or username already taken" });
    }
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const result = await pool.query(
      `SELECT id, email, username, password_hash FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(row.id);
    return res.json({
      user: { id: row.id, email: row.email, username: row.username },
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, email, username, created_at FROM users WHERE id = $1`,
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
