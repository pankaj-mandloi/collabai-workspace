"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notification.store";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Mail,
  UserPlus,
  CheckSquare,
  MessageSquare,
  FileText,
  Bot,
  Users,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { NotificationType } from "@/types/notification.types";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Fetch on mount + every 30 seconds
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get icon for notification type
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "workspace_invitation":
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case "invitation_accepted":
        return <UserPlus className="w-4 h-4 text-lime-400" />;
      case "new_message":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "task_assigned":
        return <CheckSquare className="w-4 h-4 text-lime-400" />;
      case "task_updated":
        return <CheckSquare className="w-4 h-4 text-emerald-300" />;
      case "document_shared":
        return <FileText className="w-4 h-4 text-emerald-300" />;
      case "member_joined":
        return <Users className="w-4 h-4 text-emerald-400" />;
      case "member_removed":
        return <Users className="w-4 h-4 text-red-400" />;
      case "ai_response":
        return <Bot className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    setIsOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ✅ FIXED: Dropdown Panel - Responsive positioning */}
      {isOpen && (
        <div 
          className="
            absolute 
            top-full 
            mt-2 
            z-50 
            overflow-hidden
            right-[-120px] 
            sm:right-0 
            w-[calc(100vw-2rem)] 
            sm:w-[380px] 
            max-w-[380px]
            bg-[#0a0c0b] 
            border 
            border-white/10 
            rounded-xl 
            shadow-2xl 
            shadow-emerald-500/5
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <h3 className="font-semibold text-white text-sm truncate">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  You'll see updates here
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors border-b border-white/[0.04] last:border-b-0 ${
                      !notification.isRead ? "bg-emerald-500/[0.03]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium truncate ${
                              notification.isRead
                                ? "text-slate-300"
                                : "text-white"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                          )}
                        </div>

                        {/* Unread dot */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-600">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                        {notification.workspace && (
                          <>
                            <span className="text-[10px] text-slate-700">
                              •
                            </span>
                            <span className="text-[10px] text-slate-600 truncate">
                              {notification.workspace.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/[0.06] px-4 py-2 text-center">
              <p className="text-[10px] text-slate-600">
                {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}