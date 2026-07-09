// Member type
export interface WorkspaceMember {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

// Invitation type
export interface WorkspaceInvitation {
  _id: string;
  email: string;
  role: "admin" | "member";
  invitedBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  invitedAt: string;
  status: "pending" | "accepted" | "declined";
}

// Workspace settings type
export interface WorkspaceSettings {
  allowMemberInvites: boolean;
  isPublic: boolean;
}

// Main workspace type
export interface Workspace {
  _id: string;
  name: string;
  description: string;
  slug: string;
  avatar: string;
  owner: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  settings: WorkspaceSettings;
  isActive: boolean;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

// API request payloads
export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface InviteMemberPayload {
  email: string;
  role?: "admin" | "member";
}

export interface UpdateMemberRolePayload {
  role: "admin" | "member";
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}