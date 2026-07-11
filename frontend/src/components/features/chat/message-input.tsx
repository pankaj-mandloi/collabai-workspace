"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";
import { toast } from "sonner";

interface MessageInputProps {
  workspaceId: string;
}

export function MessageInput({ workspaceId }: MessageInputProps) {
  const { socket, isConnected } = useSocket();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [content]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && socket) {
        socket.emit("typing:stop", { workspaceId });
      }
    };
  }, [socket, workspaceId]);

  const handleTyping = () => {
    if (!socket || !isConnected) return;

    if (!isTypingRef.current) {
      socket.emit("typing:start", { workspaceId });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTypingRef.current) {
        socket.emit("typing:stop", { workspaceId });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const sendMessage = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;
    if (!socket || !isConnected) {
      toast.error("Not connected", {
        description: "Please wait for connection to be established",
      });
      return;
    }
    if (isSending) return;

    setIsSending(true);

    socket.emit(
      "message:send",
      { content: trimmedContent, workspaceId },
      (response: { success: boolean; error?: string }) => {
        setIsSending(false);

        if (response.success) {
          setContent("");
          if (isTypingRef.current) {
            socket.emit("typing:stop", { workspaceId });
            isTypingRef.current = false;
          }
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          textareaRef.current?.focus();
        } else {
          toast.error("Failed to send", {
            description: response.error || "Unknown error",
          });
        }
      }
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 backdrop-blur-xl">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? "Type a message... (Shift+Enter for new line)"
                : "Connecting..."
            }
            disabled={!isConnected || isSending}
            rows={1}
            className="min-h-[42px] max-h-[150px] resize-none bg-white/[0.03] border-white/10 text-white text-sm placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 pr-4"
          />
          {!isConnected && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            </div>
          )}
        </div>

        <Button
          onClick={sendMessage}
          disabled={!content.trim() || !isConnected || isSending}
          className="h-[42px] px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <p className="text-[10px] text-slate-600 mt-2 px-1 flex items-center gap-1.5">
        {isConnected ? (
          <>
            <span className="inline-block w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span>Disconnected</span>
          </>
        )}
      </p>
    </div>
  );
}