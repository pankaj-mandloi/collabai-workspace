"use client";

import { useState } from "react";
import { Message } from "@/types/message.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { MessageActions, EditBox } from "./message-actions";
import { ReactionPicker, ReactionsDisplay } from "./reaction-picker";
import { Download, FileIcon, ExternalLink } from "lucide-react";
import { USER_STATUS } from "@/types/user.types";

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  message,
  isGrouped = false,
}: MessageBubbleProps) {
  const { user: currentUser } = useUser();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isEditing, setIsEditing] = useState(false);

  const isOwn =
    message.sender.email === currentUser?.primaryEmailAddress?.emailAddress;

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const senderName =
    message.sender.firstName || message.sender.email?.split("@")[0] || "User";

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasAttachments =
    message.attachments && message.attachments.length > 0;

  const isAttachmentMessage =
    message.content.startsWith("📷 Shared an image:") ||
    message.content.startsWith("📎 Shared a file:");

  // ✅ Get sender status info
  const getStatusInfo = (status?: string) => {
    const defaultStatus = { color: "bg-slate-500", emoji: "⚫", label: "Offline" };
    if (!status) return defaultStatus;
    
    const statusMap: Record<string, { color: string; emoji: string; label: string }> = {
      online: { color: "bg-emerald-400", emoji: "🟢", label: "Online" },
      away: { color: "bg-yellow-400", emoji: "🟡", label: "Away" },
      busy: { color: "bg-red-400", emoji: "🔴", label: "Busy" },
      offline: { color: "bg-slate-500", emoji: "⚫", label: "Offline" },
    };
    return statusMap[status] || defaultStatus;
  };

  const senderStatus = message.sender?.status || "offline";
  const statusInfo = getStatusInfo(senderStatus);

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className="px-6 py-1">
        <div className="flex items-center gap-2 py-1 px-3 rounded bg-white/[0.02] border border-white/[0.04] w-fit">
          <span className="text-xs text-slate-600 italic">
            🗑️ This message was deleted
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative px-6 hover:bg-white/[0.02] transition-colors ${
        isGrouped ? "py-[2px]" : "pt-3 pb-[2px]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 flex-shrink-0">
          {!isGrouped ? (
            <div className="relative">
              <Avatar className="w-8 h-8 border border-white/10">
                {message.sender.avatar && (
                  <AvatarImage src={message.sender.avatar} alt={senderName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-[10px] font-bold">
                  {getInitials(message.sender.firstName, message.sender.email)}
                </AvatarFallback>
              </Avatar>
              {/* ✅ Status Dot on Avatar */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#070908] ${statusInfo.color}`}
                title={statusInfo.label}
              />
            </div>
          ) : (
            <div className="w-8 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] text-slate-700">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-[2px]">
              <span
                className={`font-semibold text-[13px] ${
                  isOwn ? "text-emerald-400" : "text-white"
                }`}
              >
                {senderName}
                {/* ✅ Status Emoji next to name */}
                <span className="ml-1 text-[10px]" title={statusInfo.label}>
                  {statusInfo.emoji}
                </span>
                {isOwn && (
                  <span className="ml-1 text-[10px] text-slate-600 font-normal">
                    (you)
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-600">
                {formatTime(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-[10px] text-emerald-500/60 italic">
                  (edited)
                </span>
              )}
            </div>
          )}

          {/* Message text OR Edit Box */}
          {isEditing ? (
            <EditBox
              message={message}
              onSave={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              {!isAttachmentMessage && (
                <p className="text-slate-200 text-[13px] leading-[1.5] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </>
          )}

          {/* Attachments */}
          {hasAttachments && !isEditing && (
            <div className="mt-1.5 space-y-2">
              {message.attachments.map((attachment, idx) => {
                if (attachment.type === "image") {
                  return (
                    <ImageAttachment
                      key={`${message._id}-att-${idx}`}
                      url={attachment.url}
                      name={attachment.name}
                    />
                  );
                }

                return (
                  <FileAttachment
                    key={`${message._id}-att-${idx}`}
                    url={attachment.url}
                    name={attachment.name}
                    size={attachment.size || 0}
                    formatFileSize={formatFileSize}
                  />
                );
              })}
            </div>
          )}

          {/* Reactions Display */}
          {!isEditing && (
            <ReactionsDisplay message={message} workspaceId={workspaceId} />
          )}
        </div>
      </div>

      {/* Hover Toolbar — Only when NOT editing */}
      {!isEditing && !message.isDeleted && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-4 flex items-center bg-[#0a0c0b] border border-white/10 rounded-md shadow-lg z-20">
          {/* Reaction Picker */}
          <div className="p-0.5">
            <ReactionPicker message={message} workspaceId={workspaceId} />
          </div>

          {/* Edit/Delete (own messages only) */}
          {isOwn && (
            <>
              <div className="w-px h-5 bg-white/10" />
              <div className="p-0.5">
                <MessageActions
                  message={message}
                  canEdit={isOwn}
                  canDelete={isOwn}
                  onEditStart={() => setIsEditing(true)}
                  onEditEnd={() => setIsEditing(false)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Image Attachment Component
// ============================================

function ImageAttachment({ url, name }: { url: string; name: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative group/img max-w-[400px] rounded-lg overflow-hidden border border-white/[0.06]">
        {!isLoaded && (
          <div className="w-[300px] h-[200px] bg-white/[0.03] animate-pulse rounded-lg" />
        )}

        <img
          src={url}
          alt={name}
          className={`max-w-full max-h-[300px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
            isLoaded ? "block" : "hidden"
          }`}
          onLoad={() => setIsLoaded(true)}
          onClick={() => setIsFullscreen(true)}
        />

        {isLoaded && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              title="Open"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={url}
              download={name}
              className="w-7 h-7 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={url}
            alt={name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={url}
              download={name}
              className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsFullscreen(false)}
              className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// File Attachment Component
// ============================================

function FileAttachment({
  url,
  name,
  size,
  formatFileSize,
}: {
  url: string;
  name: string;
  size: number;
  formatFileSize: (bytes: number) => string;
}) {
  const ext = name.split(".").pop()?.toLowerCase() || "file";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 rounded-lg p-3 max-w-[300px] transition-all group/file"
    >
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <FileIcon className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate group-hover/file:text-emerald-400 transition-colors">
          {name}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {ext.toUpperCase()} • {formatFileSize(size)}
        </p>
      </div>
      <Download className="w-4 h-4 text-slate-500 group-hover/file:text-emerald-400 transition-colors flex-shrink-0" />
    </a>
  );
}