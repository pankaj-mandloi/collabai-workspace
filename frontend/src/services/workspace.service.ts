import api from "./api";
import {
  Workspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
  ApiResponse,
} from "@/types/workspace.types";

class WorkspaceService {
  /**
   * Get all user's workspaces
   */
  async getAll(): Promise<Workspace[]> {
    const response = await api.get<ApiResponse<Workspace[]>>("/workspaces");
    return response.data.data;
  }

  /**
   * Get single workspace by ID
   */
  async getById(id: string): Promise<Workspace> {
    const response = await api.get<ApiResponse<Workspace>>(
      `/workspaces/${id}`
    );
    return response.data.data;
  }

  /**
   * Create new workspace
   */
  async create(payload: CreateWorkspacePayload): Promise<Workspace> {
    const response = await api.post<ApiResponse<Workspace>>(
      "/workspaces",
      payload
    );
    return response.data.data;
  }

  /**
   * Update workspace
   */
  async update(
    id: string,
    payload: UpdateWorkspacePayload
  ): Promise<Workspace> {
    const response = await api.patch<ApiResponse<Workspace>>(
      `/workspaces/${id}`,
      payload
    );
    return response.data.data;
  }

  /**
   * Delete workspace
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`);
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(
    workspaceId: string,
    payload: InviteMemberPayload
  ): Promise<Workspace> {
    const response = await api.post<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/invitations`,
      payload
    );
    return response.data.data;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    workspaceId: string,
    invitationId: string
  ): Promise<Workspace> {
    const response = await api.post<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/invitations/${invitationId}/accept`
    );
    return response.data.data;
  }

  /**
   * Cancel/Delete pending invitation
   */
  async cancelInvitation(
    workspaceId: string,
    invitationId: string
  ): Promise<Workspace> {
    const response = await api.delete<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`
    );
    return response.data.data;
  }

  /**
   * Remove member from workspace
   */
  async removeMember(
    workspaceId: string,
    memberId: string
  ): Promise<Workspace> {
    const response = await api.delete<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/members/${memberId}`
    );
    return response.data.data;
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    payload: UpdateMemberRolePayload
  ): Promise<Workspace> {
    const response = await api.patch<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      payload
    );
    return response.data.data;
  }
}

export const workspaceService = new WorkspaceService();