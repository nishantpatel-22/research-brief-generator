// ============================================================
// routes/status.js — System health check endpoint
//
// GET /api/status — returns health of server, DB, and LLM
// ============================================================
const express = require("express");
const router = express.Router();
const { queryOne } = require("../db/database");
const { checkGroqHealth } = require("../services/llm");

router.get("/", async (req, res) => {
  const status = {
    server: "ok",
    database: "unknown",
    llm: "unknown",
    timestamp: new Date().toISOString(),
  };

  // Check database connectivity
  try {
    queryOne("SELECT 1 as ok");
    status.database = "ok";
  } catch {
    status.database = "error";
  }

  // Check Groq LLM connectivity
  try {
    const llmOk = await checkGroqHealth();
    status.llm = llmOk ? "ok" : "error";
  } catch {
    status.llm = "error";
  }

  const allOk = Object.values(status).every((v) => v === "ok" || typeof v !== "string" || v === new Date().toISOString());
  res.status(status.database === "error" || status.llm === "error" ? 503 : 200).json(status);
});

module.exports = router;
