import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Who triggered it
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "workspace_invitation",
        "invitation_accepted",
        "new_message",
        "task_assigned",
        "task_updated",
        "document_shared",
        "member_joined",
        "member_removed",
        "ai_response",
      ],
      required: true,
    },

    // Title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Description
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Related workspace
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },

    // Link to navigate when clicked
    link: {
      type: String,
      default: "",
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Read timestamp
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;