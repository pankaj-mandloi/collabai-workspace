export interface AIResponse {
  message: string;
  model: string;
  timestamp: string;
  contextUsed?: {
    messagesCount: number;
    documentsCount: number;
    tasksCount: number;
  };
}

export interface AIStatus {
  available: boolean;
  model: string;
  provider: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  contextUsed?: {
    messagesCount: number;
    documentsCount: number;
    tasksCount: number;
  };
}

export interface ChatAIPayload {
  message: string;
  workspaceId: string;
}

export interface SummarizePayload {
  text: string;
  maxLength?: number;
}