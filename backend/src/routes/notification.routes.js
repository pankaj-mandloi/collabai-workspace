import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Get notifications (paginated)
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all as read (BEFORE :id routes)
router.patch("/read-all", notificationController.markAllAsRead);

// Delete all read notifications (BEFORE :id routes)
router.delete("/read", notificationController.deleteAllRead);

// Mark single as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete single notification
router.delete("/:id", notificationController.deleteNotification);

export default router;