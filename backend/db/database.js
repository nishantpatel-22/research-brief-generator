// ============================================================
// db/database.js — SQLite setup using sql.js (pure JavaScript)
//
// Why sql.js instead of better-sqlite3?
//   better-sqlite3 requires compiling native C++ bindings which
//   needs Visual Studio build tools on Windows. sql.js is 100%
//   JavaScript (compiled from SQLite via WebAssembly) so it
//   works on any OS without any build tools.
//
// Trade-off: sql.js loads the entire DB into memory and saves
//   to disk manually. Fine for our small dataset (5 briefs max).
// ============================================================
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../data/briefs.db");
const DATA_DIR = path.join(__dirname, "../data");

let db = null; // The in-memory sql.js database instance

/**
 * Save the in-memory database to disk.
 * Call this after every write operation.
 */
function saveToDisk() {
  const data = db.export(); // Returns a Uint8Array
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Initialize the database.
 * Loads existing DB from disk if it exists, otherwise creates fresh.
 */
async function initDB() {
  // Ensure the data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Dynamically import sql.js (async because of WASM loading)
  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();

  // Load existing database file from disk, or create a new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database(); // Empty in-memory database
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS briefs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      urls       TEXT NOT NULL,
      brief      TEXT NOT NULL,
      sources    TEXT NOT NULL,
      tags       TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Save the initialized schema to disk
  saveToDisk();

  console.log("✅ Database initialized (sql.js / pure JS SQLite)");
}

/**
 * Get the active database instance.
 */
function getDB() {
  if (!db) throw new Error("Database not initialized. Call initDB() first.");
  return db;
}

/**
 * Run a write query (INSERT, UPDATE, DELETE).
 * Saves to disk after each write.
 * @returns {{ lastInsertRowid: number }}
 */
function runQuery(sql, params = []) {
  db.run(sql, params);
  saveToDisk();
  const result = db.exec("SELECT last_insert_rowid() as id");
  const lastInsertRowid = result[0]?.values[0]?.[0] ?? null;
  return { lastInsertRowid };
}

/**
 * Execute a SELECT and return all matching rows as plain objects.
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a SELECT and return the first row, or null.
 */
function queryOne(sql, params = []) {
  return queryAll(sql, params)[0] || null;
}

module.exports = { initDB, getDB, runQuery, queryAll, queryOne };
