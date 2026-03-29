# NightRaid

**NightRaid** is an AI-powered banking statement analyzer built for EagleHacks 2026. Upload your bank statements (PDF, Excel, CSV, Word, or plain text) and the app runs five parallel AI analyses — spending breakdown, anomaly detection, risk assessment, personalized recommendations, and an executive summary — all streamed in real time directly in the browser.

## Live Demo

**URL**: https://eaglehacks.fabriziogamboa.com/

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask + Ollama (local LLM)
- **Infrastructure**: Docker + nginx

## Quick Start

### Docker (recommended)

```bash
docker pull ghcr.io/pixlgalaxy/nightraid:latest
docker run -p 7000:7000 ghcr.io/pixlgalaxy/nightraid:latest
```

Then open [http://localhost:7000](http://localhost:7000) in your browser.

The container includes the frontend, backend, and nginx. You still need [Ollama](https://ollama.com) running on the host with a model loaded (default: `gpt-oss:20b`).

### Manual

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

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `FLASK_ENV`           | `production`             | `development` or `production` |
| `FLASK_DEBUG`         | `False`                  | Enable Flask debug mode |
| `PORT`                | `5000`                   | Backend server port |
| `OLLAMA_BASE_URL`     | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL`        | `gpt-oss:20b`            | Model used for analysis |
| `OLLAMA_API_KEY`      | _(empty)_                | API key for Ollama (if required) |
| `OLLAMA_TIMEOUT`      | `120`                    | Request timeout in seconds |
| `MAX_FILE_SIZE`       | `10485760`               | Max upload size in bytes (10 MB) |
| `CORS_ORIGINS`        | `*`                      | Allowed CORS origins (comma-separated) |
| `API_VERSION`         | `v1`                     | API version prefix |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL`   | _(auto)_                 | Override the backend URL. Defaults to `http://127.0.0.1:5000` in dev and `/backend` in production |

## Documentation

| [Frontend README](frontend/README.md) | React app, pages, components, env vars, build |
| [Backend README](backend/README.md)   | API endpoints, file parsing, SSE streaming, config |


