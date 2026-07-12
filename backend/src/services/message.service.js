import Message from "../models/message.model.js";
import Workspace from "../models/workspace.model.js";
import ApiError from "../utils/ApiError.js";

class MessageService {
  /**
   * Send new message to workspace
   * Only workspace members can send
   */
  async sendMessage(data, user) {
    try {
      const { content, workspaceId, replyTo, attachments } = data;

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Message content is required");
      }

      if (content.length > 5000) {
        throw new ApiError(400, "Message too long (max 5000 characters)");
      }

      // Verify workspace exists and user is member
      // Populate members.user so we can extract emails for mentions
      const workspace = await Workspace.findById(workspaceId).populate(
        "members.user",
        "email username firstName lastName",
      );

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.isActive) {
        throw new ApiError(404, "Workspace no longer active");
      }

      if (!workspace.isMember(user._id)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      // Extract mentions from content (e.g., @username)
      const mentionMatches = content.match(/@(\w+)/g) || [];
      const mentionUsernames = mentionMatches.map((m) => m.substring(1));

      // Find mentioned users from workspace members
      const mentionedUsers = workspace.members
        .filter((m) => {
          if (!m.user) return false;
          const username = m.user.username || m.user.email?.split("@")[0] || "";
          return mentionUsernames.includes(username);
        })
        .map((m) => m.user._id);

      // Create message
      let message = await Message.create({
        content: content.trim(),
        type: "text",
        sender: user._id,
        workspace: workspaceId,
        replyTo: replyTo || null,
        attachments: attachments || [],
        mentions: mentionedUsers,
      });

      // Populate for real-time broadcast
      message = await Message.findById(message._id)
        .populate("sender", "firstName lastName email avatar username")
        .populate({
          path: "replyTo",
          populate: {
            path: "sender",
            select: "firstName lastName email avatar",
          },
        })
        .populate("mentions", "firstName lastName email avatar");

      console.log(
        `✅ Message sent by ${user.email} in workspace ${workspace.name}`,
      );
      // Auto-embed message for RAG (async, don't wait)
      try {
        const { getRAGService } = await import("./rag.service.js");
        const ragService = getRAGService();
        ragService
          .embedMessage(message._id)
          .catch((err) =>
            console.error("Auto-embed message failed:", err.message),
          );
      } catch (embedError) {
        // Don't fail message send if embedding fails
        console.error("Embedding init failed:", embedError.message);
      }

      return message;
    } catch (error) {
      console.error("❌ Error sending message:", error.message);
      throw error;
    }
  }

  /**
   * Get workspace messages with pagination
   * Returns messages in reverse chronological order (latest first)
   */
  async getWorkspaceMessages(workspaceId, userId, options = {}) {
    try {
      const { page = 1, limit = 50, before } = options;

      // Verify workspace access
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      // Build query
      const query = {
        workspace: workspaceId,
        isDeleted: false,
      };

      // If 'before' timestamp provided (for loading older messages)
      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      // Fetch messages
      const messages = await Message.find(query)
        .sort({ createdAt: -1 }) // Latest first
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate("sender", "firstName lastName email avatar username")
        .populate({
          path: "replyTo",
          populate: {
            path: "sender",
            select: "firstName lastName email avatar",
          },
        })
        .populate("mentions", "firstName lastName email avatar");

      // Get total count for pagination info
      const totalCount = await Message.countDocuments(query);

      // Reverse to show oldest first in UI (chat scrolls up)
      const orderedMessages = messages.reverse();

      return {
        messages: orderedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: messages.length === parseInt(limit),
        },
      };
    } catch (error) {
      console.error("❌ Error fetching messages:", error.message);
      throw error;
    }
  }

  /**
   * Get single message by ID
   */
  async getMessageById(messageId, userId) {
    try {
      const message = await Message.findById(messageId)
        .populate("sender", "firstName lastName email avatar username")
        .populate("workspace", "name slug")
        .populate({
          path: "replyTo",
          populate: {
            path: "sender",
            select: "firstName lastName email avatar",
          },
        })
        .populate("mentions", "firstName lastName email avatar");

      if (!message || message.isDeleted) {
        throw new ApiError(404, "Message not found");
      }

      // Verify user has access to workspace
      const workspace = await Workspace.findById(message.workspace);

      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      return message;
    } catch (error) {
      console.error("❌ Error fetching message:", error.message);
      throw error;
    }
  }

  /**
   * Edit message
   * Only sender can edit within 15 minutes
   */
  async editMessage(messageId, content, userId) {
    try {
      if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Message content is required");
      }

      if (content.length > 5000) {
        throw new ApiError(400, "Message too long (max 5000 characters)");
      }

      const message = await Message.findById(messageId);

      if (!message || message.isDeleted) {
        throw new ApiError(404, "Message not found");
      }

      if (!message.canEdit(userId)) {
        throw new ApiError(
          403,
          "Cannot edit message (either not sender or edit window expired)",
        );
      }

      message.content = content.trim();
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      // Return populated message
      const updatedMessage = await Message.findById(messageId)
        .populate("sender", "firstName lastName email avatar username")
        .populate("workspace", "name slug")
        .populate("mentions", "firstName lastName email avatar");

      console.log(`✅ Message edited by user ${userId}`);
      return updatedMessage;
    } catch (error) {
      console.error("❌ Error editing message:", error.message);
      throw error;
    }
  }

  /**
   * Delete message (soft delete)
   * Only sender can delete
   */
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message || message.isDeleted) {
        throw new ApiError(404, "Message not found");
      }

      if (!message.canDelete(userId)) {
        throw new ApiError(403, "You can only delete your own messages");
      }

      // Soft delete
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = "This message was deleted";
      await message.save();

      console.log(`✅ Message deleted by user ${userId}`);
      return message;
    } catch (error) {
      console.error("❌ Error deleting message:", error.message);
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId, emoji, userId) {
    try {
      if (!emoji) {
        throw new ApiError(400, "Emoji is required");
      }

      const message = await Message.findById(messageId);

      if (!message || message.isDeleted) {
        throw new ApiError(404, "Message not found");
      }

      // Verify workspace access
      const workspace = await Workspace.findById(message.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      // Find existing reaction with this emoji
      const existingReaction = message.reactions.find((r) => r.emoji === emoji);

      if (existingReaction) {
        // Toggle: if user already reacted, remove. Otherwise add.
        const userIndex = existingReaction.users.findIndex(
          (u) => u.toString() === userId.toString(),
        );

        if (userIndex > -1) {
          existingReaction.users.splice(userIndex, 1);

          // Remove reaction entry if no users left
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions.filter(
              (r) => r.emoji !== emoji,
            );
          }
        } else {
          existingReaction.users.push(userId);
        }
      } else {
        // Add new reaction
        message.reactions.push({
          emoji,
          users: [userId],
        });
      }

      await message.save();

      const updatedMessage = await Message.findById(messageId)
        .populate("sender", "firstName lastName email avatar username")
        .populate("reactions.users", "firstName lastName email avatar");

      return updatedMessage;
    } catch (error) {
      console.error("❌ Error adding reaction:", error.message);
      throw error;
    }
  }

  /**
   * Get message count for workspace
   */
  async getMessageCount(workspaceId) {
    try {
      const count = await Message.countDocuments({
        workspace: workspaceId,
        isDeleted: false,
      });
      return count;
    } catch (error) {
      console.error("❌ Error counting messages:", error.message);
      throw error;
    }
  }
}

export default new MessageService();
