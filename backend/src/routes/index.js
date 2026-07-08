import { Router } from "express";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({
    message: "🚀 CollabAI API v1",
    status: "healthy",
    version: "1.0.0",
  });
});

// Feature routes (will be added as we build)
// router.use("/auth", authRoutes);
// router.use("/workspaces", workspaceRoutes);
// router.use("/messages", messageRoutes);
// router.use("/tasks", taskRoutes);

export default router;