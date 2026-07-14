import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes protected
router.get("/me", protect, userController.getCurrentUser);
router.patch("/me", protect, userController.updateProfile);

// ============================================
// ✅ NEW: User Status Routes
// ============================================

// Get current user's status
router.get("/me/status", protect, userController.getStatus);

// Update current user's status
router.patch("/me/status", protect, userController.updateStatus);

// Get all users in workspace with status
router.get("/workspace/:workspaceId/status", protect, userController.getWorkspaceUsersStatus);

export default router;