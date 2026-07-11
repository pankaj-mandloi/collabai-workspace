"use client";

import { useWorkspaceTypingUsers } from "@/store/message.store";

interface TypingIndicatorProps {
  workspaceId: string;
}

export function TypingIndicator({ workspaceId }: TypingIndicatorProps) {
  const typingUsers = useWorkspaceTypingUsers(workspaceId);

  if (typingUsers.length === 0) {
    return <div className="h-6" />;
  }

  const getName = (user: any) =>
    user.firstName || user.email?.split("@")[0] || "Someone";

  const getText = () => {
    if (typingUsers.length === 1) {
      return `${getName(typingUsers[0].user)} is typing`;
    } else if (typingUsers.length === 2) {
      return `${getName(typingUsers[0].user)} and ${getName(
        typingUsers[1].user
      )} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <div className="px-6 py-1 flex items-center gap-2 text-xs text-slate-500">
      <div className="flex gap-1">
        <div
          className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="italic">{getText()}...</span>
    </div>
  );
}