import Document from "../models/document.model.js";
import Workspace from "../models/workspace.model.js";
import ApiError from "../utils/ApiError.js";

class DocumentService {
  /**
   * Create new document
   */
  async createDocument(data, user) {
    try {
      const { title, content, workspaceId, icon, parent } = data;

      // Verify workspace access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) throw new ApiError(404, "Workspace not found");
      if (!workspace.isMember(user._id)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      // Get position (last in list)
      const lastDoc = await Document.findOne({
        workspace: workspaceId,
        isDeleted: false,
        parent: parent || null,
      })
        .sort({ position: -1 })
        .select("position");

      const position = lastDoc ? lastDoc.position + 1000 : 1000;

      // Create document
      let document = await Document.create({
        title: title?.trim() || "Untitled Document",
        content: content || "",
        icon: icon || "📄",
        workspace: workspaceId,
        createdBy: user._id,
        lastEditedBy: user._id,
        parent: parent || null,
        position,
      });

      // Populate for response
      document = await Document.findById(document._id)
        .populate("createdBy", "firstName lastName email avatar")
        .populate("lastEditedBy", "firstName lastName email avatar")
        .populate("collaborators.user", "firstName lastName email avatar");

      console.log(`✅ Document created: ${document.title}`);
      return document;
    } catch (error) {
      console.error("❌ Error creating document:", error.message);
      throw error;
    }
  }

  /**
   * Get all documents for workspace
   */
  async getWorkspaceDocuments(workspaceId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) throw new ApiError(404, "Workspace not found");
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      const documents = await Document.find({
        workspace: workspaceId,
        isDeleted: false,
      })
        .sort({ position: 1, createdAt: -1 })
        .populate("createdBy", "firstName lastName email avatar")
        .populate("lastEditedBy", "firstName lastName email avatar");

      return documents;
    } catch (error) {
      console.error("❌ Error fetching documents:", error.message);
      throw error;
    }
  }

  /**
   * Get single document by ID
   */
  async getDocumentById(documentId, userId) {
    try {
      const document = await Document.findById(documentId)
        .populate("createdBy", "firstName lastName email avatar")
        .populate("lastEditedBy", "firstName lastName email avatar")
        .populate("collaborators.user", "firstName lastName email avatar");

      if (!document || document.isDeleted) {
        throw new ApiError(404, "Document not found");
      }

      // Verify workspace access
      const workspace = await Workspace.findById(document.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      return document;
    } catch (error) {
      console.error("❌ Error fetching document:", error.message);
      throw error;
    }
  }

  /**
   * Update document (auto-save)
   */
  async updateDocument(documentId, data, userId) {
    try {
      const document = await Document.findById(documentId);
      if (!document || document.isDeleted) {
        throw new ApiError(404, "Document not found");
      }

      // Verify workspace access
      const workspace = await Workspace.findById(document.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      // Update allowed fields
      const allowedFields = [
        "title",
        "content",
        "icon",
        "coverImage",
        "isPublic",
      ];

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          document[field] = data[field];
        }
      });

      // Update lastEditedBy
      document.lastEditedBy = userId;

      await document.save();

      // Return populated
      const updated = await Document.findById(documentId)
        .populate("createdBy", "firstName lastName email avatar")
        .populate("lastEditedBy", "firstName lastName email avatar");

      console.log(`✅ Document updated: ${updated.title}`);
      return updated;
    } catch (error) {
      console.error("❌ Error updating document:", error.message);
      throw error;
    }
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      if (!document || document.isDeleted) {
        throw new ApiError(404, "Document not found");
      }

      const workspace = await Workspace.findById(document.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      // Only creator or workspace admin can delete
      const creatorId = document.createdBy._id
        ? document.createdBy._id.toString()
        : document.createdBy.toString();

      const canDelete =
        creatorId === userId.toString() || workspace.canManage(userId);

      if (!canDelete) {
        throw new ApiError(403, "Only creator or workspace admin can delete");
      }

      document.isDeleted = true;
      document.deletedAt = new Date();
      await document.save();

      console.log(`✅ Document deleted: ${document.title}`);
      return document;
    } catch (error) {
      console.error("❌ Error deleting document:", error.message);
      throw error;
    }
  }

  /**
   * Toggle star (favorite)
   */
  async toggleStar(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      if (!document || document.isDeleted) {
        throw new ApiError(404, "Document not found");
      }

      const workspace = await Workspace.findById(document.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      const userIdStr = userId.toString();
      const isStarred = document.starredBy.some(
        (id) => id.toString() === userIdStr
      );

      if (isStarred) {
        // Remove star
        document.starredBy = document.starredBy.filter(
          (id) => id.toString() !== userIdStr
        );
      } else {
        // Add star
        document.starredBy.push(userId);
      }

      await document.save();
      return document;
    } catch (error) {
      console.error("❌ Error toggling star:", error.message);
      throw error;
    }
  }

  /**
   * Get user's starred documents
   */
  async getStarredDocuments(userId) {
    try {
      const documents = await Document.find({
        starredBy: userId,
        isDeleted: false,
      })
        .sort({ updatedAt: -1 })
        .populate("createdBy", "firstName lastName email avatar")
        .populate("workspace", "name slug");

      return documents;
    } catch (error) {
      console.error("❌ Error fetching starred:", error.message);
      throw error;
    }
  }
}

export default new DocumentService();