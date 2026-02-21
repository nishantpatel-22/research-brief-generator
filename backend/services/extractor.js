// ============================================================
// services/extractor.js — Fetches and cleans article text
//
// Strategy:
//  1. Fetch raw HTML with axios
//  2. Parse with node-html-parser (fast, lightweight)
//  3. Remove noise elements (nav, footer, ads, scripts)
//  4. Extract text from meaningful tags (p, h1-h3, li)
//  5. Return a clean text snippet (max 3000 chars)
// ============================================================
const axios = require("axios");
const { parse } = require("node-html-parser");

// Tags that usually contain junk (nav, ads, footers, etc.)
const NOISE_SELECTORS = [
  "script", "style", "noscript", "nav", "footer", "header",
  "aside", "form", "iframe", ".ad", ".ads", ".advertisement",
  ".sidebar", ".cookie", ".popup", ".modal", ".newsletter",
  "[class*='nav']", "[class*='menu']", "[class*='footer']",
  "[class*='header']", "[id*='nav']", "[id*='sidebar']",
];

/**
 * Fetch a URL and extract clean readable text from it.
 * @param {string} url - The URL to fetch
 * @returns {{ url, title, snippet, fullText, error }}
 */
async function extractContent(url) {
  try {
    // Fetch the page HTML (10s timeout, pretend to be a browser)
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ResearchBriefBot/1.0; +http://localhost)",
        Accept: "text/html",
      },
      maxRedirects: 5,
    });

    const html = response.data;
    if (typeof html !== "string") throw new Error("Non-HTML response");

    const root = parse(html);

    // Extract page title
    const title =
      root.querySelector("title")?.text?.trim() ||
      root.querySelector("h1")?.text?.trim() ||
      url;

    // Remove noise elements
    NOISE_SELECTORS.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });

    // Extract text from meaningful content tags
    const contentTags = root.querySelectorAll(
      "article, main, .content, .post, .entry, body"
    );
    const target = contentTags[0] || root;

    // Pull text from paragraphs and headings
    const paragraphs = target
      .querySelectorAll("p, h1, h2, h3, li")
      .map((el) => el.text.trim())
      .filter((t) => t.length > 40); // Skip very short fragments

    const fullText = paragraphs.join("\n\n");

    if (!fullText || fullText.length < 100) {
      throw new Error("Could not extract meaningful content from this URL");
    }

    // Snippet = first 3000 chars (enough context for the LLM)
    const snippet = fullText.substring(0, 3000);

    return { url, title, snippet, fullText, error: null };
  } catch (err) {
    // Return error info instead of crashing the whole request
    return {
      url,
      title: url,
      snippet: "",
      fullText: "",
      error: err.message || "Failed to fetch URL",
    };
  }
}

/**
 * Extract content from multiple URLs in parallel.
 * @param {string[]} urls
 * @returns {Promise<Array>}
 */
async function extractMultiple(urls) {
  return Promise.all(urls.map((url) => extractContent(url)));
}

module.exports = { extractContent, extractMultiple };
