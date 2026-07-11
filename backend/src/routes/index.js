import { Router } from "express";
import userRoutes from "./user.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import messageRoutes from "./message.routes.js";
import taskRoutes from "./task.routes.js";
import documentRoutes from "./document.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "🚀 CollabAI API v1",
    status: "healthy",
    version: "1.0.0",
  });
});

router.use("/users", userRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/messages", messageRoutes);
router.use("/tasks", taskRoutes);
router.use("/documents", documentRoutes);

export default router;