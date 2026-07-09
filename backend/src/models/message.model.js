import mongoose from "mongoose";

// Reaction sub-schema (for future emoji reactions)
const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

// Attachment sub-schema (for future file uploads)
const attachmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "file", "video", "audio"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Main message schema
const messageSchema = new mongoose.Schema(
  {
    // Message content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Message type
    type: {
      type: String,
      enum: ["text", "system", "ai"],
      default: "text",
    },

    // Who sent it
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Which workspace
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    // Reply to (threading - future use)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Attachments
    attachments: [attachmentSchema],

    // Reactions
    reactions: [reactionSchema],

    // Mentions (@user)
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

// Compound index for fast workspace message queries
messageSchema.index({ workspace: 1, createdAt: -1 });

// Index for sender-based queries
messageSchema.index({ sender: 1, workspace: 1 });

// Method: Check if user can edit message
messageSchema.methods.canEdit = function (userId) {
  return (
    this.sender.toString() === userId.toString() &&
    !this.isDeleted &&
    // Only allow edit within 15 minutes
    Date.now() - this.createdAt.getTime() < 15 * 60 * 1000
  );
};

// Method: Check if user can delete message
messageSchema.methods.canDelete = function (userId) {
  return this.sender.toString() === userId.toString() && !this.isDeleted;
};

// Serialize virtuals
messageSchema.set("toJSON", { virtuals: true });
messageSchema.set("toObject", { virtuals: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;