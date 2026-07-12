import api from "./api";
import {
  AIResponse,
  AIStatus,
  ChatAIPayload,
  SummarizePayload,
} from "@/types/ai.types";
import { ApiResponse } from "@/types/workspace.types";

class AIService {
  /**
   * Check AI service status
   */
  async getStatus(): Promise<AIStatus> {
    const response = await api.get<ApiResponse<AIStatus>>("/ai/status");
    return response.data.data;
  }

  /**
   * Send basic chat message to AI
   */
  async chat(message: string, context?: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>("/ai/chat", {
      message,
      context,
    });
    return response.data.data;
  }

  /**
   * Chat with workspace context (RAG - AI knows workspace data)
   */
  async chatWithWorkspace(payload: ChatAIPayload): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(
      "/ai/chat/workspace",
      payload
    );
    return response.data.data;
  }

  /**
   * Multi-turn conversation with history
   */
  async chatWithHistory(
    messages: Array<{ role: "user" | "ai"; content: string }>
  ): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(
      "/ai/chat/history",
      { messages }
    );
    return response.data.data;
  }

  /**
   * Summarize text
   */
  async summarize(
    payload: SummarizePayload
  ): Promise<{ summary: string; originalLength: number }> {
    const response = await api.post<
      ApiResponse<{ summary: string; originalLength: number }>
    >("/ai/summarize", payload);
    return response.data.data;
  }

  /**
   * Generate custom text
   */
  async generate(prompt: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>("/ai/generate", {
      prompt,
    });
    return response.data.data;
  }
}

export const aiService = new AIService();