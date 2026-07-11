// User info in message (populated sender)
export interface MessageUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  username?: string;
}

// Reaction on message
export interface MessageReaction {
  emoji: string;
  users: string[]; // Array of user IDs
}

// Attachment on message
export interface MessageAttachment {
  type: "image" | "file" | "video" | "audio";
  url: string;
  name: string;
  size?: number;
}

// Reply reference (populated)
export interface MessageReply {
  _id: string;
  content: string;
  sender: MessageUser;
  createdAt: string;
}

// Main message type
export interface Message {
  _id: string;
  content: string;
  type: "text" | "system" | "ai";
  sender: MessageUser;
  workspace: string;
  replyTo?: MessageReply | null;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  mentions: MessageUser[];
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination info
export interface MessagePagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

// Messages fetch response
export interface MessagesResponse {
  messages: Message[];
  pagination: MessagePagination;
}

// API payloads
export interface SendMessagePayload {
  content: string;
  workspaceId: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
}

export interface EditMessagePayload {
  content: string;
}

export interface AddReactionPayload {
  emoji: string;
}

// Typing user info (from socket)
export interface TypingUser {
  userId: string;
  user: MessageUser;
  workspaceId: string;
}

// Online users response
export interface OnlineUsersResponse {
  workspaceId: string;
  userIds: string[];
}