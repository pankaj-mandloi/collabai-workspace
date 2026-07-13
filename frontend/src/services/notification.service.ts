import api from "./api";
import { NotificationsResponse } from "@/types/notification.types";
import { ApiResponse } from "@/types/workspace.types";

class NotificationService {
  async getNotifications(options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.unreadOnly) params.append("unreadOnly", "true");

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<ApiResponse<NotificationsResponse>>(url);
    return response.data.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return response.data.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<number> {
    const response = await api.patch<ApiResponse<{ markedCount: number }>>(
      "/notifications/read-all"
    );
    return response.data.data.markedCount;
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async deleteAllRead(): Promise<number> {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>(
      "/notifications/read"
    );
    return response.data.data.deletedCount;
  }
}

export const notificationService = new NotificationService();