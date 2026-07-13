export interface NotificationUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

export interface NotificationWorkspace {
  _id: string;
  name: string;
  slug: string;
}

export type NotificationType =
  | "workspace_invitation"
  | "invitation_accepted"
  | "new_message"
  | "task_assigned"
  | "task_updated"
  | "document_shared"
  | "member_joined"
  | "member_removed"
  | "ai_response";

export interface Notification {
  _id: string;
  recipient: string;
  sender?: NotificationUser;
  type: NotificationType;
  title: string;
  description: string;
  workspace?: NotificationWorkspace;
  link: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  unreadCount: number;
}