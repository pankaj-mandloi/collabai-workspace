import Notification from "../models/notification.model.js";
import ApiError from "../utils/ApiError.js";

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data) {
    try {
      const {
        recipientId,
        senderId,
        type,
        title,
        description,
        workspaceId,
        link,
      } = data;

      const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId || null,
        type,
        title,
        description: description || "",
        workspace: workspaceId || null,
        link: link || "",
      });

      // Populate for response
      const populated = await Notification.findById(notification._id)
        .populate("sender", "firstName lastName email avatar")
        .populate("workspace", "name slug");

      console.log(`✅ Notification created: ${type} for user ${recipientId}`);
      return populated;
    } catch (error) {
      console.error("❌ Error creating notification:", error.message);
      throw error;
    }
  }

  /**
   * Create notifications for multiple recipients
   */
  async createBulkNotifications(recipientIds, data) {
    try {
      const notifications = await Promise.all(
        recipientIds.map((recipientId) =>
          this.createNotification({
            ...data,
            recipientId,
          })
        )
      );

      console.log(
        `✅ ${notifications.length} notifications created for ${data.type}`
      );
      return notifications;
    } catch (error) {
      console.error("❌ Error creating bulk notifications:", error.message);
      throw error;
    }
  }

  /**
   * Get user's notifications (paginated)
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;

      const query = { recipient: userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate("sender", "firstName lastName email avatar")
        .populate("workspace", "name slug");

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

      return {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
        },
        unreadCount,
      };
    } catch (error) {
      console.error("❌ Error fetching notifications:", error.message);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });
      return count;
    } catch (error) {
      console.error("❌ Error getting unread count:", error.message);
      return 0;
    }
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new ApiError(404, "Notification not found");
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
      }

      return notification;
    } catch (error) {
      console.error("❌ Error marking as read:", error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
      return result.modifiedCount;
    } catch (error) {
      console.error("❌ Error marking all as read:", error.message);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new ApiError(404, "Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("❌ Error deleting notification:", error.message);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId) {
    try {
      const result = await Notification.deleteMany({
        recipient: userId,
        isRead: true,
      });

      console.log(`✅ Deleted ${result.deletedCount} read notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error("❌ Error deleting read notifications:", error.message);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS — Create specific notifications
  // ============================================

  /**
   * Notify about workspace invitation
   */
  async notifyWorkspaceInvitation(recipientId, senderId, workspace) {
    return this.createNotification({
      recipientId,
      senderId,
      type: "workspace_invitation",
      title: "Workspace Invitation",
      description: `You've been invited to join "${workspace.name}"`,
      workspaceId: workspace._id,
      link: `/dashboard`,
    });
  }

  /**
   * Notify about task assignment
   */
  async notifyTaskAssigned(recipientId, senderId, task, workspace) {
    return this.createNotification({
      recipientId,
      senderId,
      type: "task_assigned",
      title: "Task Assigned",
      description: `You've been assigned: "${task.title}"`,
      workspaceId: workspace._id,
      link: `/workspace/${workspace._id}/tasks`,
    });
  }

  /**
   * Notify about new member joining
   */
  async notifyMemberJoined(recipientIds, newMember, workspace) {
    return this.createBulkNotifications(recipientIds, {
      senderId: newMember._id,
      type: "member_joined",
      title: "New Member",
      description: `${newMember.firstName || newMember.email} joined "${workspace.name}"`,
      workspaceId: workspace._id,
      link: `/workspace/${workspace._id}/settings`,
    });
  }
}

export default new NotificationService();