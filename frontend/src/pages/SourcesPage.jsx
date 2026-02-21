import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBriefById } from "../services/api";

export default function SourcesPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBriefById(id)
      .then((result) => { setData(result); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="page-container"><div className="loading-box"><div className="spinner" /><span>Loading...</span></div></div>;
  if (error) return <div className="page-container"><div className="error-box"><span>⚠</span> {error}</div></div>;

  return (
    <div className="page-container">
      <div className="results-header">
        <Link to={`/results/${id}`} className="back-link">← Back to Brief</Link>
      </div>

      <h1 className="page-title">Source Details</h1>
      <p className="page-subtitle">
        Text extracted and used from each source during brief generation.
      </p>

      <div className="sources-detail-list">
        {data.sources.map((src, i) => (
          <div key={i} className="source-detail-card">
            <div className="source-detail-header">
              <span className="source-num">{i + 1}</span>
              <div className="source-detail-meta">
                <h3 className="source-detail-title">{src.title}</h3>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-detail-url"
                >
                  {src.url}
                </a>
              </div>
            </div>
            <div className="source-snippet-box">
              <p className="snippet-label">Extracted Content (first 500 chars used)</p>
              <pre className="snippet-text">{src.snippet || "No content extracted"}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
