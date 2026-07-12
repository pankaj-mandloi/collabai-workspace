import { Router } from "express";
import aiController from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/status", aiController.status);
router.post("/chat", aiController.chat);
router.post("/chat/history", aiController.chatWithHistory);
router.post("/chat/workspace", aiController.chatWithWorkspaceContext);
router.post("/summarize", aiController.summarize);
router.post("/generate", aiController.generate);

export default router;