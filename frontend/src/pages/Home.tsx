import React, { useState } from "react";

const Home: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type === "image/png" || file.type === "application/pdf");
    setSelectedFiles(validFiles);
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
          <header className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">
              Symplistic.AI Intelligent Banking Analyst
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-600">
              Analyze customer data, detect risks, and generate actionable financial insights.
            </p>
          </header>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">Data Ingestion</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Upload transaction history, customer profiles, and documents for structured AI ingestion.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".png,.pdf"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Ingest Data
                  </button>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Uploaded Files:</p>
                      <ul className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-sm">{file.name} ({file.type})</span>
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
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Run Analysis
                </button>
              </article>
            </div>

            <article className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-blue-800">Expected Output</h2>
              <p className="mt-2 text-sm text-slate-600">
                Provide evidence-backed insights with clear recommendations and risk-next steps.
              </p>

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