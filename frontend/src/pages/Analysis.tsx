import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Type definition for uploaded file metadata
type UploadedFile = {
  name: string;
  type: string;
  size: number;
};

// Available analysis types that can be run on uploaded files
const analysisOptions = [
  { key: "spending", label: "Spending Behavior" },
  { key: "anomalies", label: "Anomaly Detection" },
  { key: "risk", label: "Risk Index" },
  { key: "recommendations", label: "Recommendations" },
];

// Analysis component: Dashboard for running AI analysis on uploaded files
// Displays uploaded files and provides analysis type selection
const Analysis: React.FC = () => {
  // Navigation hook for routing back to home page
  const navigate = useNavigate();

  // Location hook to access files passed from home page navigation
  const location = useLocation();

  // Retrieve uploaded files from navigation state or localStorage
  // Memoized to prevent unnecessary recalculations
  const uploadedFiles: UploadedFile[] = useMemo(() => {
    // First try to get files from navigation state (passed from Home page)
    const locationFiles = (location.state as { files?: UploadedFile[] })?.files;
    if (Array.isArray(locationFiles) && locationFiles.length > 0) {
      return locationFiles;
    }

    // Fallback: get files from localStorage (persisted after upload)
    const stored = localStorage.getItem("uploadedFiles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Ignore parsing errors, return empty array
      }
    }

    return [];
  }, [location.state]);

  // State for tracking currently selected analysis type
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  // State for storing analysis results from backend
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // State for tracking analysis request progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for storing analysis error messages
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Function to run analysis by calling backend API
  // Takes analysis type and sends request with file metadata
  const runAnalysis = async (analysisType: string) => {
    // Validate that files are available before running analysis
    if (uploadedFiles.length === 0) {
      setAnalysisError("No uploaded files found. Please upload files on Home first.");
      return;
    }

    // Set analyzing state and reset previous results/errors
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSelectedAnalysis(analysisType);

    // Prepare payload with analysis type and file metadata
    const payload = {
      analysisType,
      files: uploadedFiles,
    };

    try {
      // Send POST request to backend analysis endpoint
      const res = await fetch("http://localhost:5000/main/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check for successful response
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      // Parse JSON response and extract analysis summary
      const data = await res.json();
      if (data && data.summary) {
        setAnalysisResult(data.summary);
      } else {
        setAnalysisResult("No analysis summary returned from server.");
      }
    } catch (error) {
      // Handle network errors or server errors
      console.error("Analysis request error:", error);
      setAnalysisError((error as Error).message || "Analysis failed due to a network error.");
    } finally {
      // Always reset analyzing state
      setIsAnalyzing(false);
    }
  };

  return (
    // Main page container with gradient background matching Home page
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Navigation button to return to Home page */}
        <button
          className="mb-6 px-3 py-2 bg-gray-200 text-slate-800 rounded-lg hover:bg-gray-300"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        {/* Page header */}
        <h1 className="text-4xl font-extrabold text-blue-700">Analysis Dashboard</h1>
        <p className="mt-2 text-slate-600">Files uploaded from home page are below, choose an analysis type to run.</p>

        {/* Uploaded Files section - displays file metadata from upload */}
        <section className="mt-6 bg-white shadow-sm rounded-xl p-5 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800">Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            // Show message when no files are available
            <p className="mt-3 text-slate-500">No files found. Go back to home and upload files first.</p>
          ) : (
            // Display list of uploaded files with metadata
            <ul className="mt-3 space-y-2">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="p-2 rounded-lg border border-slate-200">
                  <span className="font-medium">{file.name}</span> - {file.type} - {(file.size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Analysis Types section - interactive buttons for different analysis types */}
        <section className="mt-6 bg-white shadow-sm rounded-xl p-5 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800">Analysis Types</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {/* Render analysis option buttons */}
            {analysisOptions.map(option => (
              <button
                key={option.key}
                className={`text-left p-4 border rounded-xl transition ${
                  selectedAnalysis === option.key
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-300 bg-white hover:border-blue-400"
                }`}
                onClick={() => runAnalysis(option.key)}
                disabled={isAnalyzing}
              >
                <h3 className="font-semibold">{option.label}</h3>
                <p className="text-sm text-slate-600 mt-1">Run this analysis on ingested data.</p>
              </button>
            ))}
          </div>

          {/* Analysis Results section - shows loading, errors, or results */}
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            {/* Loading state during analysis */}
            {isAnalyzing && (
              <div className="flex items-center gap-3 text-blue-700">
                <span className="loader h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                <span>Running analysis... please wait.</span>
              </div>
            )}

            {/* Error state if analysis fails */}
            {analysisError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <strong>Error:</strong> {analysisError}
              </div>
            )}

            {/* Success state showing analysis results */}
            {analysisResult && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 text-slate-800">
                <h3 className="font-semibold text-green-700">Analysis result ({analysisOptions.find(o => o.key === selectedAnalysis)?.label})</h3>
                <p className="mt-2 whitespace-pre-line">{analysisResult}</p>
              </div>
            )}

            {/* Default state when no analysis has been run */}
            {!isAnalyzing && !analysisResult && !analysisError && (
              <p className="text-slate-600">Select an analysis type to run on the uploaded files.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analysis;
