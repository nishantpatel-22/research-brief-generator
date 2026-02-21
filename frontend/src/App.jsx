import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import SourcesPage from "./pages/SourcesPage";
import HistoryPage from "./pages/HistoryPage";
import StatusPage from "./pages/StatusPage";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/sources/:id" element={<SourcesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </main>
    </div>
  );
}
