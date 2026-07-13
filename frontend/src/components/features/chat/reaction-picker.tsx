"use client";

import { useState } from "react";
import { Message } from "@/types/message.types";
import { useSocket } from "@/providers/socket-provider";
import { SmilePlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface ReactionPickerProps {
  message: Message;
  workspaceId: string;
}

// Common emoji reactions
const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "👀", "🎉", "💯", "👏"];

export function ReactionPicker({ message, workspaceId }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useUser();

  const handleReaction = (emoji: string) => {
    if (!socket || !isConnected) {
      toast.error("Not connected");
      return;
    }

    // Send reaction via socket
    socket.emit(
      "message:reaction",
      {
        messageId: message._id,
        emoji,
      },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          toast.error("Failed to react", {
            description: response.error,
          });
        }
      },
    );

    setIsOpen(false);
  };

  // Check if current user already reacted with specific emoji
  const hasUserReacted = (emoji: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return false;

    const reaction = message.reactions?.find((r) => r.emoji === emoji);
    if (!reaction) return false;

    // reactions.users contains user IDs
    return reaction.users.length > 0;
  };

  return (
    <div className="relative">
      {/* Reaction Trigger Button — Shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
        title="Add reaction"
      >
        <SmilePlus className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Emoji Picker Popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-1 z-50">
          <div className="bg-[#0a0c0b] border border-white/10 rounded-lg shadow-2xl shadow-emerald-500/5 p-1.5 flex items-center gap-0.5">
            {EMOJI_LIST.map((emoji) => {
              const reacted = hasUserReacted(emoji);

              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-lg hover:bg-white/[0.08] transition-all hover:scale-110 ${
                    reacted
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : ""
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Existing Reactions Display Component
// ============================================

interface ReactionsDisplayProps {
  message: Message;
  workspaceId: string;
}

export function ReactionsDisplay({
  message,
  workspaceId,
}: ReactionsDisplayProps) {
  const { socket, isConnected } = useSocket();

  if (!message.reactions || message.reactions.length === 0) return null;

  const handleToggleReaction = (emoji: string) => {
    if (!socket || !isConnected) return;

    socket.emit(
      "message:reaction",
      {
        messageId: message._id,
        emoji,
      },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          toast.error("Failed to react");
        }
      },
    );
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {message.reactions.map((reaction, idx) => (
        <button
          key={`${message._id}-reaction-${idx}`}
          onClick={() => handleToggleReaction(reaction.emoji)}
          className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 transition-all border ${
            reaction.users.length > 0
              ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-slate-400 text-[10px] font-medium">
            {reaction.users.length}
          </span>
        </button>
      ))}
    </div>
  );
}
