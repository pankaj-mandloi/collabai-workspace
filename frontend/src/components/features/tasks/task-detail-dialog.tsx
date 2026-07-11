"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTaskStore } from "@/store/task.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Task, TaskStatus, TaskPriority } from "@/types/task.types";
import {
  Loader2,
  Trash2,
  Calendar,
  Users,
  CheckSquare,
  Plus,
  X,
  Check,
  FileText,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  workspaceId: string;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  workspaceId,
}: TaskDetailDialogProps) {
  const {
    updateTask,
    deleteTask,
    addChecklistItem,
    toggleChecklistItem,
    isUpdating,
    isDeleting,
  } = useTaskStore();
  const { currentWorkspace } = useWorkspaceStore();

  const today = format(new Date(), "yyyy-MM-dd");

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    assignees: [] as string[],
    dueDate: "",
  });

  const [newChecklistText, setNewChecklistText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignees: task.assignees.map((a) => a._id),
        dueDate: task.dueDate
          ? format(new Date(task.dueDate), "yyyy-MM-dd")
          : "",
      });
      setDateError("");
    }
  }, [task]);

  if (!task) return null;

  const members = currentWorkspace?.members || [];

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const toggleAssignee = (userId: string) => {
    setEditData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const validateDate = (dateStr: string) => {
    if (!dateStr) return true;
    const selectedDate = new Date(dateStr);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (task.dueDate) {
      const originalDate = format(new Date(task.dueDate), "yyyy-MM-dd");
      if (dateStr === originalDate) return true;
    }

    if (selectedDate < todayDate) {
      setDateError("Due date cannot be in the past");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateDate(editData.dueDate)) return;

    if (!editData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      let isoDate = null;
      if (editData.dueDate) {
        const dateObj = new Date(editData.dueDate + "T23:59:59");
        isoDate = dateObj.toISOString();
      }

      await updateTask(task._id, {
        title: editData.title.trim(),
        description: editData.description.trim(),
        status: editData.status,
        priority: editData.priority,
        assignees: editData.assignees,
        dueDate: isoDate,
      });

      toast.success("Task updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.response?.data?.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"? This action cannot be undone.`))
      return;

    try {
      await deleteTask(task._id, workspaceId);
      toast.success("Task deleted");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.response?.data?.message,
      });
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistText.trim()) return;

    setIsAddingItem(true);
    try {
      await addChecklistItem(task._id, newChecklistText.trim());
      setNewChecklistText("");
    } catch (error) {
      toast.error("Failed to add checklist item");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    try {
      await toggleChecklistItem(task._id, itemId);
    } catch (error) {
      toast.error("Failed to toggle item");
    }
  };

  const checklistProgress =
    task.checklist && task.checklist.length > 0
      ? Math.round(
          (task.checklist.filter((i) => i.isCompleted).length /
            task.checklist.length) *
            100
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0c0b] border-white/10 text-white sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <FileText className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Task Details
                </DialogTitle>
                <p className="text-slate-400 text-xs mt-1">
                  View and edit task information
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium">Title</Label>
            <Input
              value={editData.title}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-white/[0.03] border-white/10 text-white font-medium text-base h-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium">
              Description
            </Label>
            <Textarea
              value={editData.description}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              placeholder="Add description..."
              className="bg-white/[0.03] border-white/10 text-white resize-none text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              maxLength={2000}
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">Status</Label>
              <Select
                value={editData.status}
                onValueChange={(value) => {
                  if (value) {
                    setEditData((prev) => ({
                      ...prev,
                      status: value as TaskStatus,
                    }));
                  }
                }}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white h-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c0b] border-white/10 text-white">
                  <SelectItem value="todo">
                    <div className="flex items-center gap-2">
                      <Circle className="w-3.5 h-3.5 text-slate-400" />
                      <span>To Do</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-lime-400" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Done</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">Priority</Label>
              <Select
                value={editData.priority}
                onValueChange={(value) => {
                  if (value) {
                    setEditData((prev) => ({
                      ...prev,
                      priority: value as TaskPriority,
                    }));
                  }
                }}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white h-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c0b] border-white/10 text-white">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Minus className="w-3.5 h-3.5 text-lime-400" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-3.5 h-3.5 text-orange-400" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Urgent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={editData.dueDate}
                min={today}
                onChange={(e) => {
                  setEditData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }));
                  validateDate(e.target.value);
                }}
                className="bg-white/[0.03] border-white/10 text-white h-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 [color-scheme:dark]"
              />
              {editData.dueDate && (
                <button
                  type="button"
                  onClick={() => {
                    setEditData((prev) => ({ ...prev, dueDate: "" }));
                    setDateError("");
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Clear date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {dateError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {dateError}
              </p>
            )}
            {editData.dueDate && !dateError && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Due on {format(new Date(editData.dueDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Assignees{" "}
              <span className="text-[11px] text-slate-500 font-normal">
                ({editData.assignees.length} selected)
              </span>
            </Label>
            <div className="bg-white/[0.03] border border-white/10 rounded-md p-1.5 max-h-32 overflow-y-auto space-y-1">
              {members.map((member, idx) => {
                const isSelected = editData.assignees.includes(member.user._id);
                const displayName =
                  member.user.firstName ||
                  member.user.email?.split("@")[0] ||
                  "User";

                return (
                  <button
                    key={member.user._id || `member-${idx}`}
                    type="button"
                    onClick={() => toggleAssignee(member.user._id)}
                    className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "hover:bg-white/[0.03] border border-transparent"
                    }`}
                  >
                    <Avatar className="w-6 h-6">
                      {member.user.avatar && (
                        <AvatarImage
                          src={member.user.avatar}
                          alt={displayName}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-[10px] font-bold">
                        {getInitials(member.user.firstName, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs text-white truncate font-medium">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {member.user.email}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Check
                          className="w-2.5 h-2.5 text-black"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm font-medium flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                Checklist{" "}
                <span className="text-[11px] text-slate-500 font-normal">
                  ({task.checklist?.length || 0})
                </span>
              </Label>
              {task.checklist && task.checklist.length > 0 && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {checklistProgress}% complete
                </span>
              )}
            </div>

            {task.checklist && task.checklist.length > 0 && (
              <div className="w-full bg-white/[0.03] rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            )}

            <div className="space-y-1">
              {task.checklist?.map((item, idx) => (
                <div
                  key={item._id || `checklist-${task._id}-${idx}`}
                  className="flex items-center gap-2 p-2 bg-white/[0.03] rounded hover:bg-white/[0.05] transition-colors border border-white/[0.06]"
                >
                  <button
                    onClick={() => handleToggleChecklist(item._id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                      item.isCompleted
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-white/20 hover:border-emerald-500"
                    }`}
                  >
                    {item.isCompleted && (
                      <Check
                        className="w-2.5 h-2.5 text-black"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-xs ${
                      item.isCompleted
                        ? "text-slate-600 line-through"
                        : "text-white"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              <Input
                placeholder="Add checklist item..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                disabled={isAddingItem}
                className="bg-white/[0.03] border-white/10 text-white text-xs h-8 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
              <Button
                onClick={handleAddChecklistItem}
                disabled={!newChecklistText.trim() || isAddingItem}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3"
              >
                {isAddingItem ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-3 border-t border-white/[0.06] text-[11px] text-slate-500 space-y-0.5">
            <p>
              <span className="text-slate-600">Created by:</span>{" "}
              {task.createdBy?.email || "Unknown"}
            </p>
            <p>
              <span className="text-slate-600">Created:</span>{" "}
              {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
            {task.completedAt && (
              <p className="text-emerald-500">
                <span className="text-slate-600">Completed:</span>{" "}
                {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Footer - Small buttons */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 flex items-center justify-between gap-2">
          {/* Delete Button - Left */}
          <Button
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 min-w-[80px] gap-1.5 text-sm disabled:!opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </>
            )}
          </Button>

          {/* Cancel + Save - Right */}
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 min-w-[80px] text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || isDeleting || !!dateError}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 min-w-[80px] gap-1.5 text-sm disabled:!opacity-70"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}