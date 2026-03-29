# NightRaid — Frontend

React + TypeScript + Vite frontend for the **NightRaid Banking Analysis** platform, built for EagleHacks 2026.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 3 + `@tailwindcss/typography` |
| Routing | React Router DOM v7 |
| Icons | lucide-react |
| Markdown | react-markdown + remark-gfm |

---

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Root router (/, /analysis, /about)
│   ├── main.tsx             # React entry point
│   ├── config.ts            # API base URL resolver (dev / prod)
│   ├── index.css            # Global styles
│   ├── components/
│   │   └── Navbar.tsx       # Sticky nav with active-route highlight
│   └── pages/
│       ├── Home.tsx         # File upload + drag-and-drop landing page
│       ├── Analysis.tsx     # Streaming analysis dashboard + cache + history
│       └── About.tsx        # Team profiles via GitHub API
├── public/
├── index.html
├── vite.config.ts           # Dev server port 5173
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Pages

### `/` — Home
- Drag-and-drop or click-to-browse file upload zone.
- Supported formats: `CSV`, `TXT`, `PDF`, `JSON`, `XLSX`, `XLS`, `DOCX`, `DOC`.
- Files accumulate without duplicates; each can be individually removed with the `X` button.
- Upload sends files to `POST /main/upload` via `multipart/form-data`.
- On success, file metadata is saved to `localStorage` and the user is navigated to `/analysis`.

### `/analysis` — Analysis Dashboard
- Reads file metadata from navigation state or `localStorage`.
- **Five analysis types** selectable via cards:
  - **Spending Behavior** — categorical spend breakdown and trends
  - **Anomaly Detection** — irregular/fraudulent transaction flagging with risk level
  - **Risk Assessment** — scored across liquidity, fraud, and income volatility
  - **Recommendations** — prioritized 30-60-90 day financial action items
  - **Financial Summary** — executive-level health overview with tables and metrics
- Results stream token-by-token via **Server-Sent Events** (`POST /main/analyze/stream`) and are rendered live with `react-markdown` (GitHub Flavored Markdown).
- **Cache**: results go to `localStorage` keyed by analysis type + sorted file fingerprint. Cached results load instantly with a timestamp badge.
- **History panel**: all past analyses sorted newest-first with 200-char previews; click any entry to restore it.
- **Run All Analyses**: streams all 5 types sequentially; cached entries are skipped automatically. A step indicator shows `pending / running / done / error` per type.
- **Upload Other File** button returns to Home.
- `AbortController` + `reader.cancel()` in `finally` ensure clean stream teardown.

### `/about` — Team
- Fetches profiles from `https://api.github.com/users/{username}` for all contributors in parallel.
- Displays: avatar, name, bio, location, company, public repos, followers, following.
- Includes a project info card with event, tech stack, and repository link.

---

## Component: Navbar

- Brand: `NightRaid` — "Night" in dark, "Raid" in orange — with a `Landmark` icon.
- Links: Home, Analysis, About — each with a Lucide icon.
- Active route highlighted with a blue pill via `useLocation()`.
- Sticky top-0 with `backdrop-blur` and subtle border.

---

## Configuration (`src/config.ts`)

The API base URL is resolved at build-time via Vite's `import.meta.env`:

| Condition | Resolved URL |
|---|---|
| `VITE_API_BASE_URL` set in `.env.local` | That value |
| `npm run dev` (no override) | `http://127.0.0.1:5000` |
| `npm run build` / Docker | `/backend` (nginx proxy) |

---

## Getting Started

### Prerequisites
- Node.js 22+
- Backend running at `http://localhost:5000`

### Install & run

```bash
cd frontend
npm install
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

> If the backend is on a different host/port, create `frontend/.env.local`:
> ```env
> VITE_API_BASE_URL=http://localhost:5000
> ```

### Production build

```bash
npm run build   # outputs to dist/
```

In production the app is served by nginx; `/backend/*` is proxied to the Flask process (see [nginx.conf](../nginx.conf)).

### Lint

```bash
npm run lint
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL override | Auto-detected |

Set in `frontend/.env.local` — this file is gitignored by Vite automatically.

---

## Caching Strategy

Results are stored in `localStorage` with the key:

```
nightraid_analysis_{type}__{file1|file2|...}
```

- File key is built from sorted, sanitized file names (order-independent).
- Each entry stores: `result`, `timestamp`, `fileNames`, `analysisType`, `analysisLabel`.
- Use the `↺` (Refresh) button on any analysis card to force a fresh stream and overwrite the cache.
- The History panel scans all keys with the `nightraid_analysis_` prefix.

---

## Streaming Architecture

```
Frontend                            Backend (SSE)
   │                                    │
   │── POST /main/analyze/stream ──────>│
   │<── text/event-stream ──────────────│
   │                                    │
   │   {"type":"file_start", ...}       │
   │   {"type":"token","text":"..."}    │  (repeated)
   │   {"type":"file_end", ...}         │
   │   [DONE]                           │
```

- `Connection: close` header on the backend terminates the TCP connection after `[DONE]`.
- A labeled `break outer` exits the nested read loop on `[DONE]`.
- `AbortController.abort()` + `reader.cancel()` run in `finally` for every stream.

---

## Docker

Built as a multi-stage image. See the root [`Dockerfile`](../Dockerfile) and [`nginx.conf`](../nginx.conf).