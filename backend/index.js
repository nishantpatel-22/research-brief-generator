// ============================================================
// index.js — Express server entry point
// ============================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const briefRoutes = require("./routes/briefs");
const statusRoutes = require("./routes/status");
const { initDB } = require("./db/database");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/briefs", briefRoutes);
app.use("/api/status", statusRoutes);

// Root health check
app.get("/", (req, res) => res.json({ message: "Research Brief API is running" }));

// ── Start server ─────────────────────────────────────────────
async function start() {
  await initDB(); // Set up SQLite tables on first run
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

start();
