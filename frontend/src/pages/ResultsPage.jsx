import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getBriefById } from "../services/api";

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();

  // If we navigated here from the home page, we already have the data
  const [data, setData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  // If we arrived via direct URL or history link, fetch from API
  useEffect(() => {
    if (!data) {
      getBriefById(id)
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="page-container"><div className="loading-box"><div className="spinner" /><span>Loading brief...</span></div></div>;
  if (error) return <div className="page-container"><div className="error-box"><span className="error-icon">⚠</span><p>{error}</p></div></div>;
  if (!data) return null;

  const { brief, sources = [], failedSources = [] } = data;

  // Helper: get a source by its 0-based index
  function getSource(index) {
    return sources[index] || null;
  }

  return (
    <div className="page-container results-page">
      {/* Header */}
      <div className="results-header">
        <Link to="/" className="back-link">← New Brief</Link>
        <div className="results-meta">
          <Link to={`/sources/${id}`} className="sources-link">
            View All Sources ({sources.length})
          </Link>
        </div>
      </div>

      <h1 className="brief-title">{brief.title}</h1>

      {/* Topic tags */}
      {brief.tags && brief.tags.length > 0 && (
        <div className="tags-row">
          {brief.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Failed sources warning */}
      {failedSources && failedSources.length > 0 && (
        <div className="warning-box">
          <strong>⚠ {failedSources.length} source(s) could not be fetched</strong>
          <ul>
            {failedSources.map((s) => (
              <li key={s.url}>{s.url} — {s.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Summary ─────────────────────────────────────────── */}
      <section className="brief-section">
        <h2 className="section-title">
          <span className="section-icon">📋</span> Overall Summary
        </h2>
        <div className="summary-text">
          {brief.summary?.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* ── Key Points ──────────────────────────────────────── */}
      <section className="brief-section">
        <h2 className="section-title">
          <span className="section-icon">🔑</span> Key Points
        </h2>
        <div className="key-points-list">
          {brief.keyPoints?.map((kp, i) => {
            const src = getSource(kp.sourceIndex);
            return (
              <div key={i} className="key-point-card">
                <p className="key-point-text">{kp.point}</p>
                {kp.snippet && (
                  <blockquote className="key-point-snippet">"{kp.snippet}"</blockquote>
                )}
                {src && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-link"
                  >
                    ↗ {src.title || src.url}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Conflicting Claims ──────────────────────────────── */}
      {brief.conflictingClaims && brief.conflictingClaims.length > 0 && (
        <section className="brief-section">
          <h2 className="section-title">
            <span className="section-icon">⚡</span> Conflicting Claims
          </h2>
          <div className="conflicts-list">
            {brief.conflictingClaims.map((conflict, i) => {
              const srcA = getSource(conflict.sourceA);
              const srcB = getSource(conflict.sourceB);
              return (
                <div key={i} className="conflict-card">
                  <p className="conflict-claim">{conflict.claim}</p>
                  <p className="conflict-details">{conflict.details}</p>
                  <div className="conflict-sources">
                    {srcA && (
                      <a href={srcA.url} target="_blank" rel="noopener noreferrer" className="citation-link">
                        Source A: {srcA.title || srcA.url}
                      </a>
                    )}
                    {srcB && (
                      <a href={srcB.url} target="_blank" rel="noopener noreferrer" className="citation-link">
                        Source B: {srcB.title || srcB.url}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── What to Verify ──────────────────────────────────── */}
      {brief.toVerify && brief.toVerify.length > 0 && (
        <section className="brief-section">
          <h2 className="section-title">
            <span className="section-icon">✅</span> What to Verify
          </h2>
          <ul className="verify-list">
            {brief.toVerify.map((item, i) => (
              <li key={i} className="verify-item">
                <span className="verify-checkbox">□</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Sources List ────────────────────────────────────── */}
      <section className="brief-section">
        <h2 className="section-title">
          <span className="section-icon">📎</span> Sources Used
        </h2>
        <div className="sources-list">
          {sources.map((src, i) => (
            <div key={i} className="source-pill">
              <span className="source-num">{i + 1}</span>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-url">
                {src.title || src.url}
              </a>
            </div>
          ))}
        </div>
        <Link to={`/sources/${id}`} className="view-sources-btn">
          View full extracted content →
        </Link>
      </section>
    </div>
  );
}
