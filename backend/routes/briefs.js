// ============================================================
// routes/briefs.js — REST endpoints for research briefs
//
// POST /api/briefs/generate  — create a new brief
// GET  /api/briefs            — list last 5 briefs
// GET  /api/briefs/:id        — get a single brief by ID
// ============================================================
const express = require("express");
const router = express.Router();
const { extractMultiple } = require("../services/extractor");
const { generateBrief } = require("../services/llm");
const { runQuery, queryAll, queryOne } = require("../db/database");

// ── Validate URL format ──────────────────────────────────────
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ── POST /api/briefs/generate ────────────────────────────────
router.post("/generate", async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length < 1)
      return res.status(400).json({ error: "Provide an array of 1–10 URLs" });
    if (urls.length > 10)
      return res.status(400).json({ error: "Maximum 10 URLs allowed" });

    const invalidUrls = urls.filter((u) => !isValidUrl(u));
    if (invalidUrls.length > 0)
      return res.status(400).json({ error: "Invalid URLs detected", invalid: invalidUrls });

    // Step 1: Extract content from all URLs in parallel
    console.log(`⏳ Extracting content from ${urls.length} URLs...`);
    const extracted = await extractMultiple(urls);
    const successfulSources = extracted.filter((s) => !s.error && s.snippet);
    const failedSources = extracted.filter((s) => s.error);

    if (successfulSources.length === 0) {
      return res.status(422).json({
        error: "Could not extract content from any URL",
        details: failedSources.map((s) => ({ url: s.url, reason: s.error })),
      });
    }

    // Step 2: Send to LLM
    console.log(`⏳ Generating brief from ${successfulSources.length} sources...`);
    const { brief, error: llmError } = await generateBrief(successfulSources);
    if (llmError || !brief)
      return res.status(500).json({ error: "LLM generation failed", details: llmError });

    // Step 3: Save to SQLite
    const sourcesForDB = successfulSources.map((s) => ({
      url: s.url,
      title: s.title,
      snippet: s.snippet.substring(0, 500),
    }));

    const { lastInsertRowid } = runQuery(
      `INSERT INTO briefs (title, urls, brief, sources, tags) VALUES (?, ?, ?, ?, ?)`,
      [
        brief.title || "Research Brief",
        JSON.stringify(urls),
        JSON.stringify(brief),
        JSON.stringify(sourcesForDB),
        JSON.stringify(brief.tags || []),
      ]
    );

    res.json({
      id: lastInsertRowid,
      brief,
      sources: sourcesForDB,
      failedSources: failedSources.map((s) => ({ url: s.url, reason: s.error })),
    });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ── GET /api/briefs ──────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const rows = queryAll(
      `SELECT id, title, urls, tags, created_at FROM briefs ORDER BY created_at DESC LIMIT 5`
    );
    const briefs = rows.map((row) => ({
      id: row.id,
      title: row.title,
      urls: JSON.parse(row.urls),
      tags: JSON.parse(row.tags || "[]"),
      created_at: row.created_at,
    }));
    res.json({ briefs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", details: err.message });
  }
});

// ── GET /api/briefs/:id ──────────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const row = queryOne(`SELECT * FROM briefs WHERE id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: "Brief not found" });

    res.json({
      id: row.id,
      title: row.title,
      urls: JSON.parse(row.urls),
      brief: JSON.parse(row.brief),
      sources: JSON.parse(row.sources),
      tags: JSON.parse(row.tags || "[]"),
      created_at: row.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch brief", details: err.message });
  }
});

module.exports = router;
