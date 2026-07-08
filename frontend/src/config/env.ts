export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
} as const;