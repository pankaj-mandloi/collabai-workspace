import axios, { AxiosInstance } from "axios";
import { env } from "@/config/env";

const api: AxiosInstance = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor - Add auth token from Clerk
api.interceptors.request.use(
  async (config) => {
    // Get token from Clerk (works in browser)
    if (typeof window !== "undefined") {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

export default api;