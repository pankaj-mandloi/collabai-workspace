"use client";

import { useEffect, useRef } from "react";
import { useMessageStore, useWorkspaceMessages } from "@/store/message.store";
import { MessageBubble } from "./message-bubble";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  workspaceId: string;
}

export function MessageList({ workspaceId }: MessageListProps) {
  const messages = useWorkspaceMessages(workspaceId);
  const { fetchMessages, isLoading, error } = useMessageStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const groupedMessages = messages.reduce((acc: any[], msg, idx) => {
    const prevMsg = messages[idx - 1];
    const isGrouped =
      prevMsg &&
      prevMsg.sender._id === msg.sender._id &&
      new Date(msg.createdAt).getTime() -
        new Date(prevMsg.createdAt).getTime() <
        5 * 60 * 1000;

    acc.push({ ...msg, isGrouped });
    return acc;
  }, []);

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <p className="text-xs text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-red-400 text-sm font-medium mb-1">
            Failed to load messages
          </p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Start the conversation
          </h3>
          <p className="text-sm text-slate-400">
            Send your first message to begin chatting with your team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="relative flex-1 overflow-y-auto py-4"
      style={{ scrollBehavior: "smooth" }}
    >
      {groupedMessages.map((message: any) => (
        <MessageBubble
          key={message._id}
          message={message}
          isGrouped={message.isGrouped}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}