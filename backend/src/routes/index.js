import { Router } from "express";
import userRoutes from "./user.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import messageRoutes  from "./message.routes.js"

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
router.use("/workspaces", workspaceRoutes);
router.use("/messages",messageRoutes);

export default router;