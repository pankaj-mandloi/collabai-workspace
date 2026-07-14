import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import userService from "../services/user.service.js";

class UserController {
  // GET /api/v1/users/me - Get current user profile
  getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
  });

  // PATCH /api/v1/users/me - Update user profile
  updateProfile = asyncHandler(async (req, res) => {
    const { bio, firstName, lastName } = req.body;
    const user = req.user;

    if (bio !== undefined) user.bio = bio;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    user.lastActive = new Date();
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  });

  // ============================================
  // ✅ NEW: User Status Methods
  // ============================================

  /**
   * PATCH /api/v1/users/me/status - Update current user's status
   * Body: { status: "online" | "away" | "busy" | "offline", statusMessage?: string }
   */
  updateStatus = asyncHandler(async (req, res) => {
    const { status, statusMessage } = req.body;

    if (!status) {
      return res.status(400).json(
        new ApiResponse(400, null, "Status is required")
      );
    }

    const updatedUser = await userService.updateStatus(
      req.user._id,
      status,
      statusMessage || ""
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Status updated successfully"));
  });

  /**
   * GET /api/v1/users/me/status - Get current user's status
   */
  getStatus = asyncHandler(async (req, res) => {
    const user = await userService.getUserWithStatus(req.user._id);
    
    return res.status(200).json(
      new ApiResponse(200, {
        status: user.status,
        statusMessage: user.statusMessage || "",
        lastActive: user.lastActive,
      }, "Status fetched successfully")
    );
  });

  /**
   * GET /api/v1/users/workspace/:workspaceId/status - Get all users in workspace with status
   */
  getWorkspaceUsersStatus = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;

    const users = await userService.getWorkspaceUsersWithStatus(workspaceId);

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Workspace users status fetched successfully"));
  });
}

export default new UserController();