import messageService from "../services/message.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class MessageController {
  /**
   * POST /api/v1/messages
   * Send new message to workspace
   */
  sendMessage = asyncHandler(async (req, res) => {
    const message = await messageService.sendMessage(req.body, req.user);

    return res
      .status(201)
      .json(new ApiResponse(201, message, "Message sent successfully"));
  });

  /**
   * GET /api/v1/messages/workspace/:workspaceId
   * Get workspace messages with pagination
   * Query params: page, limit, before
   */
  getWorkspaceMessages = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { page, limit, before } = req.query;

    const result = await messageService.getWorkspaceMessages(
      workspaceId,
      req.user._id,
      { page, limit, before }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Messages fetched successfully"));
  });

  /**
   * GET /api/v1/messages/:id
   * Get single message by ID
   */
  getMessageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await messageService.getMessageById(id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Message fetched successfully"));
  });

  /**
   * PATCH /api/v1/messages/:id
   * Edit message (only sender, within 15 min)
   */
  editMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const message = await messageService.editMessage(
      id,
      content,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Message edited successfully"));
  });

  /**
   * DELETE /api/v1/messages/:id
   * Delete message (soft delete)
   */
  deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await messageService.deleteMessage(id, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Message deleted successfully"));
  });

  /**
   * POST /api/v1/messages/:id/reactions
   * Add or toggle reaction to message
   */
  addReaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { emoji } = req.body;

    const message = await messageService.addReaction(
      id,
      emoji,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Reaction updated successfully"));
  });

  /**
   * GET /api/v1/messages/workspace/:workspaceId/count
   * Get total message count for workspace
   */
  getMessageCount = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const count = await messageService.getMessageCount(workspaceId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { count }, "Message count fetched successfully")
      );
  });
}

export default new MessageController();