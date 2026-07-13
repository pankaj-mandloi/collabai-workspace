import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Notification } from "@/types/notification.types";
import { notificationService } from "@/services/notification.service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await notificationService.getNotifications({
            limit: 20,
          });
          set({
            notifications: result.notifications,
            unreadCount: result.unreadCount,
            isLoading: false,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch notifications";
          set({ error: message, isLoading: false });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const count = await notificationService.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.error("Failed to fetch unread count");
        }
      },

      markAsRead: async (id: string) => {
        try {
          await notificationService.markAsRead(id);
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch (error: any) {
          console.error("Failed to mark as read");
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationService.markAllAsRead();
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          }));
        } catch (error: any) {
          console.error("Failed to mark all as read");
        }
      },

      deleteNotification: async (id: string) => {
        try {
          await notificationService.deleteNotification(id);
          set((state) => ({
            notifications: state.notifications.filter((n) => n._id !== id),
            unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
              ? state.unreadCount - 1
              : state.unreadCount,
          }));
        } catch (error: any) {
          console.error("Failed to delete notification");
        }
      },

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    { name: "notification-store" }
  )
);