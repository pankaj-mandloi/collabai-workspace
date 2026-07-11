import api from "./api";
import {
  Message,
  MessagesResponse,
  SendMessagePayload,
  EditMessagePayload,
  AddReactionPayload,
} from "@/types/message.types";
import { ApiResponse } from "@/types/workspace.types";

class MessageService {
  /**
   * Get workspace messages with pagination
   */
  async getWorkspaceMessages(
    workspaceId: string,
    options: { page?: number; limit?: number; before?: string } = {}
  ): Promise<MessagesResponse> {
    const { page, limit, before } = options;

    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (before) params.append("before", before);

    const queryString = params.toString();
    const url = `/messages/workspace/${workspaceId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await api.get<ApiResponse<MessagesResponse>>(url);
    return response.data.data;
  }

  /**
   * Get single message by ID
   */
  async getMessageById(id: string): Promise<Message> {
    const response = await api.get<ApiResponse<Message>>(`/messages/${id}`);
    return response.data.data;
  }

  /**
   * Send message via REST (fallback if socket fails)
   */
  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const response = await api.post<ApiResponse<Message>>(
      "/messages",
      payload
    );
    return response.data.data;
  }

  /**
   * Edit message
   */
  async editMessage(
    messageId: string,
    payload: EditMessagePayload
  ): Promise<Message> {
    const response = await api.patch<ApiResponse<Message>>(
      `/messages/${messageId}`,
      payload
    );
    return response.data.data;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<Message> {
    const response = await api.delete<ApiResponse<Message>>(
      `/messages/${messageId}`
    );
    return response.data.data;
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    messageId: string,
    payload: AddReactionPayload
  ): Promise<Message> {
    const response = await api.post<ApiResponse<Message>>(
      `/messages/${messageId}/reactions`,
      payload
    );
    return response.data.data;
  }

  /**
   * Get workspace message count
   */
  async getMessageCount(workspaceId: string): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>(
      `/messages/workspace/${workspaceId}/count`
    );
    return response.data.data.count;
  }
}

export const messageService = new MessageService();