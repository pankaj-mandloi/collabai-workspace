import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import webhookRoutes from "./routes/webhook.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { clerkMiddleware } from "@clerk/express"; // ✅ Ye import karo

const app = express();

// CORS Setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Webhook route (raw body needed for signature verification)
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Clerk middleware - MUST be registered BEFORE routes
app.use(clerkMiddleware());

// Health checks
app.get("/", (req, res) => {
  res.json({
    message: "🚀 CollabAI Backend is running!",
    status: "healthy",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1", routes);

// Error handler (must be last)
app.use(errorMiddleware);

export default app;