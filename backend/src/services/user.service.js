import User from "../models/user.model.js";
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
}

export default new UserService();