import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// CORS Setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check (root)
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

// Error handling middleware (MUST be last)
app.use(errorMiddleware);

export default app;