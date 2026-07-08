import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes protected
router.get("/me", protect, userController.getCurrentUser);
router.patch("/me", protect, userController.updateProfile);

export default router;