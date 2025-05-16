import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// Define the configuration for our API instance
const apiConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  withCredentials: true,
};

export const api: AxiosInstance = axios.create(apiConfig);
export const authApi: AxiosInstance = axios.create(apiConfig);