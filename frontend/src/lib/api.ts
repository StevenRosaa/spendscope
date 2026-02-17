import axios from 'axios';

// The URL of your FastAPI backend (e.g., hosted on Render)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the JWT token
apiClient.interceptors.request.use((config) => {
  // In a real production app, consider using HTTP-only cookies instead of localStorage
  // for better security against XSS attacks.
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);