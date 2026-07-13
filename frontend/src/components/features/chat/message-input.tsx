"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";
import { FileUploadButton } from "./file-upload-button";
import { toast } from "sonner";

interface MessageInputProps {
  workspaceId: string;
}

export function MessageInput({ workspaceId }: MessageInputProps) {
  const { socket, isConnected } = useSocket();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [content]);

  // Cleanup typing on unmount
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

  // Handle typing indicators
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

  // Handle file upload complete
  const handleFileUpload = (
    url: string,
    name: string,
    type: string,
    size: number
  ) => {
    setPendingAttachment({ url, name, type, size });

    // Auto-send image with optional caption
    if (type === "image") {
      sendMessageWithAttachment("", { url, name, type, size });
    }
  };

  // Send message with optional attachment
  const sendMessageWithAttachment = (
    text: string,
    attachment?: { url: string; name: string; type: string; size: number }
  ) => {
    if (!socket || !isConnected) {
      toast.error("Not connected");
      return;
    }

    const trimmedContent = text.trim();
    const hasContent = trimmedContent.length > 0;
    const hasAttachment = !!attachment;

    if (!hasContent && !hasAttachment) return;

    setIsSending(true);

    // Build message content
    let messageContent = trimmedContent;
    if (hasAttachment) {
      if (attachment.type === "image") {
        messageContent = trimmedContent || `📷 Shared an image: ${attachment.name}`;
      } else {
        messageContent = trimmedContent || `📎 Shared a file: ${attachment.name}`;
      }
    }

    socket.emit(
      "message:send",
      {
        content: messageContent,
        workspaceId,
        attachments: hasAttachment
          ? [
              {
                type: attachment.type,
                url: attachment.url,
                name: attachment.name,
                size: attachment.size,
              },
            ]
          : [],
      },
      (response: { success: boolean; error?: string }) => {
        setIsSending(false);

        if (response.success) {
          setContent("");
          setPendingAttachment(null);

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

  // Send text message
  const sendMessage = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent && !pendingAttachment) return;
    if (!socket || !isConnected) {
      toast.error("Not connected", {
        description: "Please wait for connection",
      });
      return;
    }
    if (isSending) return;

    if (pendingAttachment) {
      sendMessageWithAttachment(trimmedContent, pendingAttachment);
    } else {
      sendMessageWithAttachment(trimmedContent);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 backdrop-blur-xl">
      {/* Pending Attachment Preview */}
      {pendingAttachment && pendingAttachment.type !== "image" && (
        <div className="mb-2 flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2">
          <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
            <span className="text-xs">📎</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">
              {pendingAttachment.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {(pendingAttachment.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={() => setPendingAttachment(null)}
            className="text-slate-400 hover:text-red-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        {/* File Upload Button */}
        <FileUploadButton
          onUpload={handleFileUpload}
          disabled={!isConnected || isSending}
        />

        {/* Text Input */}
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

        {/* Send Button */}
        <Button
          onClick={sendMessage}
          disabled={
            (!content.trim() && !pendingAttachment) ||
            !isConnected ||
            isSending
          }
          className="h-[42px] px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Status */}
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