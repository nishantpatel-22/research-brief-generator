import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">◈</span>
          ResearchBrief
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Generate
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            History
          </NavLink>
          <NavLink to="/status" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Status
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
