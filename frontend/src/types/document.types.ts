export interface DocumentUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

export interface DocumentCollaborator {
  user: DocumentUser;
  permission: "view" | "edit";
  addedAt: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  icon: string;
  coverImage?: string;
  workspace: string;
  createdBy: DocumentUser;
  lastEditedBy?: DocumentUser;
  collaborators: DocumentCollaborator[];
  isPublic: boolean;
  starredBy: string[];
  position: number;
  parent?: string | null;
  isDeleted: boolean;
  lastSavedAt: string;
  wordCount: number;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  title?: string;
  content?: string;
  workspaceId: string;
  icon?: string;
  parent?: string | null;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: string;
  icon?: string;
  coverImage?: string;
  isPublic?: boolean;
}