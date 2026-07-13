import notificationService from "../services/notification.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class NotificationController {
  /**
   * GET /api/v1/notifications
   * Get user's notifications
   */
  getNotifications = asyncHandler(async (req, res) => {
    const { page, limit, unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(
      req.user._id,
      { page, limit, unreadOnly: unreadOnly === "true" }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Notifications fetched"));
  });

  /**
   * GET /api/v1/notifications/unread-count
   * Get unread count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { count }, "Unread count fetched"));
  });

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark single notification as read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(
      id,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, notification, "Marked as read"));
  });

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all as read
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const count = await notificationService.markAllAsRead(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { markedCount: count }, "All marked as read")
      );
  });

  /**
   * DELETE /api/v1/notifications/:id
   * Delete single notification
   */
  deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Notification deleted"));
  });

  /**
   * DELETE /api/v1/notifications/read
   * Delete all read notifications
   */
  deleteAllRead = asyncHandler(async (req, res) => {
    const count = await notificationService.deleteAllRead(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { deletedCount: count }, "Read notifications deleted")
      );
  });
}

export default new NotificationController();