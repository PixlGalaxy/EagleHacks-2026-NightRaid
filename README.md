# NightRaid

**NightRaid** is an AI-powered banking statement analyzer built for EagleHacks 2026. Upload your bank statements (PDF, Excel, CSV, Word, or plain text) and the app runs five parallel AI analyses — spending breakdown, anomaly detection, risk assessment, personalized recommendations, and an executive summary — all streamed in real time directly in the browser.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask + Ollama (local LLM)
- **Infrastructure**: Docker + nginx

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

> Requires [Ollama](https://ollama.com) running locally with a model loaded (default: `gpt-oss:20b`).

## Documentation

| [Frontend README](frontend/README.md) | React app, pages, components, env vars, build |
| [Backend README](backend/README.md)   | API endpoints, file parsing, SSE streaming, config |


