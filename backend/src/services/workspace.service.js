import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

class WorkspaceService {
  /**
   * Generate unique slug from workspace name
   */
  generateSlug(name) {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSuffix}`;
  }

  /**
   * Create new workspace
   */
  async create(data, user) {
    try {
      const { name, description } = data;

      if (!name || name.trim().length < 3) {
        throw new ApiError(400, "Workspace name must be at least 3 characters");
      }

      const slug = this.generateSlug(name);

      let workspace = await Workspace.create({
        name: name.trim(),
        description: description?.trim() || "",
        slug,
        owner: user._id,
        members: [
          {
            user: user._id,
            role: "owner",
            joinedAt: new Date(),
          },
        ],
      });

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { workspaces: workspace._id },
      });

      // Populate before returning
      workspace = await Workspace.findById(workspace._id)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Workspace created: ${workspace.name} by ${user.email}`);
      return workspace;
    } catch (error) {
      console.error("❌ Error creating workspace:", error.message);
      throw error;
    }
  }

  /**
   * Get all workspaces user is part of
   */
  async getAllForUser(userId) {
    try {
      const workspaces = await Workspace.find({
        "members.user": userId,
        isActive: true,
      })
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar")
        .sort({ createdAt: -1 });

      return workspaces;
    } catch (error) {
      console.error("❌ Error fetching workspaces:", error.message);
      throw error;
    }
  }

  /**
   * Get single workspace by ID
   */
  async getById(workspaceId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar")
        .populate("invitations.invitedBy", "firstName lastName email");

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.isActive) {
        throw new ApiError(404, "Workspace no longer active");
      }

      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      return workspace;
    } catch (error) {
      console.error("❌ Error fetching workspace:", error.message);
      throw error;
    }
  }

  /**
   * Update workspace details
   */
  async update(workspaceId, data, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.canManage(userId)) {
        throw new ApiError(403, "Only owner or admin can update workspace");
      }

      const { name, description, avatar, settings } = data;

      if (name !== undefined) workspace.name = name.trim();
      if (description !== undefined) workspace.description = description.trim();
      if (avatar !== undefined) workspace.avatar = avatar;
      if (settings !== undefined) {
        workspace.settings = { ...workspace.settings, ...settings };
      }

      await workspace.save();

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Workspace updated: ${workspace.name}`);
      return updated;
    } catch (error) {
      console.error("❌ Error updating workspace:", error.message);
      throw error;
    }
  }

  /**
   * Delete workspace (soft delete)
   */
  async delete(workspaceId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (workspace.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Only owner can delete workspace");
      }

      workspace.isActive = false;
      await workspace.save();

      await User.updateMany(
        { workspaces: workspaceId },
        { $pull: { workspaces: workspaceId } }
      );

      console.log(`✅ Workspace deleted: ${workspace.name}`);
      return workspace;
    } catch (error) {
      console.error("❌ Error deleting workspace:", error.message);
      throw error;
    }
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(workspaceId, inviteData, userId) {
    try {
      const { email, role = "member" } = inviteData;

      if (!email || !email.includes("@")) {
        throw new ApiError(400, "Valid email is required");
      }

      const workspace = await Workspace.findById(workspaceId).populate(
        "members.user",
        "email"
      );

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.canManage(userId)) {
        throw new ApiError(403, "Only owner or admin can invite members");
      }

      // Check if user exists
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      // If user exists and already a member
      if (existingUser && workspace.isMember(existingUser._id)) {
        throw new ApiError(400, "User is already a member");
      }

      // Check if invitation already sent
      const existingInvite = workspace.invitations.find(
        (inv) =>
          inv.email === email.toLowerCase() && inv.status === "pending"
      );

      if (existingInvite) {
        throw new ApiError(400, "Invitation already sent to this email");
      }

      // Add invitation
      workspace.invitations.push({
        email: email.toLowerCase(),
        role,
        invitedBy: userId,
        invitedAt: new Date(),
        status: "pending",
      });

      await workspace.save();

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Invitation sent to ${email} for ${workspace.name}`);
      return updated;
    } catch (error) {
      console.error("❌ Error inviting member:", error.message);
      throw error;
    }
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(workspaceId, invitationId, user) {
    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      const invitation = workspace.invitations.id(invitationId);

      if (!invitation) {
        throw new ApiError(404, "Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new ApiError(400, "Invitation already processed");
      }

      if (invitation.email !== user.email.toLowerCase()) {
        throw new ApiError(403, "This invitation is not for you");
      }

      // Add user as member
      workspace.members.push({
        user: user._id,
        role: invitation.role,
        joinedAt: new Date(),
      });

      // Update invitation status
      invitation.status = "accepted";

      await workspace.save();

      // Add workspace to user's workspaces
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { workspaces: workspace._id },
      });

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ ${user.email} joined workspace ${workspace.name}`);
      return updated;
    } catch (error) {
      console.error("❌ Error accepting invitation:", error.message);
      throw error;
    }
  }

  /**
   * Cancel/Delete a pending invitation
   */
  async cancelInvitation(workspaceId, invitationId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.canManage(userId)) {
        throw new ApiError(403, "Only owner or admin can cancel invitations");
      }

      const invitation = workspace.invitations.id(invitationId);

      if (!invitation) {
        throw new ApiError(404, "Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new ApiError(400, "Only pending invitations can be cancelled");
      }

      // Remove invitation
      workspace.invitations.pull(invitationId);
      await workspace.save();

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Invitation cancelled for workspace ${workspace.name}`);
      return updated;
    } catch (error) {
      console.error("❌ Error cancelling invitation:", error.message);
      throw error;
    }
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId, memberUserId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (!workspace.canManage(userId)) {
        throw new ApiError(403, "Only owner or admin can remove members");
      }

      if (workspace.owner.toString() === memberUserId.toString()) {
        throw new ApiError(400, "Cannot remove workspace owner");
      }

      workspace.members = workspace.members.filter(
        (m) => {
          const mId = m.user._id ? m.user._id.toString() : m.user.toString();
          return mId !== memberUserId.toString();
        }
      );

      await workspace.save();

      await User.findByIdAndUpdate(memberUserId, {
        $pull: { workspaces: workspaceId },
      });

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Member removed from ${workspace.name}`);
      return updated;
    } catch (error) {
      console.error("❌ Error removing member:", error.message);
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(workspaceId, memberUserId, newRole, userId) {
    try {
      if (!["admin", "member"].includes(newRole)) {
        throw new ApiError(400, "Invalid role");
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        throw new ApiError(404, "Workspace not found");
      }

      if (workspace.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Only owner can change member roles");
      }

      const member = workspace.members.find((m) => {
        const mId = m.user._id ? m.user._id.toString() : m.user.toString();
        return mId === memberUserId.toString();
      });

      if (!member) {
        throw new ApiError(404, "Member not found");
      }

      if (member.role === "owner") {
        throw new ApiError(400, "Cannot change owner role");
      }

      member.role = newRole;
      await workspace.save();

      // Return populated
      const updated = await Workspace.findById(workspaceId)
        .populate("owner", "firstName lastName email avatar")
        .populate("members.user", "firstName lastName email avatar");

      console.log(`✅ Member role updated to ${newRole}`);
      return updated;
    } catch (error) {
      console.error("❌ Error updating role:", error.message);
      throw error;
    }
  }
}

export default new WorkspaceService();