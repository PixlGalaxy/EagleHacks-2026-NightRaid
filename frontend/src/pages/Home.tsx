import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Home component: Main landing page for the Symplistic.AI Banking Analyst application
// Handles file upload and navigation to analysis page
const Home: React.FC = () => {
  // Navigation hook for routing to analysis page
  const navigate = useNavigate();

  // State for managing selected files before upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // State for tracking upload progress and disabling UI during upload
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection from input element
  // Filters to only accept PNG and PDF files
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type === "image/png" || file.type === "application/pdf");
    setSelectedFiles(validFiles);
  };

  // Handle file upload to backend server
  // Sends files as FormData to /main/upload endpoint
  const handleUpload = async () => {
    // Validate that files are selected before attempting upload
    if (selectedFiles.length === 0) {
      alert("Select at least one file before uploading.");
      return;
    }

    // Set uploading state to show progress and disable interactions
    setIsUploading(true);

    // Prepare FormData for multipart file upload
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      // Send POST request to backend upload endpoint
      const res = await fetch("http://localhost:5000/main/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Upload successful - show confirmation and save file metadata
        alert("Files uploaded successfully!");

        // Extract file metadata for persistence (name, type, size)
        const savedFiles = selectedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        }));

        // Store uploaded file metadata in localStorage for analysis page access
        localStorage.setItem("uploadedFiles", JSON.stringify(savedFiles));

        // Clear selected files from state after successful upload
        setSelectedFiles([]);
      } else {
        // Handle upload failure with user notification
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      // Handle network or other errors during upload
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      // Always reset uploading state regardless of success/failure
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Page metadata for SEO and browser tab */}
      <title>Symplistic.AI Banking Analyst</title>
      <meta
        name="description"
        content="Intelligent Banking Analyst demo UI with ingest, insights, risk signals, and recommendations."
      />

      {/* Main page container with gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Page header with title and description */}
          <header className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">
              Symplistic.AI Intelligent Banking Analyst
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-600">
              Analyze customer data, detect risks, and generate actionable financial insights.
            </p>
          </header>

          {/* Main content sections */}
          <section className="space-y-6">
            {/* Two-column grid for main features */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Data Ingestion section - handles file upload */}
              <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">Data Ingestion</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Upload transaction history, customer profiles, and documents for structured AI ingestion.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {/* File input for selecting PNG/PDF files */}
                  <input
                    type="file"
                    accept=".png,.pdf"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />

                  {/* Upload button - triggers file upload to backend */}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Ingest Data"}
                  </button>

                  {/* Display selected files with previews */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Uploaded Files:</p>
                      <ul className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-sm">{file.name} ({file.type})</span>
                            {/* Show image preview for PNG files */}
                            {file.type === "image/png" && (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview of ${file.name}`}
                                className="max-h-20 rounded border border-slate-200"
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>

              {/* Analysis Workflow section - navigation to analysis page */}
              <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">Analysis Workflow</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use an orchestrated multi-step workflow for spending behavior, anomalous patterns, and risk projection.
                </p>
                <ul className="mt-3 list-disc list-inside text-sm text-slate-700">
                  <li>Spending and saving behavior</li>
                  <li>Anomaly detection (outliers and fraud signals)</li>
                  <li>Risk index and opportunity score</li>
                </ul>

                {/* Run Analysis button - navigates to analysis page with uploaded files */}
                <button
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={() => {
                    // Check for uploaded files in localStorage or current selection
                    const stored = localStorage.getItem("uploadedFiles");
                    type FileMeta = { name: string; type: string; size: number };
                    let filesForAnalysis: FileMeta[] = [];

                    if (stored) {
                      try {
                        filesForAnalysis = JSON.parse(stored) as FileMeta[];
                      } catch {
                        filesForAnalysis = [];
                      }
                    }

                    // Fallback to current selected files if no stored files
                    if (filesForAnalysis.length === 0 && selectedFiles.length > 0) {
                      filesForAnalysis = selectedFiles.map(file => ({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                      }));
                    }

                    // Require files before allowing analysis
                    if (filesForAnalysis.length === 0) {
                      alert("Upload files first, then run analysis.");
                      return;
                    }

                    // Navigate to analysis page with file metadata
                    navigate("/analysis", { state: { files: filesForAnalysis } });
                  }}
                >
                  Run Analysis
                </button>
              </article>
            </div>

            {/* Expected Output section - shows what analysis will provide */}
            <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-blue-800">Expected Output</h2>
              <p className="mt-2 text-sm text-slate-600">
                Provide evidence-backed insights with clear recommendations and risk-next steps.
              </p>

              {/* Grid of output categories */}
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                  <h3 className="font-semibold text-sky-700">Insights</h3>
                  <p className="text-xs text-slate-600 mt-2">Spending behavior summary and trends.</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <h3 className="font-semibold text-amber-700">Anomalies</h3>
                  <p className="text-xs text-slate-600 mt-2">Detected unusual transactions and inconsistencies.</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <h3 className="font-semibold text-rose-700">Risk Signals</h3>
                  <p className="text-xs text-slate-600 mt-2">High-risk flags and weak financial controls.</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <h3 className="font-semibold text-emerald-700">Recommendations</h3>
                  <p className="text-xs text-slate-600 mt-2">Actionable steps and next opportunities.</p>
                </div>
              </div>
            </article>

            {/* Judge Criteria section - evaluation requirements */}
            <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-blue-800">Judge Criteria</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc list-inside">
                <li>Ingest structured and unstructured data.</li>
                <li>Surface meaningful insights with evidence references.</li>
                <li>Identify risk/inconsistency across sources.</li>
                <li>Deliver clear, actionable next steps.</li>
              </ul>
            </article>
          </section>
        </div>
      </div>
    </>
  );
};
export default Home;