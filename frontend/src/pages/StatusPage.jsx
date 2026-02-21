import React, { useEffect, useState } from "react";
import { getStatus } from "../services/api";

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    getStatus()
      .then((data) => { setStatus(data); setLoading(false); })
      .catch(() => {
        setStatus({ server: "error", database: "unknown", llm: "unknown" });
        setLoading(false);
      });
  }

  useEffect(() => { refresh(); }, []);

  function StatusDot({ value }) {
    const color = value === "ok" ? "#22c55e" : value === "error" ? "#ef4444" : "#f59e0b";
    const label = value === "ok" ? "Operational" : value === "error" ? "Error" : "Unknown";
    return (
      <span className="status-indicator">
        <span className="status-dot" style={{ background: color }} />
        {label}
      </span>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">System Status</h1>
      <p className="page-subtitle">Health check for all system components.</p>

      {loading && <div className="loading-box"><div className="spinner" /><span>Checking status...</span></div>}

      {!loading && status && (
        <>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-card-icon">🖥</div>
              <div className="status-card-info">
                <h3>Backend Server</h3>
                <p>Express.js API on Node.js</p>
              </div>
              <StatusDot value={status.server} />
            </div>

            <div className="status-card">
              <div className="status-card-icon">🗄</div>
              <div className="status-card-info">
                <h3>Database</h3>
                <p>SQLite file-based storage</p>
              </div>
              <StatusDot value={status.database} />
            </div>

            <div className="status-card">
              <div className="status-card-icon">🤖</div>
              <div className="status-card-info">
                <h3>LLM (Groq)</h3>
                <p>llama-3.3-70b-versatile</p>
              </div>
              <StatusDot value={status.llm} />
            </div>
          </div>

          <p className="status-timestamp">
            Last checked: {status.timestamp ? new Date(status.timestamp).toLocaleString() : "—"}
          </p>

          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={refresh}>
            Refresh Status
          </button>
        </>
      )}
    </div>
  );
}
