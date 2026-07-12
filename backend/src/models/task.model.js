import mongoose from "mongoose";

// Comment sub-schema (for future task discussions)
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Checklist item sub-schema
const checklistItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

// Main task schema
const taskSchema = new mongoose.Schema(
  {
    // Basic info
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Status (Kanban column)
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Assignment
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Who created
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Workspace
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    // Dates
    dueDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // Position (for drag-drop ordering in column)
    position: {
      type: Number,
      default: 0,
    },

    // Labels/Tags
    labels: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        color: {
          type: String,
          default: "#10b981", // emerald default
        },
      },
    ],

    // Checklist items
    checklist: [checklistItemSchema],

    // Comments
    comments: [commentSchema],

    // Attachments
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "link"],
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
      },
    ],

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

// Compound indexes for performance
taskSchema.index({ workspace: 1, status: 1, position: 1 });
taskSchema.index({ workspace: 1, isDeleted: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });

// Text index for AI text search (enables $regex efficient searches)
taskSchema.index({ title: "text", description: "text" });

// Virtual for checklist progress
taskSchema.virtual("checklistProgress").get(function () {
  if (!this.checklist || this.checklist.length === 0) return null;

  const completed = this.checklist.filter((item) => item.isCompleted).length;
  const total = this.checklist.length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
});

// Virtual for overdue status
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "done") return false;
  return new Date() > this.dueDate;
});

// Method: Check if user is assigned
taskSchema.methods.isAssigned = function (userId) {
  const userIdStr = userId.toString();
  return this.assignees.some((assignee) => {
    const id = assignee._id ? assignee._id.toString() : assignee.toString();
    return id === userIdStr;
  });
};

// Method: Check if user can edit
taskSchema.methods.canEdit = function (userId) {
  const userIdStr = userId.toString();
  const creatorId = this.createdBy._id
    ? this.createdBy._id.toString()
    : this.createdBy.toString();

  // Creator or assignee can edit
  return creatorId === userIdStr || this.isAssigned(userId);
};

// Auto-set completedAt when status changes to done
taskSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "done" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "done" && this.completedAt) {
      this.completedAt = null;
    }
  }
  next();
});

// Serialize virtuals
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;