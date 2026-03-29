import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_BASE_URL } from "../config";
import {
  ArrowLeft,
  BarChart2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  FileText,
  File,
  Loader2,
  RefreshCw,
  Clock,
  ChevronRight,
  Upload,
  History,
  X,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";

// Type definition for uploaded file metadata
type UploadedFile = {
  name: string;
  type: string;
  size: number;
};

type CachedResult = {
  result: string;
  timestamp: number;
  fileNames: string[];
  analysisType: string;
  analysisLabel: string;
};

const CACHE_PREFIX = "nightraid_analysis_";

/** Stable, file-order-independent key derived from file names. */
function getFileKey(files: UploadedFile[]): string {
  return files
    .map((f) => f.name)
    .sort()
    .join("|")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getCacheKey(analysisType: string, files: UploadedFile[]): string {
  return `${CACHE_PREFIX}${analysisType}__${getFileKey(files)}`;
}

function getCached(analysisType: string, files: UploadedFile[]): CachedResult | null {
  try {
    const raw = localStorage.getItem(getCacheKey(analysisType, files));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedResult;
    // Guard: ensure it's a new-format entry with file metadata
    if (!parsed.analysisType || !parsed.fileNames) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache(
  analysisType: string,
  files: UploadedFile[],
  result: string,
  analysisLabel: string
) {
  try {
    const payload: CachedResult = {
      result,
      timestamp: Date.now(),
      fileNames: files.map((f) => f.name),
      analysisType,
      analysisLabel,
    };
    localStorage.setItem(getCacheKey(analysisType, files), JSON.stringify(payload));
  } catch { /* storage quota exceeded — silently ignore */ }
}

/** Return all history entries from localStorage, sorted newest first. */
function getAllHistory(): CachedResult[] {
  const history: CachedResult[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(CACHE_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as CachedResult;
      if (parsed.result && parsed.timestamp && parsed.analysisType && parsed.fileNames) {
        history.push(parsed);
      }
    } catch { /* ignore corrupt entries */ }
  }
  return history.sort((a, b) => b.timestamp - a.timestamp);
}

function formatAge(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// Available analysis types
const analysisOptions = [
  {
    key: "spending",
    label: "Spending Behavior",
    Icon: BarChart2,
    description: "Categorical breakdown of expenditures and spending trends.",
  },
  {
    key: "anomalies",
    label: "Anomaly Detection",
    Icon: ShieldAlert,
    description: "Identification of irregular and potentially fraudulent transactions.",
  },
  {
    key: "risk",
    label: "Risk Assessment",
    Icon: AlertTriangle,
    description: "Quantified risk scoring across liquidity, fraud, and income stability.",
  },
  {
    key: "recommendations",
    label: "Recommendations",
    Icon: Lightbulb,
    description: "Prioritized, actionable guidance to improve financial standing.",
  },
  {
    key: "summary",
    label: "Financial Summary",
    Icon: FileText,
    description: "Executive-level overview of key financial metrics and indicators.",
  },
];

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const uploadedFiles: UploadedFile[] = useMemo(() => {
    const locationFiles = (location.state as { files?: UploadedFile[] })?.files;
    if (Array.isArray(locationFiles) && locationFiles.length > 0) return locationFiles;
    const stored = localStorage.getItem("uploadedFiles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* ignore */ }
    }
    return [];
  }, [location.state]);

  type BatchStatus = "pending" | "running" | "done" | "error";

  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<number | null>(null);
  const [historyEntries, setHistoryEntries] = useState<CachedResult[]>([]);
  const [viewingHistory, setViewingHistory] = useState<CachedResult | null>(null);
  const [batchStatus, setBatchStatus] = useState<Record<string, BatchStatus> | null>(null);

  const refreshHistory = () => setHistoryEntries(getAllHistory());

  useEffect(() => {
    refreshHistory();
  }, []);

  /** Core streaming function — does not check cache. Returns full result string. */
  const streamOne = async (analysisType: string): Promise<string> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult("");
    setCurrentFile(null);
    setFromCache(null);
    setSelectedAnalysis(analysisType);
    setViewingHistory(null);

    const payload = { analysisType, files: uploadedFiles };
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/main/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Connection": "close" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server returned status ${res.status}`);
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResult = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();

          if (raw === "[DONE]") {
            break outer;
          }

          try {
            const parsed = JSON.parse(raw);
            if (parsed.type === "token") {
              fullResult += parsed.text;
              setAnalysisResult((prev) => prev + parsed.text);
            } else if (parsed.type === "file_start") {
              setCurrentFile(parsed.filename);
              if (uploadedFiles.length > 1) {
                const header = `\n\n---\n### File: ${parsed.filename}\n\n`;
                fullResult += header;
                setAnalysisResult((prev) => prev + header);
              }
            } else if (parsed.type === "error") {
              const msg = parsed.message || "An unknown error occurred.";
              setAnalysisError(msg);
              throw new Error(msg);
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }

      return fullResult;
    } catch (e) {
      // Ignore AbortError — that's intentional from our controller.abort() call
      if ((e as Error).name === "AbortError") return "";
      throw e;
    } finally {
      // Abort the fetch to forcibly close the TCP connection before the next request starts
      controller.abort();
      if (reader) {
        try { reader.cancel(); } catch { /* ignore */ }
      }
      setIsAnalyzing(false);
      setCurrentFile(null);
    }
  };

  const runAnalysis = async (analysisType: string, forceRefresh = false) => {
    if (uploadedFiles.length === 0) {
      setAnalysisError("No uploaded files found. Please return to the home page and upload files.");
      return;
    }

    setBatchStatus(null);

    if (!forceRefresh) {
      const cached = getCached(analysisType, uploadedFiles);
      if (cached) {
        setSelectedAnalysis(analysisType);
        setAnalysisResult(cached.result);
        setFromCache(cached.timestamp);
        setAnalysisError(null);
        setCurrentFile(null);
        setViewingHistory(null);
        return;
      }
    }

    const label = analysisOptions.find((o) => o.key === analysisType)?.label ?? analysisType;
    try {
      const fullResult = await streamOne(analysisType);
      setCache(analysisType, uploadedFiles, fullResult, label);
      setFromCache(Date.now());
      refreshHistory();
    } catch (error) {
      console.error("Streaming analysis error:", error);
      setAnalysisError((error as Error).message || "Analysis failed due to a network error.");
    }
  };

  const runAllAnalyses = async () => {
    if (uploadedFiles.length === 0) return;

    // Build initial batch status — mark already-cached ones as done
    const initial: Record<string, BatchStatus> = {};
    for (const opt of analysisOptions) {
      initial[opt.key] = getCached(opt.key, uploadedFiles) ? "done" : "pending";
    }
    setBatchStatus(initial);
    setAnalysisError(null);

    for (const opt of analysisOptions) {
      if (initial[opt.key] === "done") continue;
      setBatchStatus((prev) => prev ? { ...prev, [opt.key]: "running" } : prev);
      try {
        const fullResult = await streamOne(opt.key);
        setCache(opt.key, uploadedFiles, fullResult, opt.label);
        setFromCache(Date.now());
        refreshHistory();
        setBatchStatus((prev) => prev ? { ...prev, [opt.key]: "done" } : prev);
      } catch {
        setBatchStatus((prev) => prev ? { ...prev, [opt.key]: "error" } : prev);
      }
    }
  };

  const selectedOption = analysisOptions.find((o) => o.key === selectedAnalysis);
  const activeResult = viewingHistory?.result ?? analysisResult;
  const activeLabel = viewingHistory?.analysisLabel ?? selectedOption?.label;
  const ActiveIcon = viewingHistory
    ? (analysisOptions.find((o) => o.key === viewingHistory.analysisType)?.Icon ?? FileText)
    : selectedOption?.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header row */}
        <div className="flex items-center gap-4 mb-8">
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={15} />
            Return to Home
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 leading-tight">Analysis Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select an analysis module to generate AI-powered insights from your uploaded statements.
            </p>
          </div>
        </div>

        {/* Uploaded Statements */}
        <section className="bg-white shadow-sm rounded-xl p-5 border border-slate-200 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700 uppercase tracking-wide">
              Uploaded Statements
            </h2>
            <button
              className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium"
              onClick={() => navigate("/")}
            >
              <Upload size={13} />
              Upload Other File
            </button>
          </div>
          {uploadedFiles.length === 0 ? (
            <p className="text-sm text-slate-400">
              No files found. Return to the home page and upload your bank statement files.
            </p>
          ) : (
            <ul className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50">
                  <File size={16} className="text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{file.name}</span>
                  <span className="ml-auto text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Analysis Modules */}
        <section className="bg-white shadow-sm rounded-xl p-5 border border-slate-200 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700 uppercase tracking-wide">
              Analysis Modules
            </h2>
            <button
              className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={runAllAnalyses}
              disabled={isAnalyzing || uploadedFiles.length === 0}
            >
              {isAnalyzing && batchStatus ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <PlayCircle size={13} />
              )}
              Run All Analyses
            </button>
          </div>

          {/* Batch progress stepper */}
          {batchStatus && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1">
                {analysisOptions.map(({ key, label }, idx) => {
                  const status = batchStatus[key] ?? "pending";
                  return (
                    <React.Fragment key={key}>
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition ${
                          status === "done" ? "border-emerald-400 bg-emerald-50" :
                          status === "running" ? "border-blue-400 bg-blue-50" :
                          status === "error" ? "border-red-400 bg-red-50" :
                          "border-slate-200 bg-white"
                        }`}>
                          {status === "done" && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {status === "running" && <Loader2 size={14} className="text-blue-500 animate-spin" />}
                          {status === "error" && <XCircle size={14} className="text-red-500" />}
                          {status === "pending" && <Circle size={14} className="text-slate-300" />}
                        </div>
                        <span className={`text-xs font-medium truncate w-full text-center ${
                          status === "done" ? "text-emerald-600" :
                          status === "running" ? "text-blue-600" :
                          status === "error" ? "text-red-500" :
                          "text-slate-400"
                        }`}>{label}</span>
                      </div>
                      {idx < analysisOptions.length - 1 && (
                        <div className={`h-px w-4 shrink-0 mb-4 ${
                          batchStatus[analysisOptions[idx + 1].key] !== "pending" || status === "done"
                            ? "bg-slate-300"
                            : "bg-slate-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {analysisOptions.map(({ key, label, Icon, description }) => {
              const cached = getCached(key, uploadedFiles);
              const isActive = selectedAnalysis === key && !viewingHistory;
              const batchSt = batchStatus?.[key];
              return (
                <button
                  key={key}
                  className={`relative text-left p-4 border rounded-xl transition group ${
                    isActive
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : batchSt === "done"
                      ? "border-emerald-300 bg-emerald-50/50"
                      : batchSt === "running"
                      ? "border-blue-400 bg-blue-50 shadow-sm"
                      : batchSt === "error"
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  onClick={() => { setBatchStatus(null); runAnalysis(key); }}
                  disabled={isAnalyzing}
                >
                  <div className="flex items-start justify-between">
                    <Icon
                      size={20}
                      className={
                        isActive || batchSt === "running" ? "text-blue-600" :
                        batchSt === "done" ? "text-emerald-500" :
                        batchSt === "error" ? "text-red-500" :
                        "text-slate-400 group-hover:text-blue-500"
                      }
                    />
                    {batchSt === "done" ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={10} />
                        Done
                      </span>
                    ) : batchSt === "running" ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        <Loader2 size={10} className="animate-spin" />
                        Running
                      </span>
                    ) : batchSt === "error" ? (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                        <XCircle size={10} />
                        Error
                      </span>
                    ) : cached ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <Clock size={10} />
                        Cached
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-800">{label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                  <ChevronRight
                    size={14}
                    className="absolute right-3 bottom-3 text-slate-300 group-hover:text-blue-400 transition"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Panel */}
        {(isAnalyzing || activeResult || analysisError) && (
          <section className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden mb-5">
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {ActiveIcon && <ActiveIcon size={18} className="text-blue-600" />}
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    {activeLabel ?? "Analysis"} Results
                  </h2>
                  {viewingHistory && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Files: {viewingHistory.fileNames.join(", ")}
                    </p>
                  )}
                  {currentFile && !viewingHistory && (
                    <p className="text-xs text-slate-500 mt-0.5">Processing: {currentFile}</p>
                  )}
                  {fromCache && !isAnalyzing && !viewingHistory && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      Retrieved from cache · {formatAge(fromCache)}
                    </p>
                  )}
                  {viewingHistory && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {formatAge(viewingHistory.timestamp)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {viewingHistory ? (
                  <button
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition"
                    onClick={() => setViewingHistory(null)}
                  >
                    <X size={12} />
                    Close
                  </button>
                ) : isAnalyzing ? (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin" />
                    Streaming response…
                  </span>
                ) : analysisResult && selectedAnalysis ? (
                  <button
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition"
                    onClick={() => runAnalysis(selectedAnalysis, true)}
                  >
                    <RefreshCw size={12} />
                    Re-run Analysis
                  </button>
                ) : null}
              </div>
            </div>

            {/* Error banner */}
            {analysisError && !viewingHistory && (
              <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <strong className="font-medium">Error:</strong> {analysisError}
              </div>
            )}

            {/* Markdown output */}
            {activeResult && (
              <div className="p-6">
                <div className="prose prose-slate max-w-none
                  prose-headings:text-slate-800 prose-headings:font-semibold
                  prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                  prose-strong:text-slate-800 prose-strong:font-semibold
                  prose-table:border-collapse prose-table:w-full prose-table:text-sm
                  prose-th:bg-slate-50 prose-th:text-slate-700 prose-th:font-semibold prose-th:px-3 prose-th:py-2 prose-th:border prose-th:border-slate-200 prose-th:text-left
                  prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-slate-200 prose-td:text-slate-700
                  prose-tr:even:bg-slate-50/60
                  prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:text-sm
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:my-0.5 prose-li:text-slate-700
                  prose-p:text-slate-700 prose-p:leading-relaxed
                  prose-hr:border-slate-200
                  prose-blockquote:border-blue-300 prose-blockquote:text-slate-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeResult}
                  </ReactMarkdown>
                </div>
                {isAnalyzing && !viewingHistory && (
                  <span className="inline-block w-2 h-4 bg-blue-500 rounded animate-pulse ml-0.5 align-middle mt-1" />
                )}
              </div>
            )}

            {/* Empty state within panel */}
            {!isAnalyzing && !activeResult && !analysisError && (
              <div className="p-6 text-sm text-slate-400">
                Select an analysis module above to begin.
              </div>
            )}
          </section>
        )}

        {/* History Section */}
        {historyEntries.length > 0 && (
          <section className="bg-white shadow-sm rounded-xl p-5 border border-slate-200 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-slate-500" />
              <h2 className="text-base font-semibold text-slate-700 uppercase tracking-wide">
                Analysis History
              </h2>
            </div>
            <div className="space-y-2">
              {historyEntries.map((entry, idx) => {
                const EntryIcon =
                  analysisOptions.find((o) => o.key === entry.analysisType)?.Icon ?? FileText;
                const isActive = viewingHistory === entry;
                return (
                  <button
                    key={idx}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition ${
                      isActive
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                    }`}
                    onClick={() => {
                      setViewingHistory(entry);
                      setSelectedAnalysis(null);
                      setAnalysisResult("");
                      setAnalysisError(null);
                    }}
                  >
                    <EntryIcon
                      size={16}
                      className={`shrink-0 mt-0.5 ${isActive ? "text-blue-500" : "text-slate-400"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {entry.analysisLabel}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock size={10} />
                          {formatAge(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Files: {entry.fileNames.join(", ")}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {entry.result.slice(0, 200).replace(/[#*`_[\]]/g, "")}…
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Initial prompt */}
        {!isAnalyzing && !activeResult && !analysisError && historyEntries.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Select an analysis module above to generate insights from your uploaded statements.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
