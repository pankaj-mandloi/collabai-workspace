import axios, { AxiosInstance } from "axios";
import { env } from "@/config/env";

const api: AxiosInstance = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (add auth token later)
api.interceptors.request.use(
  (config) => {
    // Add auth token here later
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;