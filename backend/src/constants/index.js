// Application-wide constants

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
};

// Workspace Roles
export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
};

// Task Status
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

// Task Priority
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Chat
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // Tasks
  TASK_CREATE: "task:create",
  TASK_UPDATE: "task:update",
  TASK_DELETE: "task:delete",

  // Documents
  DOCUMENT_UPDATE: "document:update",
  CURSOR_UPDATE: "cursor:update",

  // Workspace
  MEMBER_JOIN: "member:join",
  MEMBER_LEAVE: "member:leave",
};

// API Response Messages
export const MESSAGES = {
  SUCCESS: "Operation successful",
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  VALIDATION_ERROR: "Validation failed",
};