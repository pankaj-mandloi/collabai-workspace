"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { CreateTaskDialog } from "@/components/features/tasks/create-task-dialog";
import { TaskDetailDialog } from "@/components/features/tasks/task-detail-dialog";
import { Task, TaskStatus } from "@/types/task.types";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import { useTaskCounts } from "@/store/task.store";

export default function TasksPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const counts = useTaskCounts(workspaceId);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] =
    useState<TaskStatus>("todo");

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070908]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 py-3.5 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-base">Tasks</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {counts.total} total • {counts.todo} to do •{" "}
                {counts.in_progress} in progress • {counts.done} done
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleAddTask("todo")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          workspaceId={workspaceId}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
        />
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
        defaultStatus={createDefaultStatus}
      />

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={selectedTask}
        workspaceId={workspaceId}
      />
    </div>
  );
}