import { SOCKET_EVENTS } from "../events.js";
import messageService from "../../services/message.service.js";

/**
 * Register chat event handlers
 */
const registerChatHandlers = (io, socket) => {
  /**
   * Send message to workspace
   */
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data, callback) => {
    try {
      const { workspaceId } = data;

      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }

      // Send message via service
      const message = await messageService.sendMessage(data, socket.user);

      // Broadcast to workspace room
      const roomId = `workspace:${workspaceId}`;
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);

      console.log(`💬 Message broadcast to ${roomId} by ${socket.user.email}`);

      if (callback) {
        callback({ success: true, message });
      }
    } catch (error) {
      console.error("❌ Message send error:", error.message);
      if (callback) {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.ERROR, {
        event: SOCKET_EVENTS.MESSAGE_SEND,
        message: error.message,
      });
    }
  });

  /**
   * Update message
   */
  socket.on(SOCKET_EVENTS.MESSAGE_UPDATE, async (data, callback) => {
    try {
      const { messageId, content } = data;

      const message = await messageService.editMessage(
        messageId,
        content,
        socket.userId
      );

      // message.workspace is ObjectId (converted to string via toString)
      const workspaceId = message.workspace.toString();
      const roomId = `workspace:${workspaceId}`;
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_UPDATE, message);

      if (callback) callback({ success: true, message });
    } catch (error) {
      console.error("❌ Message update error:", error.message);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  /**
   * Delete message
   */
  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await messageService.deleteMessage(
        messageId,
        socket.userId
      );

      const workspaceId = message.workspace.toString();
      const roomId = `workspace:${workspaceId}`;
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_DELETE, {
        messageId: message._id,
        workspaceId,
      });

      if (callback) callback({ success: true });
    } catch (error) {
      console.error("❌ Message delete error:", error.message);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  /**
   * Add reaction to message
   */
  socket.on(SOCKET_EVENTS.MESSAGE_REACTION, async (data, callback) => {
    try {
      const { messageId, emoji } = data;

      const message = await messageService.addReaction(
        messageId,
        emoji,
        socket.userId
      );

      const workspaceId = message.workspace.toString();
      const roomId = `workspace:${workspaceId}`;
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_REACTION, message);

      if (callback) callback({ success: true, message });
    } catch (error) {
      console.error("❌ Reaction error:", error.message);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  /**
   * User started typing
   */
  socket.on(SOCKET_EVENTS.TYPING_START, ({ workspaceId }) => {
    if (!workspaceId) return;

    const roomId = `workspace:${workspaceId}`;

    socket.to(roomId).emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.userId,
      user: {
        _id: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        email: socket.user.email,
        avatar: socket.user.avatar,
      },
      workspaceId,
    });
  });

  /**
   * User stopped typing
   */
  socket.on(SOCKET_EVENTS.TYPING_STOP, ({ workspaceId }) => {
    if (!workspaceId) return;

    const roomId = `workspace:${workspaceId}`;

    socket.to(roomId).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
      userId: socket.userId,
      workspaceId,
    });
  });
};

export default registerChatHandlers;