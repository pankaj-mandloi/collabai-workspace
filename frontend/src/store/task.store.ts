import { useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Task,
  GroupedTasks,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
  TaskStatus,
} from "@/types/task.types";
import { taskService } from "@/services/task.service";

interface TaskState {
  // ============================================
  // STATE
  // ============================================

  // Tasks per workspace
  tasksByWorkspace: Record<string, Task[]>;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isMoving: boolean;

  // Error
  error: string | null;

  // Currently active task (for details modal)
  activeTask: Task | null;

  // ============================================
  // ACTIONS - Fetching
  // ============================================

  fetchWorkspaceTasks: (workspaceId: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;

  // ============================================
  // ACTIONS - CRUD
  // ============================================

  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: string, workspaceId: string) => Promise<void>;
  moveTask: (
    id: string,
    workspaceId: string,
    payload: MoveTaskPayload,
  ) => Promise<Task>;

  // ============================================
  // ACTIONS - Optimistic Updates (for drag-drop)
  // ============================================

  optimisticMove: (
    taskId: string,
    workspaceId: string,
    newStatus: TaskStatus,
    newPosition: number,
  ) => void;

  // ============================================
  // ACTIONS - Checklist
  // ============================================

  addChecklistItem: (taskId: string, text: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  // ============================================
  // ACTIONS - Utility
  // ============================================

  setActiveTask: (task: Task | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  tasksByWorkspace: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isMoving: false,
  error: null,
  activeTask: null,
};

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ============================================
      // FETCH WORKSPACE TASKS
      // ============================================

      fetchWorkspaceTasks: async (workspaceId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await taskService.getWorkspaceTasks(workspaceId);

          set((state) => ({
            tasksByWorkspace: {
              ...state.tasksByWorkspace,
              [workspaceId]: response.tasks,
            },
            isLoading: false,
          }));

          console.log(`✅ Loaded ${response.total} tasks`);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch tasks";
          set({ error: message, isLoading: false });
          console.error("❌ Fetch tasks error:", message);
        }
      },

      // ============================================
      // FETCH SINGLE TASK
      // ============================================

      fetchTaskById: async (taskId: string) => {
        try {
          const task = await taskService.getTaskById(taskId);
          set({ activeTask: task });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch task";
          set({ error: message });
          console.error("❌ Fetch task error:", message);
        }
      },

      // ============================================
      // CREATE TASK
      // ============================================

