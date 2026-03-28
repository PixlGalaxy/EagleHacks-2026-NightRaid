
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  if (import.meta.env.DEV) {
    //DEV 
    return 'http://127.0.0.1:3000';
  } else {
    //PROD
    return '/backend';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  uptime: `${API_BASE_URL}/uptime`,
  health: `${API_BASE_URL}/health`,
  ollamaGenerate: `${API_BASE_URL}/ollama/generate`,
  ollamaModels: `${API_BASE_URL}/ollama/models`,
};

// API Helper Function
export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  fetchAPI,
};
