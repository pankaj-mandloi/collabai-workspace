import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
}

export default new UserController();