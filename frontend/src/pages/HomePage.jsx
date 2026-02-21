import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateBrief } from "../services/api";

export default function HomePage() {
  const navigate = useNavigate();

  // State for the textarea input
  const [urlInput, setUrlInput] = useState("");
  // Loading state while generating
  const [loading, setLoading] = useState(false);
  // Any error message to show
  const [error, setError] = useState("");
  // Progress message
  const [progress, setProgress] = useState("");

  /**
   * Parse the textarea input into an array of URLs.
   * Handles newlines, commas, and spaces as separators.
   */
  function parseUrls(input) {
    return input
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
  }

  /**
   * Validate that a string looks like a URL.
   */
  function isValidUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const urls = parseUrls(urlInput);

    // Client-side validation
    if (urls.length === 0) {
      setError("Please enter at least 1 URL.");
      return;
    }
    if (urls.length > 10) {
      setError("Please enter no more than 10 URLs.");
      return;
    }

    const invalid = urls.filter((u) => !isValidUrl(u));
    if (invalid.length > 0) {
      setError(`Invalid URLs detected:\n${invalid.join("\n")}`);
      return;
    }

    setLoading(true);
    setProgress("Fetching and reading articles...");

    try {
      setTimeout(() => setProgress("Analyzing content with AI..."), 5000);
      const result = await generateBrief(urls);
      // Navigate to results page with the new brief ID
      navigate(`/results/${result.id}`, { state: result });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  const urlCount = parseUrls(urlInput).length;

  return (
    <div className="page-container">
      <div className="home-hero">
        <h1 className="hero-title">Research Brief Generator</h1>
        <p className="hero-subtitle">
          Paste links to articles, blogs, or documents. We'll read them all and
          generate a structured research brief with citations.
        </p>
      </div>

      {/* Step instructions */}
      <div className="steps-row">
        <div className="step-card">
          <span className="step-num">01</span>
          <span className="step-text">Paste 1–10 article URLs below</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step-card">
          <span className="step-num">02</span>
          <span className="step-text">We extract text from each source</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="step-card">
          <span className="step-num">03</span>
          <span className="step-text">AI generates a structured brief</span>
        </div>
      </div>

      {/* URL input form */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="textarea-header">
          <label className="input-label" htmlFor="urls">
            Article URLs
          </label>
          <span className={`url-counter ${urlCount > 10 ? "over-limit" : ""}`}>
            {urlCount}/10
          </span>
        </div>
        <textarea
          id="urls"
          className="url-textarea"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={`https://example.com/article-1\nhttps://example.com/article-2\nhttps://example.com/article-3`}
          rows={8}
          disabled={loading}
        />
        <p className="input-hint">One URL per line. Separate with newlines or commas.</p>

        {error && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <pre className="error-text">{error}</pre>
          </div>
        )}

        {loading && (
          <div className="loading-box">
            <div className="spinner" />
            <span>{progress}</span>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || urlInput.trim() === ""}
        >
          {loading ? "Generating..." : "Generate Research Brief →"}
        </button>
      </form>

      {/* What you'll get */}
      <div className="features-grid">
        <div className="feature-item">
          <span className="feature-icon">📋</span>
          <strong>Summary</strong>
          <p>Overall synthesis of all sources</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔑</span>
          <strong>Key Points</strong>
          <p>Cited insights with source links</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <strong>Conflicts</strong>
          <p>Disagreements between sources</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✅</span>
          <strong>To Verify</strong>
          <p>Claims that need fact-checking</p>
        </div>
      </div>
    </div>
  );
}
