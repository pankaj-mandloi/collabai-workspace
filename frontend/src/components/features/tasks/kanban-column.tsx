"use client";

import { Task, TaskStatus } from "@/types/task.types";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  color: string;
  bgColor: string;
  countBg: string;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  color,
  bgColor,
  countBg,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] max-h-full">
      {/* Column Header - Colored top border */}
      <div className={`h-1 rounded-t-lg ${bgColor}`} />

      {/* Column Content */}
      <div className="flex flex-col flex-1 bg-white/[0.02] border border-white/[0.06] border-t-0 rounded-b-lg overflow-hidden">
        {/* Header with visible Add button */}
        <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bgColor}`} />
            <h3 className={`font-semibold text-sm ${color}`}>{title}</h3>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${countBg} ${color}`}
            >
              {tasks.length}
            </span>
          </div>

          {/* Visible Add Button with icon + text on hover */}
          <button
            onClick={() => onAddTask(status)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-xs font-medium group"
            title="Add new task"
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              Add
            </span>
          </button>
        </div>

        {/* Tasks List */}
        <div
          ref={setNodeRef}
          className={`
            flex-1 overflow-y-auto p-2 space-y-2 transition-colors min-h-[300px]
            ${isOver ? "bg-emerald-500/5" : ""}
          `}
        >
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>

          {/* Empty State - Only shown when no tasks */}
          {tasks.length === 0 && (
            <button
              onClick={() => onAddTask(status)}
              className="w-full h-full min-h-[250px] flex flex-col items-center justify-center gap-2 text-slate-600 border-2 border-dashed border-white/[0.06] rounded-lg hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.03] group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Add first task</p>
                <p className="text-xs text-slate-700 mt-0.5">
                  Click to create
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}