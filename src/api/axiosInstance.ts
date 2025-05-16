import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// Base API URL
const API_URL = 'http://0.0.0.0:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store access token in memory (not localStorage)
let accessToken: string | null = null;

// Function to set the access token
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Function to get the access token
export const getAccessToken = () => {
  return accessToken;
};

// Request interceptor to add Authorization header with access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Skip token refresh for login endpoint
    const isLoginRequest = originalRequest.url === '/login';
    
    // If error is 401 (Unauthorized) and we haven't retried yet and it's not a login request
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.get(`${API_URL}/refresh`, {
          withCredentials: true, // Important for accessing the httpOnly cookie
        });
        
        // If refresh successful, set the new access token
        if (response.data.access_token) {
          setAccessToken(response.data.access_token);
          
          // Update the Authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${response.data.access_token}` };
          }
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear the token but don't redirect here
        // Let the auth context handle redirections
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 