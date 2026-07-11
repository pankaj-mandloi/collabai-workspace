export interface TaskUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

export interface TaskLabel {
  name: string;
  color?: string;
}

export interface TaskChecklistItem {
  _id: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string | null;
  completedAt?: string | null;
}

export interface TaskComment {
  _id: string;
  content: string;
  author: TaskUser;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  type: "image" | "file" | "link";
  url: string;
  name: string;
}

export interface ChecklistProgress {
  completed: number;
  total: number;
  percentage: number;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskUser[];
  createdBy: TaskUser;
  workspace: string;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  position: number;
  labels: TaskLabel[];
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  checklistProgress?: ChecklistProgress | null;
  isOverdue?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedTasks {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

export interface WorkspaceTasksResponse {
  tasks: Task[];
  grouped: GroupedTasks;
  total: number;
}

// Payloads
export interface CreateTaskPayload {
  title: string;
  description?: string;
  workspaceId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignees?: string[];
  dueDate?: string | null;
  labels?: TaskLabel[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignees?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  labels?: TaskLabel[];
}

export interface MoveTaskPayload {
  status?: TaskStatus;
  position?: number;
}