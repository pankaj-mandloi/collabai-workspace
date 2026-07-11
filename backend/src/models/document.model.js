import mongoose from "mongoose";

// Version history sub-schema (for future undo/restore feature)
const versionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Collaborator sub-schema (for permissions)
const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: ["view", "edit"],
      default: "edit",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main document schema
const documentSchema = new mongoose.Schema(
  {
    // Basic info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "Untitled Document",
    },
    content: {
      type: String,
      default: "",
    },

    // Icon/emoji for the document
    icon: {
      type: String,
      default: "📄",
    },

    // Cover image (optional)
    coverImage: {
      type: String,
      default: "",
    },

    // Workspace
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    // Who created
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who last edited
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Collaborators with permissions
    collaborators: [collaboratorSchema],

    // Version history (for future features)
    versions: [versionSchema],

    // Access control
    isPublic: {
      type: Boolean,
      default: false,
    },

    // Star/favorite
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Position for ordering (like Notion pages)
    position: {
      type: Number,
      default: 0,
    },

    // Parent document (for nested docs - future feature)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // Auto-save tracking
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },

    // Word count (calculated)
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
documentSchema.index({ workspace: 1, isDeleted: 1, position: 1 });
documentSchema.index({ workspace: 1, createdBy: 1 });
documentSchema.index({ createdBy: 1, isDeleted: 1 });
documentSchema.index({ parent: 1 });

// Virtual for excerpt (first 200 characters)
documentSchema.virtual("excerpt").get(function () {
  if (!this.content) return "";
  // Strip HTML tags and get first 200 chars
  const text = this.content.replace(/<[^>]*>/g, "");
  return text.length > 200 ? text.substring(0, 200) + "..." : text;
});

// Method: Check if user has access
documentSchema.methods.hasAccess = function (userId) {
  const userIdStr = userId.toString();

  // Creator always has access
  if (this.createdBy.toString() === userIdStr) return true;

  // Check collaborators
  return this.collaborators.some((c) => {
    const cId = c.user._id ? c.user._id.toString() : c.user.toString();
    return cId === userIdStr;
  });
};

// Method: Check if user can edit
documentSchema.methods.canEdit = function (userId) {
  const userIdStr = userId.toString();

  // Creator can always edit
  if (this.createdBy.toString() === userIdStr) return true;

  // Check collaborator permissions
  const collab = this.collaborators.find((c) => {
    const cId = c.user._id ? c.user._id.toString() : c.user.toString();
    return cId === userIdStr;
  });

  return collab?.permission === "edit";
};

// Method: Check if user starred this document
documentSchema.methods.isStarredBy = function (userId) {
  const userIdStr = userId.toString();
  return this.starredBy.some((id) => id.toString() === userIdStr);
};

// Calculate word count on save
documentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    // Strip HTML tags and count words
    const text = this.content.replace(/<[^>]*>/g, "").trim();
    this.wordCount = text ? text.split(/\s+/).length : 0;
    this.lastSavedAt = new Date();
  }
  next();
});

// Serialize virtuals
documentSchema.set("toJSON", { virtuals: true });
documentSchema.set("toObject", { virtuals: true });

const Document = mongoose.model("Document", documentSchema);

export default Document;