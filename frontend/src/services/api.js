// ============================================================
// services/api.js — Centralized API calls to the backend
// All fetch logic lives here so components stay clean.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Generate a new research brief from a list of URLs.
 * @param {string[]} urls
 * @returns {Promise<Object>} { id, brief, sources, failedSources }
 */
export async function generateBrief(urls) {
  const res = await fetch(`${BASE_URL}/api/briefs/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data;
}

/**
 * Get the last 5 briefs from history.
 * @returns {Promise<Array>}
 */
export async function getHistory() {
  const res = await fetch(`${BASE_URL}/api/briefs`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load history");
  return data.briefs;
}

/**
 * Get a single brief by ID.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function getBriefById(id) {
  const res = await fetch(`${BASE_URL}/api/briefs/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Brief not found");
  return data;
}

/**
 * Get system status.
 * @returns {Promise<Object>}
 */
export async function getStatus() {
  const res = await fetch(`${BASE_URL}/api/status`);
  const data = await res.json();
  return data; // Don't throw even on error — we want to show the status
}