      createTask: async (payload: CreateTaskPayload) => {
        set({ isCreating: true, error: null });

        try {
          const newTask = await taskService.createTask(payload);

          set((state) => {
            const currentTasks =
              state.tasksByWorkspace[payload.workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [payload.workspaceId]: [...currentTasks, newTask],
              },
              isCreating: false,
            };
          });

          console.log("✅ Task created:", newTask.title);
          return newTask;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to create task";
          set({ error: message, isCreating: false });
          console.error("❌ Create task error:", message);
          throw error;
        }
      },

      // ============================================
      // UPDATE TASK
      // ============================================

      updateTask: async (id: string, payload: UpdateTaskPayload) => {
        set({ isUpdating: true, error: null });

        try {
          const updatedTask = await taskService.updateTask(id, payload);
          const workspaceId = updatedTask.workspace;

          set((state) => {
            const currentTasks = state.tasksByWorkspace[workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [workspaceId]: currentTasks.map((t) =>
                  t._id === id ? updatedTask : t,
                ),
              },
              activeTask:
                state.activeTask?._id === id ? updatedTask : state.activeTask,
              isUpdating: false,
            };
          });

          console.log("✅ Task updated:", updatedTask.title);
          return updatedTask;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to update task";
          set({ error: message, isUpdating: false });
          console.error("❌ Update task error:", message);
          throw error;
        }
      },

      // ============================================
      // DELETE TASK
      // ============================================

      deleteTask: async (id: string, workspaceId: string) => {
        set({ isDeleting: true, error: null });

        try {
          await taskService.deleteTask(id);

          set((state) => {
            const currentTasks = state.tasksByWorkspace[workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [workspaceId]: currentTasks.filter((t) => t._id !== id),
              },
              activeTask:
                state.activeTask?._id === id ? null : state.activeTask,
              isDeleting: false,
            };
          });

          console.log("✅ Task deleted");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to delete task";
          set({ error: message, isDeleting: false });
          console.error("❌ Delete task error:", message);
          throw error;
        }
      },

      // ============================================
      // MOVE TASK (with optimistic update)
      // ============================================

      moveTask: async (
        id: string,
        workspaceId: string,
        payload: MoveTaskPayload,
      ) => {
        set({ isMoving: true, error: null });

        try {
          const updatedTask = await taskService.moveTask(id, payload);

          set((state) => {
            const currentTasks = state.tasksByWorkspace[workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [workspaceId]: currentTasks.map((t) =>
                  t._id === id ? updatedTask : t,
                ),
              },
              isMoving: false,
            };
          });

          console.log("✅ Task moved:", updatedTask.status);
          return updatedTask;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to move task";
          set({ error: message, isMoving: false });
          console.error("❌ Move task error:", message);

          // Refresh to revert optimistic update
          await get().fetchWorkspaceTasks(workspaceId);
          throw error;
        }
      },

      // ============================================
      // OPTIMISTIC MOVE (instant UI feedback)
      // ============================================

      optimisticMove: (
        taskId: string,
        workspaceId: string,
        newStatus: TaskStatus,
        newPosition: number,
      ) => {
        set((state) => {
          const currentTasks = state.tasksByWorkspace[workspaceId] || [];

          return {
            tasksByWorkspace: {
              ...state.tasksByWorkspace,
              [workspaceId]: currentTasks.map((t) =>
                t._id === taskId
                  ? { ...t, status: newStatus, position: newPosition }
                  : t,
              ),
            },
          };
        });
      },

      // ============================================
      // CHECKLIST
      // ============================================

      addChecklistItem: async (taskId: string, text: string) => {
        try {
          const updatedTask = await taskService.addChecklistItem(taskId, text);
          const workspaceId = updatedTask.workspace;

          set((state) => {
            const currentTasks = state.tasksByWorkspace[workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [workspaceId]: currentTasks.map((t) =>
                  t._id === taskId ? updatedTask : t,
                ),
              },
              activeTask:
                state.activeTask?._id === taskId
                  ? updatedTask
                  : state.activeTask,
            };
          });
        } catch (error: any) {
          console.error("❌ Add checklist error:", error.message);
          throw error;
        }
      },

      toggleChecklistItem: async (taskId: string, itemId: string) => {
        try {
          const updatedTask = await taskService.toggleChecklistItem(
            taskId,
            itemId,
          );
          const workspaceId = updatedTask.workspace;

          set((state) => {
            const currentTasks = state.tasksByWorkspace[workspaceId] || [];

            return {
              tasksByWorkspace: {
                ...state.tasksByWorkspace,
                [workspaceId]: currentTasks.map((t) =>
                  t._id === taskId ? updatedTask : t,
                ),
              },
              activeTask:
                state.activeTask?._id === taskId
                  ? updatedTask
                  : state.activeTask,
            };
          });
        } catch (error: any) {
          console.error("❌ Toggle checklist error:", error.message);
          throw error;
        }
      },

      // ============================================
      // UTILITY
      // ============================================

      setActiveTask: (task: Task | null) => {
        set({ activeTask: task });
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    { name: "task-store" },
  ),
);

// ============================================
// STABLE EMPTY REFERENCES
// ============================================

const EMPTY_TASKS: Task[] = [];

const EMPTY_GROUPED: GroupedTasks = {
  todo: [],
  in_progress: [],
  done: [],
};

const EMPTY_COUNTS = {
  todo: 0,
  in_progress: 0,
  done: 0,
  total: 0,
};

// ============================================
// SELECTORS (Optimized)
// ============================================

/**
 * Get all tasks for a workspace
 */
export const useWorkspaceTasks = (workspaceId: string | null) => {
  return useTaskStore((state) =>
    workspaceId
      ? state.tasksByWorkspace[workspaceId] || EMPTY_TASKS
      : EMPTY_TASKS
  );
};

/**
 * Get tasks grouped by status (Kanban columns)
 * Uses useShallow to prevent infinite loops
 */
export const useGroupedTasks = (workspaceId: string | null): GroupedTasks => {
  // Get raw tasks (stable reference)
  const tasks = useTaskStore((state) =>
    workspaceId
      ? state.tasksByWorkspace[workspaceId] || EMPTY_TASKS
      : EMPTY_TASKS
  );

  // Compute grouped in useMemo to cache result
  return useMemo(() => {
    if (tasks.length === 0) return EMPTY_GROUPED;

    const sorted = [...tasks].sort((a, b) => a.position - b.position);

    return {
      todo: sorted.filter((t) => t.status === "todo"),
      in_progress: sorted.filter((t) => t.status === "in_progress"),
      done: sorted.filter((t) => t.status === "done"),
    };
  }, [tasks]);
};

/**
 * Get task count by status
 * Uses useMemo to cache result
 */
export const useTaskCounts = (workspaceId: string | null) => {
  // Get raw tasks (stable reference)
  const tasks = useTaskStore((state) =>
    workspaceId
      ? state.tasksByWorkspace[workspaceId] || EMPTY_TASKS
      : EMPTY_TASKS
  );

  // Compute counts in useMemo
  return useMemo(() => {
    if (tasks.length === 0) return EMPTY_COUNTS;

    return {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      total: tasks.length,
    };
  }, [tasks]);
};