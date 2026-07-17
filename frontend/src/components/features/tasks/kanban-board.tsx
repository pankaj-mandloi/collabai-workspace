"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task.types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTaskStore, useGroupedTasks } from "@/store/task.store";
import { toast } from "sonner";

interface KanbanBoardProps {
  workspaceId: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const columnConfig: Record<
  TaskStatus,
  {
    title: string;
    color: string;
    bgColor: string;
    countBg: string;
    icon: string;
  }
> = {
  todo: {
    title: "To Do",
    color: "text-slate-300",
    bgColor: "bg-slate-500",
    countBg: "bg-white/[0.05]",
    icon: "📝",
  },
  in_progress: {
    title: "In Progress",
    color: "text-lime-300",
    bgColor: "bg-lime-500",
    countBg: "bg-lime-500/10",
    icon: "🔄",
  },
  done: {
    title: "Done",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500",
    countBg: "bg-emerald-500/10",
    icon: "✅",
  },
};

export function KanbanBoard({
  workspaceId,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  const { fetchWorkspaceTasks, moveTask, optimisticMove, isLoading } =
    useTaskStore();
  const grouped = useGroupedTasks(workspaceId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // ✅ State for mobile tab
  const [activeTab, setActiveTab] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    const loadTasks = async () => {
      setIsInitialLoad(true);
      await fetchWorkspaceTasks(workspaceId);
      setIsInitialLoad(false);
    };
    loadTasks();
  }, [workspaceId, fetchWorkspaceTasks]);

  // ✅ Loading Skeleton (UNCHANGED)
  if (isInitialLoad || isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col min-w-[300px] w-[300px] max-h-full"
          >
            <div className="h-1 rounded-t-lg bg-slate-700" />
            <div className="flex-1 bg-white/[0.02] border border-white/[0.06] border-t-0 rounded-b-lg p-3 space-y-2 min-h-[300px]">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="bg-[#0f1211] border border-white/[0.06] rounded-lg p-3 space-y-2"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex -space-x-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="w-6 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
              <Skeleton className="h-8 w-full rounded-md mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasTasks = Object.values(grouped).some((tasks) => tasks.length > 0);

  // ✅ Empty State (UNCHANGED)
  if (!hasTasks) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No tasks yet
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Create your first task to get started with the Kanban board.
          </p>
          <button
            onClick={() => onAddTask("todo")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            + Create Task
          </button>
        </div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = active.data.current?.task as Task;
    if (!activeTaskData) return;

    let targetStatus: TaskStatus;
    let targetPosition: number;

    if (over.data.current?.type === "column") {
      targetStatus = over.data.current.status as TaskStatus;
      const columnTasks = grouped[targetStatus];
      const lastTask = columnTasks[columnTasks.length - 1];
      targetPosition = lastTask ? lastTask.position + 1000 : 1000;
    } else {
      const overTask = over.data.current?.task as Task;
      if (!overTask) return;

      targetStatus = overTask.status;
      const columnTasks = grouped[targetStatus];
      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      const activeIndex = columnTasks.findIndex((t) => t._id === activeId);

      if (overIndex === -1) return;

      if (targetStatus === activeTaskData.status && activeIndex !== -1) {
        if (activeIndex === overIndex) return;

        const reordered = arrayMove(columnTasks, activeIndex, overIndex);
        const overIdx = reordered.findIndex((t) => t._id === activeId);
        const prevTask = reordered[overIdx - 1];
        const nextTask = reordered[overIdx + 1];

        if (!prevTask) {
          targetPosition = nextTask ? nextTask.position - 1000 : 1000;
        } else if (!nextTask) {
          targetPosition = prevTask.position + 1000;
        } else {
          targetPosition = (prevTask.position + nextTask.position) / 2;
        }
      } else {
        const prevTask = columnTasks[overIndex - 1];
        const nextTask = columnTasks[overIndex];

        if (!prevTask) {
          targetPosition = nextTask ? nextTask.position - 1000 : 1000;
        } else if (!nextTask) {
          targetPosition = prevTask.position + 1000;
        } else {
          targetPosition = (prevTask.position + nextTask.position) / 2;
        }
      }
    }

    if (
      activeTaskData.status === targetStatus &&
      activeTaskData.position === targetPosition
    ) {
      return;
    }

    optimisticMove(activeId, workspaceId, targetStatus, targetPosition);

    try {
      await moveTask(activeId, workspaceId, {
        status: targetStatus,
        position: targetPosition,
      });
    } catch (error) {
      toast.error("Failed to move task", {
        description: "Task position has been reverted",
      });
    }
  };

  // Get current column tasks
  const currentTasks = grouped[activeTab] || [];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ✅ MOBILE TAB SWITCHER - Only visible on mobile */}
      <div className="md:hidden flex gap-1 p-2 bg-white/[0.02] border-b border-white/[0.06] overflow-x-auto sticky top-0 z-10">
        {(Object.keys(columnConfig) as TaskStatus[]).map((status) => {
          const config = columnConfig[status];
          const count = grouped[status]?.length || 0;
          const isActive = activeTab === status;

          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center
                ${
                  isActive
                    ? `bg-${config.bgColor} text-white border border-white/10`
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.title}</span>
              <span
                className={`
                  text-[10px] px-1.5 py-0.5 rounded-full
                  ${isActive ? "bg-white/10" : "bg-white/[0.05]"}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ✅ Desktop: All columns side-by-side */}
     <div className="hidden md:flex gap-4 p-3 md:p-6 overflow-x-auto h-full justify-start xl:justify-center">
        {(Object.keys(columnConfig) as TaskStatus[]).map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={columnConfig[status].title}
            color={columnConfig[status].color}
            bgColor={columnConfig[status].bgColor}
            countBg={columnConfig[status].countBg}
            tasks={grouped[status]}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      {/* ✅ Mobile: Only active column */}
      <div className="md:hidden h-full p-3">
        <KanbanColumn
          status={activeTab}
          title={columnConfig[activeTab].title}
          color={columnConfig[activeTab].color}
          bgColor={columnConfig[activeTab].bgColor}
          countBg={columnConfig[activeTab].countBg}
          tasks={currentTasks}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}