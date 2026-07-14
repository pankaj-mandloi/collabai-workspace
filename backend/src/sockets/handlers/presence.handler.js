import { SOCKET_EVENTS } from "../events.js";
import Workspace from "../../models/workspace.model.js";
import userService from "../../services/user.service.js"; // ✅ Import userService

/**
 * Online users tracking
 * Structure: { workspaceId: Set<userId> }
 */
const onlineUsers = new Map();

/**
 * Socket-to-user mapping for cleanup
 * Structure: { socketId: { userId, workspaces: Set<workspaceId> } }
 */
const socketUsers = new Map();

/**
 * Register presence event handlers
 */
const registerPresenceHandlers = (io, socket) => {
  // Initialize socket user tracking
  socketUsers.set(socket.id, {
    userId: socket.userId,
    workspaces: new Set(),
  });

  /**
   * Join workspace room
   * Data: { workspaceId }
   */
  socket.on(SOCKET_EVENTS.WORKSPACE_JOIN, async ({ workspaceId }, callback) => {
    try {
      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }

      // Verify user is member of workspace
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      if (!workspace.isMember(socket.userId)) {
        throw new Error("You are not a member of this workspace");
      }

      const roomId = `workspace:${workspaceId}`;

      // Join socket.io room
      socket.join(roomId);

      // Track online user for this workspace
      if (!onlineUsers.has(workspaceId)) {
        onlineUsers.set(workspaceId, new Set());
      }
      onlineUsers.get(workspaceId).add(socket.userId);

      // Track workspace in socket
      socketUsers.get(socket.id)?.workspaces.add(workspaceId);

      // Notify workspace that user joined
      socket.to(roomId).emit(SOCKET_EVENTS.USER_ONLINE, {
        userId: socket.userId,
        user: {
          _id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          email: socket.user.email,
          avatar: socket.user.avatar,
          status: socket.user.status || "online", // ✅ Add status
        },
        workspaceId,
      });

      // Send current online users list to joining user
      const onlineUserIds = Array.from(onlineUsers.get(workspaceId));
      socket.emit(SOCKET_EVENTS.ONLINE_USERS, {
        workspaceId,
        userIds: onlineUserIds,
      });

      console.log(
        `👥 ${socket.user.email} joined workspace ${workspace.name}`
      );

      if (callback) {
        callback({
          success: true,
          onlineUsers: onlineUserIds,
        });
      }
    } catch (error) {
      console.error("❌ Workspace join error:", error.message);
      if (callback) callback({ success: false, error: error.message });
      socket.emit(SOCKET_EVENTS.ERROR, {
        event: SOCKET_EVENTS.WORKSPACE_JOIN,
        message: error.message,
      });
    }
  });

  /**
   * Leave workspace room
   * Data: { workspaceId }
   */
  socket.on(SOCKET_EVENTS.WORKSPACE_LEAVE, ({ workspaceId }) => {
    if (!workspaceId) return;

    const roomId = `workspace:${workspaceId}`;

    // Leave socket.io room
    socket.leave(roomId);

    // Remove from online users
    if (onlineUsers.has(workspaceId)) {
      onlineUsers.get(workspaceId).delete(socket.userId);

      // Clean up empty workspace entries
      if (onlineUsers.get(workspaceId).size === 0) {
        onlineUsers.delete(workspaceId);
      }
    }

    // Remove from socket tracking
    socketUsers.get(socket.id)?.workspaces.delete(workspaceId);

    // Notify workspace
    socket.to(roomId).emit(SOCKET_EVENTS.USER_OFFLINE, {
      userId: socket.userId,
      workspaceId,
    });

    console.log(`👋 User left workspace ${workspaceId}`);
  });

  // ============================================
  // ✅ NEW: User Status Update
  // ============================================

  /**
   * Update user status and broadcast to all workspaces
   * Data: { status, statusMessage }
   */
  socket.on("user:status", async ({ status, statusMessage }) => {
    try {
      if (!status) {
        throw new Error("Status is required");
      }

      // Update user status in database
      const updatedUser = await userService.updateStatus(
        socket.userId,
        status,
        statusMessage || ""
      );

      // Broadcast to all workspaces user is in
      const socketUser = socketUsers.get(socket.id);
      if (socketUser) {
        socketUser.workspaces.forEach((workspaceId) => {
          const roomId = `workspace:${workspaceId}`;
          socket.to(roomId).emit("user:status", {
            userId: socket.userId,
            user: {
              _id: updatedUser._id,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
              avatar: updatedUser.avatar,
              status: updatedUser.status,
              statusMessage: updatedUser.statusMessage || "",
            },
            workspaceId,
          });
        });
      }

      console.log(`🔄 User status updated: ${socket.user.email} → ${status}`);

      // Also update online users list
      // Update onlineUsers map with new status info if needed
      // For now, just broadcast the status change
    } catch (error) {
      console.error("❌ Status update error:", error.message);
      socket.emit(SOCKET_EVENTS.ERROR, {
        event: "user:status",
        message: error.message,
      });
    }
  });

  /**
   * Handle disconnect - cleanup all workspaces
   */
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const socketUser = socketUsers.get(socket.id);

    if (socketUser) {
      // Remove user from all workspaces they were in
      socketUser.workspaces.forEach((workspaceId) => {
        const roomId = `workspace:${workspaceId}`;

        // Remove from online users
        if (onlineUsers.has(workspaceId)) {
          onlineUsers.get(workspaceId).delete(socketUser.userId);

          if (onlineUsers.get(workspaceId).size === 0) {
            onlineUsers.delete(workspaceId);
          }
        }

        // Notify workspace
        socket.to(roomId).emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId: socketUser.userId,
          workspaceId,
        });
      });

      // Cleanup socket tracking
      socketUsers.delete(socket.id);
    }
  });
};

/**
 * Utility: Get online users for a workspace
 */
export const getOnlineUsers = (workspaceId) => {
  return Array.from(onlineUsers.get(workspaceId) || []);
};

/**
 * Utility: Check if user is online in workspace
 */
export const isUserOnline = (workspaceId, userId) => {
  return onlineUsers.get(workspaceId)?.has(userId) || false;
};

export default registerPresenceHandlers;