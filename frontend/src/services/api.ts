import axios, { AxiosInstance } from "axios";
import { env } from "@/config/env";

const api: AxiosInstance = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Clerk load hone tak wait karta hai — request ke andar, mount pe nahi
async function waitForClerk(maxRetries = 30, interval = 100) {
  let tries = 0;
  while (!(window as any).Clerk?.session && tries < maxRetries) {
    await new Promise((r) => setTimeout(r, interval));
    tries++;
  }
  return (window as any).Clerk;
}

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const clerk = await waitForClerk();
      if (clerk?.session) {
        try {
          const token = await clerk.session.getToken({ skipCache: true });
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("❌ Error getting token:", error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  },
);

export default api;