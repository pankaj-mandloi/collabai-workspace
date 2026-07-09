import mongoose from "mongoose";

// Member sub-schema (embedded in workspace)
const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Invitation sub-schema (for pending invites)
const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { _id: true }
);

// Main workspace schema
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [memberSchema],
    invitations: [invitationSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      isPublic: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
workspaceSchema.index({ owner: 1, createdAt: -1 });
workspaceSchema.index({ "members.user": 1 });
workspaceSchema.index({ slug: 1 });

// Virtual for member count
workspaceSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get member's user ID - handles both populated and non-populated cases
 * - Populated: member.user = { _id, email, ... } → returns _id
 * - Non-populated: member.user = ObjectId → returns the ObjectId string
 */
function getMemberUserId(member) {
  if (!member?.user) return null;
  return member.user._id
    ? member.user._id.toString()
    : member.user.toString();
}

// ============================================
// INSTANCE METHODS
// ============================================

// Method: Check if user is member
workspaceSchema.methods.isMember = function (userId) {
  const userIdStr = userId.toString();
  return this.members.some(
    (member) => getMemberUserId(member) === userIdStr
  );
};

// Method: Get user's role in workspace
workspaceSchema.methods.getUserRole = function (userId) {
  const userIdStr = userId.toString();
  const member = this.members.find(
    (m) => getMemberUserId(m) === userIdStr
  );
  return member ? member.role : null;
};

// Method: Check if user is owner or admin (can manage workspace)
workspaceSchema.methods.canManage = function (userId) {
  const role = this.getUserRole(userId);
  return role === "owner" || role === "admin";
};

// Serialize virtuals
workspaceSchema.set("toJSON", { virtuals: true });
workspaceSchema.set("toObject", { virtuals: true });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;