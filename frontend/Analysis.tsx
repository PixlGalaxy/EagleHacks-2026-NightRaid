import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type UploadedFile = {
  name: string;
  type: string;
  size: number;
};

const analysisOptions = [
  { key: "spending", label: "Spending Behavior" },
  { key: "anomalies", label: "Anomaly Detection" },
  { key: "risk", label: "Risk Index" },
  { key: "recommendations", label: "Recommendations" },
];

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const uploadedFiles: UploadedFile[] = useMemo(() => {
    const locationFiles = (location.state as { files?: UploadedFile[] })?.files;
    if (Array.isArray(locationFiles) && locationFiles.length > 0) {
      return locationFiles;
    }

    const stored = localStorage.getItem("uploadedFiles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    return [];
  }, [location.state]);

  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          className="mb-6 px-3 py-2 bg-gray-200 text-slate-800 rounded-lg hover:bg-gray-300"
          onClick={() => navigate("/")}
        >
          ? Back to Home
        </button>

        <h1 className="text-4xl font-extrabold text-blue-700">Analysis Dashboard</h1>
        <p className="mt-2 text-slate-600">Files uploaded from home page are below, choose an analysis type to run.</p>

        <section className="mt-6 bg-white shadow-sm rounded-xl p-5 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800">Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="mt-3 text-slate-500">No files found. Go back to home and upload files first.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="p-2 rounded-lg border border-slate-200">
                  <span className="font-medium">{file.name}</span> - {file.type} - {(file.size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 bg-white shadow-sm rounded-xl p-5 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800">Analysis Types</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {analysisOptions.map(option => (
              <button
                key={option.key}
                className={`text-left p-4 border rounded-xl transition ${
                  selectedAnalysis === option.key
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-300 bg-white hover:border-blue-400"
                }`}
                onClick={() => setSelectedAnalysis(option.key)}
              >
                <h3 className="font-semibold">{option.label}</h3>
                <p className="text-sm text-slate-600 mt-1">Run this analysis on ingested data.</p>
              </button>
            ))}
          </div>

          {selectedAnalysis && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-lg font-bold text-blue-800">Running: {analysisOptions.find(o => o.key === selectedAnalysis)?.label}</h3>
              <p className="mt-2 text-slate-700">
                Results are mocked in this demo; replace with your backend orchestration call for the actual output.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                <strong>Simulated output:</strong>
                <ul className="list-disc list-inside text-sm text-slate-700 mt-2">
                  <li>{selectedAnalysis === "spending" ? "Detected 15% higher spending in dining categories." : null}</li>
                  <li>{selectedAnalysis === "anomalies" ? "Found 3 unusual large transactions needing review." : null}</li>
                  <li>{selectedAnalysis === "risk" ? "Calculated risk index: 67/100 (moderate)." : null}</li>
                  <li>{selectedAnalysis === "recommendations" ? "Recommend reducing recurring payment leaks and building emergency savings." : null}</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Analysis;
