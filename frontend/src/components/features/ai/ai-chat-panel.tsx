"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAIStore, useAIMessages } from "@/store/ai.store";
import { useUser } from "@clerk/nextjs";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  X,
  Trash2,
  MessageSquare,
  FileText,
  CheckSquare,
} from "lucide-react";
import { format } from "date-fns";

interface AIChatPanelProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({
  workspaceId,
  isOpen,
  onClose,
}: AIChatPanelProps) {
  const { user } = useUser();
  const messages = useAIMessages(workspaceId);
  const { sendMessage, isThinking, clearMessages } = useAIStore();

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    setInput("");
    await sendMessage({ message: trimmed, workspaceId });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (confirm("Clear all AI chat messages?")) {
      clearMessages(workspaceId);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.primaryEmailAddress?.emailAddress)
      return user.primaryEmailAddress.emailAddress[0].toUpperCase();
    return "U";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0c0b] border-l border-white/10 shadow-2xl z-[100] flex flex-col h-full">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-full h-40 bg-emerald-500/[0.05] blur-2xl pointer-events-none" />

        {/* Header - Fixed at top */}
        <div className="relative flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-white/10 bg-[#0a0c0b]/95 backdrop-blur-xl flex-shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base truncate">AI Assistant</h2>
              <p className="text-xs text-slate-400 truncate">
                Powered by Gemini • Knows your workspace
              </p>
            </div>
          </div>

          {/* Header Actions - Only clear chat button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {messages.length === 0 && !isThinking ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ask me anything!
                </h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">
                  I can help you find information from your workspace — chats,
                  tasks, and documents.
                </p>

                {/* Suggested prompts */}
                <div className="space-y-2 w-full max-w-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Try asking:
                  </p>
                  {[
                    "What tasks are pending?",
                    "Summarize recent discussions",
                    "Show high priority items",
                    "What's due this week?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="w-full text-left px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 text-sm text-slate-300 hover:text-white transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    userInitials={getUserInitials()}
                  />
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 italic">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* ✅ FINAL: Clean Bottom Bar - Close | Input | Send */}
        <div className="border-t border-white/10 bg-[#0a0c0b]/95 backdrop-blur-xl p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Close Button - Mobile only */}
            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI about your workspace..."
                disabled={isThinking}
                rows={1}
                className="min-h-[42px] max-h-[120px] resize-none bg-white/[0.03] border-white/10 text-white text-sm placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 pr-2 rounded-lg"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="h-10 w-10 p-0 bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50 flex-shrink-0 rounded-lg"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-[10px] text-slate-500 mt-1.5 px-1">
            💡 Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}

// ============================================
// Message Bubble Component
// ============================================

interface MessageBubbleProps {
  message: any;
  userInitials: string;
}

function MessageBubble({ message, userInitials }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = format(new Date(message.timestamp), "h:mm a");

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {isUser ? (
        <Avatar className="w-8 h-8 border-2 border-emerald-500/30 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-xs font-bold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-black" />
        </div>
      )}

      {/* Message content */}
      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        <div
          className={`inline-block rounded-lg p-3 ${
            isUser
              ? "bg-emerald-500/10 border border-emerald-500/20 text-white"
              : "bg-white/[0.03] border border-white/[0.06] text-slate-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Context Used (AI only) */}
        {!isUser && message.contextUsed && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {message.contextUsed.messagesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                <MessageSquare className="w-2.5 h-2.5" />
                {message.contextUsed.messagesCount} messages
              </span>
            )}
            {message.contextUsed.tasksCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                <CheckSquare className="w-2.5 h-2.5" />
                {message.contextUsed.tasksCount} tasks
              </span>
            )}
            {message.contextUsed.documentsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                <FileText className="w-2.5 h-2.5" />
                {message.contextUsed.documentsCount} docs
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-slate-600 mt-1 px-1">{timestamp}</p>
      </div>
    </div>
  );
}