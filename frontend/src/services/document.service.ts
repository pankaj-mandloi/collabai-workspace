import api from "./api";
import {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from "@/types/document.types";
import { ApiResponse } from "@/types/workspace.types";

class DocumentService {
  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    const response = await api.get<ApiResponse<Document[]>>(
      `/documents/workspace/${workspaceId}`
    );
    return response.data.data;
  }

  async getDocumentById(id: string): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data.data;
  }

  async createDocument(payload: CreateDocumentPayload): Promise<Document> {
    const response = await api.post<ApiResponse<Document>>(
      "/documents",
      payload
    );
    return response.data.data;
  }

  async updateDocument(
    id: string,
    payload: UpdateDocumentPayload
  ): Promise<Document> {
    const response = await api.patch<ApiResponse<Document>>(
      `/documents/${id}`,
      payload
    );
    return response.data.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  }

  async toggleStar(id: string): Promise<Document> {
    const response = await api.post<ApiResponse<Document>>(
      `/documents/${id}/star`
    );
    return response.data.data;
  }

  async getStarredDocuments(): Promise<Document[]> {
    const response = await api.get<ApiResponse<Document[]>>(
      "/documents/starred"
    );
    return response.data.data;
  }
}

export const documentService = new DocumentService();