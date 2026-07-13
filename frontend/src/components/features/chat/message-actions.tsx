"use client";

import { useState } from "react";
import { Message } from "@/types/message.types";
import { useMessageStore } from "@/store/message.store";
import { messageService } from "@/services/message.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface MessageActionsProps {
  message: Message;
  canEdit: boolean;
  canDelete: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export function MessageActions({
  message,
  canEdit,
  canDelete,
  onEditStart,
  onEditEnd,
}: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { updateMessage, removeMessage } = useMessageStore();

  const editWindowExpired =
    Date.now() - new Date(message.createdAt).getTime() > 15 * 60 * 1000;

  const showEditOption = canEdit && !editWindowExpired;
  const showDeleteOption = canDelete;

  if (!showEditOption && !showDeleteOption) return null;

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
    onEditStart?.();
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error("Message cannot be empty");
      return;
    }

    if (trimmed === message.content) {
      handleCancelEdit();
      return;
    }

    setIsSaving(true);
    try {
      const updated = await messageService.editMessage(message._id, {
        content: trimmed,
      });
      updateMessage(updated);
      setIsEditing(false);
      onEditEnd?.();
      toast.success("Message edited");
    } catch (error: any) {
      toast.error("Failed to edit", {
        description:
          error.response?.data?.message || "Edit window may have expired",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await messageService.deleteMessage(message._id);
      removeMessage(message._id, message.workspace);
      toast.success("Message deleted");
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.response?.data?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
    onEditEnd?.();
  };

  // ============================================
  // EDITING MODE — Renders OUTSIDE toolbar
  // ============================================
  if (isEditing) {
    return null; // Editing UI handled by parent (message-bubble)
  }

  // ============================================
  // ACTIONS MENU (3 dots)
  // ============================================
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="bg-[#0a0c0b] border-white/10 min-w-[140px]"
        >
          {showEditOption && (
            <DropdownMenuItem
              onClick={handleStartEdit}
              className="text-slate-300 hover:!bg-white/[0.05] hover:!text-white cursor-pointer gap-2 text-xs"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-400" />
              Edit Message
            </DropdownMenuItem>
          )}

          {showDeleteOption && (
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-400 hover:!bg-red-500/10 hover:!text-red-300 cursor-pointer gap-2 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Message
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Delete Message?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  This message will be permanently deleted.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0"
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px] disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting
                </>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// EDIT BOX — Separate Component (used by message-bubble)
// ============================================

interface EditBoxProps {
  message: Message;
  onSave: () => void;
  onCancel: () => void;
}

export function EditBox({ message, onSave, onCancel }: EditBoxProps) {
  const [editContent, setEditContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const { updateMessage } = useMessageStore();

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error("Message cannot be empty");
      return;
    }

    if (trimmed === message.content) {
      onCancel();
      return;
    }

    setIsSaving(true);
    try {
      const updated = await messageService.editMessage(message._id, {
        content: trimmed,
      });
      updateMessage(updated);
      onSave();
      toast.success("Message edited");
    } catch (error: any) {
      toast.error("Failed to edit", {
        description: error.response?.data?.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-1 mb-2">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        disabled={isSaving}
        rows={2}
        className="w-full min-h-[50px] resize-none bg-white/[0.05] border-emerald-500/30 text-white text-[13px] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-md"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
      />
      <div className="flex items-center gap-2 mt-1.5">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 px-3 text-xs gap-1"
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Save
        </Button>
        <Button
          onClick={onCancel}
          disabled={isSaving}
          className="bg-red-500 hover:bg-red-600 text-white h-7 px-3 text-xs gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </Button>
        <span className="text-[10px] text-slate-600">
          Enter to save • Esc to cancel
        </span>
      </div>
    </div>
  );
}