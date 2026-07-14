import mongoose from "mongoose";

// ✅ User Status Enum
export const USER_STATUS = {
  ONLINE: "online",
  AWAY: "away",
  BUSY: "busy",
  OFFLINE: "offline",
};

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    username: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // ✅ NEW: User Status Field
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ONLINE,
    },
    // ✅ NEW: Custom status message (optional)
    statusMessage: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;