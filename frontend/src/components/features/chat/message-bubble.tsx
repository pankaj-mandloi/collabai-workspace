"use client";

import { Message } from "@/types/message.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";

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

  if (message.isDeleted) {
    return (
      <div className="px-6 py-1.5 opacity-40">
        <p className="text-xs italic text-slate-600">
          🗑️ This message was deleted
        </p>
      </div>
    );
  }

  return (
    <div
      className={`group px-6 py-0.5 hover:bg-white/[0.02] transition-colors ${
        isGrouped ? "mt-0.5" : "mt-4"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 flex-shrink-0">
          {!isGrouped ? (
            <Avatar className="w-9 h-9 border border-white/10">
              {message.sender.avatar && (
                <AvatarImage src={message.sender.avatar} alt={senderName} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-xs font-bold">
                {getInitials(message.sender.firstName, message.sender.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-600">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header (name + time) */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className={`font-semibold text-sm ${
                  isOwn ? "text-emerald-400" : "text-white"
                }`}
              >
                {senderName}
                {isOwn && (
                  <span className="ml-1 text-[10px] text-slate-500 font-normal">
                    (you)
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-600">
                {formatTime(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-[10px] text-slate-600 italic">
                  (edited)
                </span>
              )}
            </div>
          )}

          {/* Message text */}
          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className="px-2 py-0.5 bg-white/[0.03] hover:bg-emerald-500/10 rounded-full text-xs flex items-center gap-1 transition-colors border border-white/[0.06] hover:border-emerald-500/30"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-slate-400 text-[10px]">
                    {reaction.users.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}