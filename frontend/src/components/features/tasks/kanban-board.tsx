"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task.types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
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
  }
> = {
  todo: {
    title: "To Do",
    color: "text-slate-300",
    bgColor: "bg-slate-500",
    countBg: "bg-white/[0.05]",
  },
  in_progress: {
    title: "In Progress",
    color: "text-lime-300",
    bgColor: "bg-lime-500",
    countBg: "bg-lime-500/10",
  },
  done: {
    title: "Done",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500",
    countBg: "bg-emerald-500/10",
  },
};

export function KanbanBoard({
  workspaceId,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  const { fetchWorkspaceTasks, moveTask, optimisticMove } = useTaskStore();
  const grouped = useGroupedTasks(workspaceId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    fetchWorkspaceTasks(workspaceId);
  }, [workspaceId, fetchWorkspaceTasks]);

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto h-full">
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