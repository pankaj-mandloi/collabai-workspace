import User, { USER_STATUS } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

class UserService {
  async createUser(clerkData) {
    try {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url,
      } = clerkData;

      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        throw new ApiError(400, "Email is required from Clerk data");
      }

      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        console.log(`⚠️ User already exists: ${email}`);
        return existingUser;
      }

      const user = await User.create({
        clerkId: id,
        email,
        firstName: first_name || "",
        lastName: last_name || "",
        username: username || email.split("@")[0],
        avatar: image_url || "",
        // ✅ Default status: ONLINE
        status: USER_STATUS.ONLINE,
      });

      console.log(`✅ User created in MongoDB: ${user.email}`);
      return user;
    } catch (error) {
      console.error("❌ Error creating user:", error.message);
      throw error;
    }
  }

  async updateUser(clerkData) {
    try {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url,
      } = clerkData;

      const email = email_addresses?.[0]?.email_address;

      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email,
          firstName: first_name || "",
          lastName: last_name || "",
          username: username || email?.split("@")[0],
          avatar: image_url || "",
        },
        { new: true }
      );

      if (!user) {
        throw new ApiError(404, "User not found for update");
      }

      console.log(`✅ User updated in MongoDB: ${user.email}`);
      return user;
    } catch (error) {
      console.error("❌ Error updating user:", error.message);
      throw error;
    }
  }

  async deleteUser(clerkId) {
    try {
      const user = await User.findOneAndDelete({ clerkId });

      if (!user) {
        throw new ApiError(404, "User not found for deletion");
      }

      console.log(`✅ User deleted from MongoDB: ${user.email}`);
      return user;
    } catch (error) {
      console.error("❌ Error deleting user:", error.message);
      throw error;
    }
  }

  async getUserByClerkId(clerkId) {
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async getUserByEmail(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  // ============================================
  // ✅ NEW: User Status Methods
  // ============================================

  /**
   * Update user status
   * @param {string} userId - User ID
   * @param {string} status - ONLINE | AWAY | BUSY | OFFLINE
   * @param {string} statusMessage - Optional custom message
   */
  async updateStatus(userId, status, statusMessage = "") {
    try {
      // Validate status
      const validStatuses = Object.values(USER_STATUS);
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          status,
          statusMessage: statusMessage || "",
          lastActive: new Date(),
        },
        { new: true }
      );

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      console.log(`✅ User status updated: ${user.email} → ${status}`);
      return user;
    } catch (error) {
      console.error("❌ Error updating status:", error.message);
      throw error;
    }
  }

  /**
   * Get user with status
   */
  async getUserWithStatus(userId) {
    const user = await User.findById(userId).select("+status +statusMessage");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  /**
   * Get all users in a workspace with their status
   */
  async getWorkspaceUsersWithStatus(workspaceId) {
    try {
      const users = await User.find({
        workspaces: workspaceId,
        isActive: true,
      }).select("firstName lastName email avatar username status statusMessage lastActive");
      
      return users;
    } catch (error) {
      console.error("❌ Error fetching workspace users with status:", error.message);
      throw error;
    }
  }
}

export default new UserService();