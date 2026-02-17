// frontend/src/lib/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  // RIMOSSO IL /api FINALE QUI:
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // RIMOSSO IL /api FINALE ANCHE QUI:
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/refresh`, 
            { refresh_token: refreshToken }
          );
          
          const newAccessToken = res.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.warn("Session revoked or expired. Logging out.");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);