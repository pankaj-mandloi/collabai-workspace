import { Router } from "express";
import webhookController from "../controllers/webhook.controller.js";

const router = Router();

router.post("/clerk", webhookController.clerkWebhook);

export default router;