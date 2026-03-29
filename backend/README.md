# NightRaid — Backend

Flask 3.0 REST API for the **NightRaid Banking Analysis** platform. Handles file ingestion, content extraction, and AI-powered financial analysis via a local Ollama instance.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flask 3.0.0 |
| Language | Python 3.11 |
| AI Runtime | Ollama (default model: `gpt-oss:20b`) |
| CORS | flask-cors 4.0 |
| Logging | Python `logging` + `RotatingFileHandler` |
| File Parsing | PyPDF2, openpyxl, xlrd, python-docx, docx2txt |
| Environment | python-dotenv |

---

## Project Structure

```
backend/
├── app.py               # Main Flask application (all routes + logic)
├── requirements.txt     # Python dependencies
├── .env                 # Active environment config (gitignored)
├── .env.example         # Config template
├── uploads/             # Uploaded files are stored here
└── logs/
    └── nightraid.log    # Rotating log file (10 MB × 5 backups)
```

---

## API Endpoints

### System

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | API root — lists all available endpoints and version info |
| `GET` | `/health` | Health check — returns `{"status": "healthy"}` |
| `GET` | `/uptime` | Server uptime, CPU %, memory usage %, start time |

### Ollama (Direct)

| Method | Route | Description |
|---|---|---|
| `POST`| `/ollama/generate` | Send a raw prompt to the configured Ollama model |
| `GET` | `/ollama/models`   | List models available in the Ollama instance |

#### `POST /ollama/generate`
```json
// Request
{ "prompt": "Summarize this statement", "model": "gpt-oss:20b" }

// Response
{ "status": "success", "model": "...", "response": "..." }
```

---

### Banking Analysis

| Method | Route | Description |
|---|---|---|
| `POST` | `/main/upload` | Upload one or more statement files |
| `POST` | `/main/analyze` | Analyze files (non-streaming, returns full JSON) |
| `POST` | `/main/analyze/stream` | **Streaming SSE** — preferred endpoint |
| `POST` | `/main/analyze/spending` | Shortcut for `analysisType=spending` |
| `POST` | `/main/analyze/anomalies` | Shortcut for `analysisType=anomalies` |
| `POST` | `/main/analyze/risk` | Shortcut for `analysisType=risk` |
| `POST` | `/main/analyze/recommendations` | Shortcut for `analysisType=recommendations` |
| `POST` | `/main/analyze/summary` | Shortcut for `analysisType=summary` |

---

#### `POST /main/upload`

Accepts `multipart/form-data` with fields named `file0`, `file1`, ... or `files`.

**Allowed extensions:** `txt`, `csv`, `pdf`, `json`, `xlsx`, `xls`, `docx`, `doc`

**Max file size:** configurable via `MAX_FILE_SIZE` (default 10 MB)

```json
// Response
{
  "status": "success",
  "message": "2 file(s) uploaded successfully",
  "files": [
    {
      "filename": "statement.csv",
      "filepath": "/app/backend/uploads/statement.csv",
      "size": 45123,
      "type": "text/csv",
      "upload_time": "2026-03-29T12:00:00"
    }
  ]
}
```

---

#### `POST /main/analyze/stream` (SSE)

The primary analysis endpoint used by the frontend. Returns a `text/event-stream` response.

```json
// Request body
{
  "analysisType": "spending",
  "files": [
    { "name": "statement.csv", "type": "text/csv", "size": 45123 }
  ]
}
```

**SSE event types:**

| `type` field | Payload | Meaning |
|---|---|---|
| `file_start` | `filename`, `analysis_type` | Starting analysis of a file |
| `token` | `text` | One token from Ollama |
| `file_end` | `filename` | File analysis complete |
| `error` | `message`, `filename` | Error during analysis |
| — | `[DONE]` | All files processed, stream closed |

Response headers include `Connection: close` to ensure the TCP connection terminates after `[DONE]`, which is required for correct behavior when running multiple sequential streams.

