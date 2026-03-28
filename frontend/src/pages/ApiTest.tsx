import React, { useState } from 'react';
import { API_ENDPOINTS, fetchAPI } from '../config';
import { Send, Copy, RefreshCw, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const ApiTest: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('uptime');
  const [prompt, setPrompt] = useState<string>('What is the weather today?');
  const [model, setModel] = useState<string>('llama2');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number>(0);

  const endpoints = [
    { id: 'uptime', name: 'Uptime', method: 'GET', url: API_ENDPOINTS.uptime },
    { id: 'health', name: 'Health', method: 'GET', url: API_ENDPOINTS.health },
    { id: 'ollama-models', name: 'Ollama Models', method: 'GET', url: API_ENDPOINTS.ollamaModels },
    { id: 'ollama-generate', name: 'Ollama Generate', method: 'POST', url: API_ENDPOINTS.ollamaGenerate },
  ];

  const makeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      let result;
      const endpoint = endpoints.find((e) => e.id === selectedEndpoint);

      if (selectedEndpoint === 'ollama-generate') {
        result = await fetchAPI(API_ENDPOINTS.ollamaGenerate, {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            model,
          }),
        });
      } else if (selectedEndpoint === 'ollama-models') {
        result = await fetchAPI(API_ENDPOINTS.ollamaModels);
      } else if (selectedEndpoint === 'health') {
        result = await fetchAPI(API_ENDPOINTS.health);
      } else {
        result = await fetchAPI(API_ENDPOINTS.uptime);
      }

      const endTime = performance.now();
      setResponseTime(endTime - startTime);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
  };

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Test Console</h1>
          <p className="text-gray-600">Test NightRaid Backend API endpoints</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Endpoint Selection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h2>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                      selectedEndpoint === endpoint.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{endpoint.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        endpoint.method === 'GET'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {endpoint.method}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">API Base URL</h3>
              <p className="text-xs text-gray-600 break-all font-mono">{currentEndpoint?.url}</p>
            </div>
          </div>

          {/* Right Panel - Request & Response */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request</h2>

              {selectedEndpoint === 'ollama-generate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter your prompt"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. llama2"
                    />
                  </div>
                </div>
              )}

              {selectedEndpoint === 'uptime' && (
                <div className="text-sm text-gray-600">
                  No parameters required. Click Send to fetch server uptime information.
                </div>
              )}

              {selectedEndpoint === 'health' && (
                <div className="text-sm text-gray-600">
                  No parameters required. Click Send to check server health.
                </div>
              )}

              {selectedEndpoint === 'ollama-models' && (
                <div className="text-sm text-gray-600">
                  No parameters required. Click Send to fetch available Ollama models.
                </div>
              )}

              <button
                onClick={makeRequest}
                disabled={loading}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Request
                  </>
                )}
              </button>
            </div>

            {/* Response Section */}
            {(response || error) && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Response</h2>
                    {response && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle size={16} />
                        {responseTime.toFixed(0)}ms
                      </span>
                    )}
                    {error && (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle size={16} />
                        Error
                      </span>
                    )}
                  </div>
                  {response && (
                    <button
                      onClick={copyToClipboard}
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm font-mono">
                    {error}
                  </div>
                )}

                {response && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto max-h-96">
                    <pre className="text-sm text-gray-800 font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">API Configuration</h3>
          <p className="text-sm text-blue-800">
            API Base URL is configured from environment variables. 
            In development (npm run dev): http://localhost:3000. 
            In production (Docker): /backend
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
