import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  UploadCloud,
  File,
  X,
  Loader2,
  ArrowRight,
  BarChart2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  Landmark,
} from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((file) => {
      const t = file.type;
      const n = file.name.toLowerCase();
      return (
        t === "text/plain" ||
        t === "text/csv" ||
        t === "application/pdf" ||
        t === "application/json" ||
        t === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        t === "application/vnd.ms-excel" ||
        t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        t === "application/msword" ||
        n.endsWith(".csv") || n.endsWith(".txt") || n.endsWith(".json") ||
        n.endsWith(".pdf") || n.endsWith(".xlsx") || n.endsWith(".xls") ||
        n.endsWith(".docx") || n.endsWith(".doc")
      );
    });
    setSelectedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeFile = (name: string) =>
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    selectedFiles.forEach((file, idx) => formData.append(`file${idx}`, file));

    try {
      const res = await fetch(`${API_BASE_URL}/main/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const savedFiles = selectedFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        }));
        localStorage.setItem("uploadedFiles", JSON.stringify(savedFiles));
        setSelectedFiles([]);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = () => {
    const stored = localStorage.getItem("uploadedFiles");
    type FileMeta = { name: string; type: string; size: number };
    let filesForAnalysis: FileMeta[] = [];

    if (stored) {
      try { filesForAnalysis = JSON.parse(stored) as FileMeta[]; } catch { /* ignore */ }
    }
    if (filesForAnalysis.length === 0 && selectedFiles.length > 0) {
      filesForAnalysis = selectedFiles.map((f) => ({ name: f.name, type: f.type, size: f.size }));
    }
    if (filesForAnalysis.length === 0) {
      alert("Upload files first, then run analysis.");
      return;
    }
    navigate("/analysis", { state: { files: filesForAnalysis } });
  };

  return (
    <>
      <title>Symplistic.AI Banking Analyst</title>
      <meta
        name="description"
        content="Intelligent Banking Analyst demo UI with ingest, insights, risk signals, and recommendations."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-md">
              <Landmark size={28} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">
              Intelligent Banking Analyst
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Analyze customer data, detect risks, and generate actionable financial insights.
            </p>
          </header>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">

              {/* Data Ingestion */}
              <article className="p-6 border border-blue-200 rounded-xl bg-white shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <UploadCloud size={20} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-blue-800">Data Ingestion</h2>
                </div>
                <p className="text-sm text-slate-600">
                  Upload bank statement files (CSV, TXT, PDF, JSON, XLSX, XLS, DOCX, DOC) for AI-powered financial analysis.
                </p>

                {/* Drop zone */}
                <label
                  htmlFor="file-input"
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
                    isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <UploadCloud
                    size={36}
                    className={isDragging ? "text-blue-500" : "text-slate-400"}
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Drag & drop files here, or{" "}
                    <span className="text-blue-600 underline">browse</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    CSV · TXT · PDF · JSON · XLSX · XLS · DOCX · DOC
                  </span>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.txt,.pdf,.json,.xlsx,.xls,.docx,.doc"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Selected files list */}
                {selectedFiles.length > 0 && (
                  <ul className="space-y-2">
                    {selectedFiles.map((file) => (
                      <li
                        key={file.name}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <File size={15} className="text-blue-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={() => removeFile(file.name)}
                          className="text-slate-400 hover:text-red-500 transition shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} />
                      Ingest Data
                    </>
                  )}
                </button>
              </article>

              {/* Analysis Workflow */}
              <article className="p-6 border border-blue-200 rounded-xl bg-white shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <PlayCircle size={20} className="text-green-600" />
                  <h2 className="text-xl font-semibold text-blue-800">Analysis Workflow</h2>
                </div>
                <p className="text-sm text-slate-600">
                  Use an orchestrated multi-step workflow for spending behavior, anomalous patterns, and risk projection.
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-blue-500 shrink-0" />
                    Spending and saving behavior
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert size={15} className="text-amber-500 shrink-0" />
                    Anomaly detection (outliers and fraud signals)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-rose-500 shrink-0" />
                    Risk index and opportunity score
                  </li>
                  <li className="flex items-center gap-2">
                    <Lightbulb size={15} className="text-emerald-500 shrink-0" />
                    Actionable financial recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-purple-500 shrink-0" />
                    Executive-level financial summary
                  </li>
                </ul>
                <button
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  onClick={handleRunAnalysis}
                >
                  <ArrowRight size={15} />
                  Run Analysis
                </button>
              </article>
            </div>

            {/* Expected Output */}
            <article className="p-6 border border-blue-200 rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-800">Expected Output</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Provide evidence-backed insights with clear recommendations and risk-next steps.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 size={15} className="text-sky-600" />
                    <h3 className="font-semibold text-sky-700">Insights</h3>
                  </div>
                  <p className="text-xs text-slate-600">Spending behavior summary and trends.</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-amber-600" />
                    <h3 className="font-semibold text-amber-700">Anomalies</h3>
                  </div>
                  <p className="text-xs text-slate-600">Detected unusual transactions and inconsistencies.</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-rose-600" />
                    <h3 className="font-semibold text-rose-700">Risk Signals</h3>
                  </div>
                  <p className="text-xs text-slate-600">High-risk flags and weak financial controls.</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb size={15} className="text-emerald-600" />
                    <h3 className="font-semibold text-emerald-700">Recommendations</h3>
                  </div>
                  <p className="text-xs text-slate-600">Actionable steps and next opportunities.</p>
                </div>
              </div>
            </article>

            {/* Judge Criteria */}
            <article className="p-6 border border-blue-200 rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-800">Judge Criteria</h2>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {[
                  "Ingest structured and unstructured data.",
                  "Surface meaningful insights with evidence references.",
                  "Identify risk and inconsistency across sources.",
                  "Deliver clear, actionable next steps.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;

