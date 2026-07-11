"use client";

import { Workspace } from "@/types/workspace.types";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { Hash } from "lucide-react";

interface ChatAreaProps {
  workspace: Workspace;
}

export function ChatArea({ workspace }: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#070908] relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Chat Header */}
      <div className="relative px-6 py-3.5 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Hash className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-base">General</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {workspace.description || "Main workspace channel"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList workspaceId={workspace._id} />

      {/* Typing Indicator */}
      <TypingIndicator workspaceId={workspace._id} />

      {/* Input */}
      <MessageInput workspaceId={workspace._id} />
    </div>
  );
}