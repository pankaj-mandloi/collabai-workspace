"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { TaskStatus, TaskPriority } from "@/types/task.types";
import {
  Loader2,
  Sparkles,
  X,
  Calendar,
  Users,
  Check,
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

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  defaultStatus?: TaskStatus;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  workspaceId,
  defaultStatus = "todo",
}: CreateTaskDialogProps) {
  const { createTask, isCreating } = useTaskStore();
  const { currentWorkspace } = useWorkspaceStore();

  const today = format(new Date(), "yyyy-MM-dd");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: defaultStatus,
    priority: "medium" as TaskPriority,
    assignees: [] as string[],
    dueDate: "",
  });

  const [errors, setErrors] = useState({ title: "", dueDate: "" });

  const members = currentWorkspace?.members || [];

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const validate = () => {
    const newErrors = { title: "", dueDate: "" };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
      isValid = false;
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
      isValid = false;
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (selectedDate < todayDate) {
        newErrors.dueDate = "Due date cannot be in the past";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      let isoDate = null;
      if (formData.dueDate) {
        const dateObj = new Date(formData.dueDate + "T23:59:59");
        isoDate = dateObj.toISOString();
      }

      const task = await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        workspaceId,
        status: formData.status,
        priority: formData.priority,
        assignees: formData.assignees,
        dueDate: isoDate,
      });

      toast.success("Task created successfully!", {
        description: task.title,
      });

      handleReset();
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create task";
      toast.error("Error creating task", { description: message });
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      status: defaultStatus,
      priority: "medium",
      assignees: [],
      dueDate: "",
    });
    setErrors({ title: "", dueDate: "" });
  };

  const handleClose = (open: boolean) => {
    if (!open && !isCreating) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0c0b] border-white/10 text-white sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Create New Task
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-1">
                  Add a new task to your workspace board
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-white text-sm font-medium flex items-center gap-1"
            >
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Design landing page"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: "" }));
              }}
              disabled={isCreating}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 h-10"
              autoFocus
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-[10px] text-slate-600 text-right">
              {formData.title.length}/200
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-white text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details about the task..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isCreating}
              rows={3}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none text-sm"
              maxLength={2000}
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  if (value) {
                    setFormData((prev) => ({
                      ...prev,
                      status: value as TaskStatus,
                    }));
                  }
                }}
                disabled={isCreating}
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
                value={formData.priority}
                onValueChange={(value) => {
                  if (value) {
                    setFormData((prev) => ({
                      ...prev,
                      priority: value as TaskPriority,
                    }));
                  }
                }}
                disabled={isCreating}
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
            <Label
              htmlFor="dueDate"
              className="text-white text-sm font-medium flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                min={today}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }));
                  if (errors.dueDate)
                    setErrors((prev) => ({ ...prev, dueDate: "" }));
                }}
                disabled={isCreating}
                className="bg-white/[0.03] border-white/10 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 h-10 [color-scheme:dark]"
              />
              {formData.dueDate && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, dueDate: "" }))
                  }
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Clear date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {errors.dueDate && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.dueDate}
              </p>
            )}
            {formData.dueDate && !errors.dueDate && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Due on {format(new Date(formData.dueDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Assignees{" "}
              <span className="text-[11px] text-slate-500 font-normal">
                ({formData.assignees.length} selected)
              </span>
            </Label>
            <div className="bg-white/[0.03] border border-white/10 rounded-md p-1.5 max-h-36 overflow-y-auto space-y-1">
              {members.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No members in this workspace
                </p>
              ) : (
                members.map((member, idx) => {
                  const isSelected = formData.assignees.includes(
                    member.user._id
                  );
                  const displayName =
                    member.user.firstName ||
                    member.user.email?.split("@")[0] ||
                    "User";

                  return (
                    <button
                      key={member.user._id || `member-${idx}`}
                      type="button"
                      onClick={() => toggleAssignee(member.user._id)}
                      disabled={isCreating}
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
                          {getInitials(
                            member.user.firstName,
                            member.user.email
                          )}
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
                })
              )}
            </div>
          </div>
        </form>

        {/* Footer - Small buttons, always clickable */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={() => handleClose(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 min-w-[80px] text-sm"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 min-w-[80px] gap-1.5 text-sm disabled:!opacity-70"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}