---

### Analysis Types

| Type | Description |
|---|---|
| `spending` | Categorical spend breakdown, top 5 expenses, weekly/monthly trends |
| `anomalies` | Fraud detection — flagged transactions table with Low/Medium/High risk levels |
| `risk` | Overall risk score (1–10), liquidity / fraud / income volatility sub-scores |
| `recommendations` | Savings opportunities, budget optimization, 30-60-90 day action plan |
| `summary` | Executive financial health overview — income vs. expenses, key metrics, top 3 actions |

Each type has a dedicated system prompt that instructs the LLM to output structured Markdown with tables and bold figures.

---

## File Parsing

Files are read from the `uploads/` directory after upload. The following formats are handled:

| Format | Parser |
|---|---|
| `.txt`, `.csv` | Built-in `open()` with UTF-8 |
| `.json` | `json.load()` → pretty-printed |
| `.pdf` | `PyPDF2.PdfReader` |
| `.xlsx` | `openpyxl` (all sheets) |
| `.xls` | `xlrd` (all sheets) |
| `.docx` | `python-docx` (paragraphs + tables) |
| `.doc` | `docx2txt` |

File content is truncated to `MAX_PROMPT_CHARS` before being sent to Ollama (default 50,000 characters). Set a higher value in `.env` if your model has a large context window:

```env
MAX_PROMPT_CHARS=400000   # ~128k tokens ≈ 480k chars
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- [Ollama](https://ollama.com) running locally with at least one model pulled PREFERED gpt-oss:20b 

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` to match your setup (see [Environment Variables](#environment-variables) below).

### Run the server

```bash
python app.py
```

Server starts on port `5000` by default.

---

## Environment Variables

Copy `.env.example` to `.env` and set these values:

```env
# Flask
FLASK_ENV=development         # development | production
FLASK_DEBUG=False
PORT=5000

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
OLLAMA_API_KEY=               # leave empty if not required
OLLAMA_TIMEOUT=120            # seconds

# File handling
MAX_FILE_SIZE=10485760        # bytes (default 10 MB)
MAX_PROMPT_CHARS=50000        # chars sent to model (increase for large context windows)

# CORS
CORS_ORIGINS=*                # comma-separated origins, e.g. http://localhost:5173, DO NOT USE '*' FOR PRODUCTION -Pixl
```

| Variable | Default | Description |
|---|---|---|
| `FLASK_ENV` | `production` | Sets log level (DEBUG in development) |
| `FLASK_DEBUG` | `False` | Flask debug mode |
| `PORT` | `5000` | Server port |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server address |
| `OLLAMA_MODEL` | `llama2` | Model to use for analysis |
| `OLLAMA_TIMEOUT` | `120` | Ollama request timeout in seconds |
| `MAX_FILE_SIZE` | `10485760` | Max upload size in bytes |
| `MAX_PROMPT_CHARS` | `50000` | Max characters of file content sent to the model |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |

---

## Logging

Logs are written to both the console and `logs/nightraid.log`:

- **Console**: level controlled by `FLASK_ENV` (`DEBUG` in development, `INFO` in production).
- **File**: always `INFO` and above; rotates at 10 MB, keeps 5 backups.

Format:
```
[2026-03-29 12:00:00] INFO     | __main__ | POST /main/upload - File upload request received
```

---

## CORS

CORS is enabled for the following routes: `/api/*`, `/uptime`, `/health`, `/main/*`.

Allowed origins are set via `CORS_ORIGINS` in `.env`. For local development, `*` is fine. In production, restrict to your frontend's origin.

---

## Docker

The backend is built as a multi-stage Docker image alongside the frontend. See the root [`Dockerfile`](../Dockerfile).

In the container:
- Backend runs on internal port `5000` (Flask), proxied from nginx at `/backend/`.
- Uploaded files persist inside the container at `/app/backend/uploads/`. Mount a volume if persistence across restarts is needed.

---