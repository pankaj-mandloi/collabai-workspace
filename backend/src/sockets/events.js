/**
 * Socket.io event constants
 * Centralized to avoid typos and easy refactoring
 */

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Workspace
  WORKSPACE_JOIN: "workspace:join",
  WORKSPACE_LEAVE: "workspace:leave",
  WORKSPACE_JOINED: "workspace:joined",
  WORKSPACE_LEFT: "workspace:left",

  // Messages
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
  MESSAGE_UPDATE: "message:update",
  MESSAGE_DELETE: "message:delete",
  MESSAGE_REACTION: "message:reaction",

  // Typing
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  USER_TYPING: "user:typing",
  USER_STOPPED_TYPING: "user:stopped-typing",

  // Presence
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  ONLINE_USERS: "online:users",

  // Errors
  ERROR: "error",
};