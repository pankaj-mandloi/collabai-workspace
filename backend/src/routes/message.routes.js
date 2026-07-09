import { Router } from "express";
import messageController from "../controllers/message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  sendMessageSchema,
  getWorkspaceMessagesSchema,
  messageIdSchema,
  editMessageSchema,
  addReactionSchema,
  messageCountSchema,
} from "../validators/message.validator.js";

const router = Router();

// All routes require authentication
router.use(protect);

// ============================================
// MESSAGE ROUTES
// ============================================

// POST /api/v1/messages - Send new message
router.post(
  "/",
  validate(sendMessageSchema),
  messageController.sendMessage
);

// GET /api/v1/messages/workspace/:workspaceId - Get workspace messages
router.get(
  "/workspace/:workspaceId",
  validate(getWorkspaceMessagesSchema),
  messageController.getWorkspaceMessages
);

// GET /api/v1/messages/workspace/:workspaceId/count - Get message count
router.get(
  "/workspace/:workspaceId/count",
  validate(messageCountSchema),
  messageController.getMessageCount
);

// GET /api/v1/messages/:id - Get single message
router.get(
  "/:id",
  validate(messageIdSchema),
  messageController.getMessageById
);

// PATCH /api/v1/messages/:id - Edit message
router.patch(
  "/:id",
  validate(editMessageSchema),
  messageController.editMessage
);

// DELETE /api/v1/messages/:id - Delete message
router.delete(
  "/:id",
  validate(messageIdSchema),
  messageController.deleteMessage
);

// POST /api/v1/messages/:id/reactions - Add/toggle reaction
router.post(
  "/:id/reactions",
  validate(addReactionSchema),
  messageController.addReaction
);

export default router;