import workspaceService from "../services/workspace.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class WorkspaceController {
  /**
   * POST /api/v1/workspaces
   * Create new workspace
   */
  createWorkspace = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.create(req.body, req.user);

    return res
      .status(201)
      .json(new ApiResponse(201, workspace, "Workspace created successfully"));
  });

  /**
   * GET /api/v1/workspaces
   * Get all workspaces for logged-in user
   */
  getAllWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await workspaceService.getAllForUser(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, workspaces, "Workspaces fetched successfully")
      );
  });

  /**
   * GET /api/v1/workspaces/:id
   * Get single workspace by ID
   */
  getWorkspaceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workspace = await workspaceService.getById(id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Workspace fetched successfully"));
  });

  /**
   * PATCH /api/v1/workspaces/:id
   * Update workspace details
   */
  updateWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workspace = await workspaceService.update(
      id,
      req.body,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Workspace updated successfully"));
  });

  /**
   * DELETE /api/v1/workspaces/:id
   * Delete workspace (soft delete)
   */
  deleteWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await workspaceService.delete(id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Workspace deleted successfully"));
  });

  /**
   * POST /api/v1/workspaces/:id/invitations
   * Invite member to workspace
   */
  inviteMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workspace = await workspaceService.inviteMember(
      id,
      req.body,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Invitation sent successfully"));
  });

  /**
   * POST /api/v1/workspaces/:id/invitations/:invitationId/accept
   * Accept invitation
   */
  acceptInvitation = asyncHandler(async (req, res) => {
    const { id, invitationId } = req.params;
    const workspace = await workspaceService.acceptInvitation(
      id,
      invitationId,
      req.user
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Invitation accepted"));
  });

  /**
   * DELETE /api/v1/workspaces/:id/members/:memberId
   * Remove member from workspace
   */
  removeMember = asyncHandler(async (req, res) => {
    const { id, memberId } = req.params;
    const workspace = await workspaceService.removeMember(
      id,
      memberId,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Member removed successfully"));
  });

  /**
   * PATCH /api/v1/workspaces/:id/members/:memberId/role
   * Update member role
   */
  updateMemberRole = asyncHandler(async (req, res) => {
    const { id, memberId } = req.params;
    const { role } = req.body;

    const workspace = await workspaceService.updateMemberRole(
      id,
      memberId,
      role,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, workspace, "Member role updated"));
  });
}

export default new WorkspaceController();