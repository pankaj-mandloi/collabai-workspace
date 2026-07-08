import { Router } from "express";
import userRoutes from "./user.routes.js";

const router = Router();

// API v1 root
router.get("/", (req, res) => {
  res.json({
    message: "🚀 CollabAI API v1",
    status: "healthy",
    version: "1.0.0",
  });
});

// Feature routes
router.use("/users", userRoutes);

export default router;