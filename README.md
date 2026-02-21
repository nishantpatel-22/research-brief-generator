# Research Brief Generator

A full-stack web application that generates structured research briefs from article/blog links using AI (Groq + LLaMA 3).

## ✨ Features

- Paste 1–10 article URLs and get a structured research brief
- AI-generated: summary, key points with citations, conflicting claims, and a "what to verify" checklist
- Each key point links back to its source with a snippet
- Sources page showing extracted text used from each URL
- History of last 5 generated briefs
- Topic tags for each brief
- System status page (server, DB, LLM health check)
- Graceful error handling for unreachable URLs

## 🧰 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev server, simple setup, easy to deploy |
| Backend | Node.js + Express | Simple REST API, widely understood |
| Database | SQLite (better-sqlite3) | Zero-config, file-based, no server needed |
| LLM | Groq API (llama-3.3-70b) | Free tier, fast inference |
| CSS | Vanilla CSS | No build step complexity, easy to understand |

## 📁 Folder Structure

```
research-brief-generator/
├── backend/
│   ├── db/           database.js — SQLite setup
│   ├── routes/       briefs.js, status.js — REST endpoints
│   ├── services/     extractor.js — content scraping
│   │                 llm.js — Groq LLM abstraction
│   ├── data/         (auto-created) briefs.db SQLite file
│   ├── index.js      Express entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/    HomePage, ResultsPage, SourcesPage, HistoryPage, StatusPage
│   │   ├── components/ Navbar
│   │   ├── services/ api.js — all fetch calls
│   │   └── styles.css
│   └── .env.example
├── docker-compose.yml
├── README.md
├── AI_NOTES.md
├── ABOUTME.md
└── PROMPTS_USED.md
```

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/research-brief-generator
cd research-brief-generator
```

### 2. Set up backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm install
npm run dev
```

### 3. Set up frontend (new terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Open the app

Visit `http://localhost:5173`

## 🌐 Hosting

### Frontend — Vercel/Netlify

```bash
cd frontend
npm run build
# Upload the `dist/` folder to Vercel or Netlify
# Set environment variable: VITE_API_URL=https://your-backend.com
```

### Backend — Railway / Render / Fly.io

1. Push the `backend/` folder to GitHub
2. Connect repo to Railway or Render
3. Set environment variables: `GROQ_API_KEY`, `PORT`, `FRONTEND_URL`
4. Deploy

### Docker (full stack)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your GROQ_API_KEY
docker-compose up --build
```

## ✅ What's Implemented

- URL input with validation (1–10 URLs, https only)
- HTML content extraction with noise removal
- LLM-powered brief generation (summary, key points, conflicts, verify checklist)
- JSON response parsing from LLM
- SQLite persistence (last 5 briefs accessible from history)
- Topic tags per brief
- Sources detail page with extracted snippets
- System status health check endpoint
- Responsive design

## ❌ What's NOT Implemented

- User authentication / accounts
- Full-text search across past briefs
- PDF export
- Real-time streaming of LLM responses (could add with SSE)
- Paywall/rate-limiting
- Rich text editor for brief editing
- Mobile app
