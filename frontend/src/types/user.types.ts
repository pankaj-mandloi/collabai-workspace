// ============================================
// USER STATUS TYPES
// ============================================

export type UserStatus = "online" | "away" | "busy" | "offline";

export const USER_STATUS: Record<UserStatus, { label: string; color: string; emoji: string; dotColor: string }> = {
  online: {
    label: "Online",
    color: "text-emerald-400",
    emoji: "🟢",
    dotColor: "bg-emerald-400",
  },
  away: {
    label: "Away",
    color: "text-yellow-400",
    emoji: "🟡",
    dotColor: "bg-yellow-400",
  },
  busy: {
    label: "Busy",
    color: "text-red-400",
    emoji: "🔴",
    dotColor: "bg-red-400",
  },
  offline: {
    label: "Offline",
    color: "text-slate-500",
    emoji: "⚫",
    dotColor: "bg-slate-500",
  },
};

export const STATUS_OPTIONS: { value: UserStatus; label: string; emoji: string }[] = [
  { value: "online", label: "Online", emoji: "🟢" },
  { value: "away", label: "Away", emoji: "🟡" },
  { value: "busy", label: "Busy", emoji: "🔴" },
  { value: "offline", label: "Offline", emoji: "⚫" },
];

// ============================================
// USER TYPE
// ============================================

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  status: UserStatus;
  statusMessage?: string;
  workspaces: string[];
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface UserStatusResponse {
  status: UserStatus;
  statusMessage: string;
  lastActive: string;
}

export interface WorkspaceUserStatus {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  username: string;
  status: UserStatus;
  statusMessage: string;
  lastActive: string;
}

// ============================================
// API PAYLOADS
// ============================================

export interface UpdateStatusPayload {
  status: UserStatus;
  statusMessage?: string;
}