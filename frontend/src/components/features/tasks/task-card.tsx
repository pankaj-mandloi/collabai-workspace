"use client";

import { Task, TaskPriority } from "@/types/task.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import { useState } from "react";
import { useTaskStore } from "@/store/task.store";
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

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; borderColor: string; iconColor: string; icon?: any }
> = {
  urgent: {
    label: "Urgent",
    borderColor: "border-l-red-500",
    iconColor: "text-red-400",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    borderColor: "border-l-orange-500",
    iconColor: "text-orange-400",
  },
  medium: {
    label: "Medium",
    borderColor: "border-l-lime-500",
    iconColor: "text-lime-400",
  },
  low: {
    label: "Low",
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-400",
  },
};

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const { deleteTask, isDeleting } = useTaskStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "task",
      task,
    },
  });

 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isSortableDragging ? 0.4 : 1,
  touchAction: "none" as const,
};

  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== "done";
  const isDueToday = dueDate && isToday(dueDate);

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task._id, task.workspace);
      toast.success("Task deleted successfully");
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.response?.data?.message,
      });
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={onClick}
        className={`
          group relative bg-[#0f1211] hover:bg-[#131615]
          border border-white/[0.06] border-l-4 ${priority.borderColor}
          rounded-md p-3 cursor-pointer transition-all
          hover:border-white/10 hover:border-l-4
          ${isDragging ? "shadow-2xl shadow-emerald-500/20 rotate-2 ring-1 ring-emerald-500/30" : ""}
        `}
      >
        {/* Top Right Actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {/* Priority Icon (urgent only) */}
          {task.priority === "urgent" && PriorityIcon && (
            <PriorityIcon className={`w-3.5 h-3.5 ${priority.iconColor}`} />
          )}

          {/* Delete Button - Shows on hover, RED color */}
          <button
            onClick={handleDeleteClick}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40 bg-red-500/10"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Labels (colored dots with names) */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 pr-16">
            {task.labels.slice(0, 4).map((label, idx) => (
              <div
                key={`${task._id}-label-${idx}-${label.name}`}
                className="flex items-center gap-1"
                title={label.name}
              >
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: label.color || "#10b981" }}
                />
                <span className="text-[10px] text-slate-500 font-medium">
                  {label.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="font-medium text-white text-sm mb-1.5 leading-snug line-clamp-2 pr-16">
          {task.title}
        </h4>

        {/* Description Preview */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          {/* Due Date */}
          {dueDate && (
            <div
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                isOverdue
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : isDueToday
                    ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.06]"
              }`}
            >
              <Calendar className="w-2.5 h-2.5" />
              <span>{format(dueDate, "MMM d")}</span>
            </div>
          )}

          {/* Checklist Progress */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
              <CheckSquare className="w-2.5 h-2.5" />
              <span>
                {task.checklist.filter((i) => i.isCompleted).length}/
                {task.checklist.length}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {task.comments && task.comments.length > 0 && (
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>

        {/* Footer: Priority + Assignees */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
          {/* Priority Text */}
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${priority.iconColor}`}
          >
            {priority.label}
          </span>

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((assignee, idx) => (
                <Avatar
                  key={assignee._id || `assignee-${idx}`}
                  className="w-5 h-5 border-2 border-[#0f1211]"
                  title={assignee.email}
                >
                  {assignee.avatar && (
                    <AvatarImage src={assignee.avatar} alt={assignee.email} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-[8px] font-bold">
                    {getInitials(assignee.firstName, assignee.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-white/[0.05] border-2 border-[#0f1211] flex items-center justify-center text-[8px] text-slate-400 font-bold">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Delete Task?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">"{task.title}"</span>
                  ? This action cannot be undone.
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
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px] disabled:!opacity-70"
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
