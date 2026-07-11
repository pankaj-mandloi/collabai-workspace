import api from "./api";
import {
  Task,
  WorkspaceTasksResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
} from "@/types/task.types";
import { ApiResponse } from "@/types/workspace.types";

class TaskService {
  async getWorkspaceTasks(
    workspaceId: string
  ): Promise<WorkspaceTasksResponse> {
    const response = await api.get<ApiResponse<WorkspaceTasksResponse>>(
      `/tasks/workspace/${workspaceId}`
    );
    return response.data.data;
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>("/tasks", payload);
    return response.data.data;
  }

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(
      `/tasks/${id}`,
      payload
    );
    return response.data.data;
  }

  async moveTask(id: string, payload: MoveTaskPayload): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(
      `/tasks/${id}/move`,
      payload
    );
    return response.data.data;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  async getUserTasks(workspaceId?: string): Promise<Task[]> {
    const url = workspaceId
      ? `/tasks/my-tasks?workspaceId=${workspaceId}`
      : "/tasks/my-tasks";
    const response = await api.get<ApiResponse<Task[]>>(url);
    return response.data.data;
  }

  async addChecklistItem(taskId: string, text: string): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(
      `/tasks/${taskId}/checklist`,
      { text }
    );
    return response.data.data;
  }

  async toggleChecklistItem(taskId: string, itemId: string): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/checklist/${itemId}`
    );
    return response.data.data;
  }
}

export const taskService = new TaskService();