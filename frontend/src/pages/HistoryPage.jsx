import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api";

export default function HistoryPage() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory()
      .then((data) => { setBriefs(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Brief History</h1>
      <p className="page-subtitle">Your last 5 generated research briefs.</p>

      {loading && <div className="loading-box"><div className="spinner" /><span>Loading history...</span></div>}
      {error && <div className="error-box"><span className="error-icon">⚠</span> {error}</div>}

      {!loading && briefs.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No briefs yet. <Link to="/">Generate your first brief →</Link></p>
        </div>
      )}

      <div className="history-list">
        {briefs.map((brief) => (
          <Link key={brief.id} to={`/results/${brief.id}`} className="history-card">
            <div className="history-card-top">
              <h3 className="history-card-title">{brief.title}</h3>
              <span className="history-card-date">{formatDate(brief.created_at)}</span>
            </div>
            <div className="history-card-tags">
              {brief.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="history-card-urls">
              <span className="url-count-badge">{brief.urls.length} sources</span>
              <span className="history-arrow">View Brief →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
