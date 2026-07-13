"use client";

import { useState } from "react";
import { Workspace } from "@/types/workspace.types";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { AIChatPanel } from "@/components/features/ai/ai-chat-panel";
import { Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatAreaProps {
  workspace: Workspace;
}

export function ChatArea({ workspace }: ChatAreaProps) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  return (
    <>
      <div className="flex-1 flex flex-col bg-[#070908] relative">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Chat Header */}
        <div className="relative px-6 py-3.5 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl z-10 flex items-center justify-between">
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

          {/* Ask AI Button */}
          <Button
            onClick={() => setIsAIPanelOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-600 hover:to-lime-500 text-black font-medium h-9 px-4 gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Ask AI
          </Button>
        </div>

        {/* Messages */}
        <MessageList workspaceId={workspace._id} />

        {/* Typing Indicator */}
        <TypingIndicator workspaceId={workspace._id} />

        {/* Input */}
        <MessageInput workspaceId={workspace._id} />
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel
        workspaceId={workspace._id}
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
      />
    </>
  );
}