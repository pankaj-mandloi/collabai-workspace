import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Workspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  InviteMemberPayload,
} from "@/types/workspace.types";
import { workspaceService } from "@/services/workspace.service";

interface WorkspaceState {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace>;
  updateWorkspace: (
    id: string,
    payload: UpdateWorkspacePayload
  ) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (
    workspaceId: string,
    payload: InviteMemberPayload
  ) => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch all workspaces
      fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
          const workspaces = await workspaceService.getAll();
          set({ workspaces, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch workspaces";
          set({ error: message, isLoading: false });
          console.error("❌ Fetch workspaces error:", message);
        }
      },

      // Fetch single workspace
      fetchWorkspaceById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const workspace = await workspaceService.getById(id);
          set({ currentWorkspace: workspace, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch workspace";
          set({ error: message, isLoading: false });
          console.error("❌ Fetch workspace error:", message);
        }
      },

      // Create workspace
      createWorkspace: async (payload: CreateWorkspacePayload) => {
        set({ isCreating: true, error: null });
        try {
          const newWorkspace = await workspaceService.create(payload);
          set((state) => ({
            workspaces: [newWorkspace, ...state.workspaces],
            isCreating: false,
          }));
          console.log("✅ Workspace created:", newWorkspace.name);
          return newWorkspace;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to create workspace";
          set({ error: message, isCreating: false });
          console.error("❌ Create workspace error:", message);
          throw error;
        }
      },

      // Update workspace
      updateWorkspace: async (
        id: string,
        payload: UpdateWorkspacePayload
      ) => {
        set({ isUpdating: true, error: null });
        try {
          const updatedWorkspace = await workspaceService.update(id, payload);
          set((state) => ({
            workspaces: state.workspaces.map((w) =>
              w._id === id ? updatedWorkspace : w
            ),
            currentWorkspace:
              state.currentWorkspace?._id === id
                ? updatedWorkspace
                : state.currentWorkspace,
            isUpdating: false,
          }));
          console.log("✅ Workspace updated:", updatedWorkspace.name);
          return updatedWorkspace;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to update workspace";
          set({ error: message, isUpdating: false });
          console.error("❌ Update workspace error:", message);
          throw error;
        }
      },

      // Delete workspace
      deleteWorkspace: async (id: string) => {
        set({ isDeleting: true, error: null });
        try {
          await workspaceService.delete(id);
          set((state) => ({
            workspaces: state.workspaces.filter((w) => w._id !== id),
            currentWorkspace:
              state.currentWorkspace?._id === id
                ? null
                : state.currentWorkspace,
            isDeleting: false,
          }));
          console.log("✅ Workspace deleted");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to delete workspace";
          set({ error: message, isDeleting: false });
          console.error("❌ Delete workspace error:", message);
          throw error;
        }
      },

      // Invite member
      inviteMember: async (
        workspaceId: string,
        payload: InviteMemberPayload
      ) => {
        set({ error: null });
        try {
          const updatedWorkspace = await workspaceService.inviteMember(
            workspaceId,
            payload
          );
          set((state) => ({
            workspaces: state.workspaces.map((w) =>
              w._id === workspaceId ? updatedWorkspace : w
            ),
            currentWorkspace:
              state.currentWorkspace?._id === workspaceId
                ? updatedWorkspace
                : state.currentWorkspace,
          }));
          console.log("✅ Member invited:", payload.email);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to invite member";
          set({ error: message });
          console.error("❌ Invite member error:", message);
          throw error;
        }
      },

      // Remove member
      removeMember: async (workspaceId: string, memberId: string) => {
        set({ error: null });
        try {
          const updatedWorkspace = await workspaceService.removeMember(
            workspaceId,
            memberId
          );
          set((state) => ({
            workspaces: state.workspaces.map((w) =>
              w._id === workspaceId ? updatedWorkspace : w
            ),
            currentWorkspace:
              state.currentWorkspace?._id === workspaceId
                ? updatedWorkspace
                : state.currentWorkspace,
          }));
          console.log("✅ Member removed");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to remove member";
          set({ error: message });
          console.error("❌ Remove member error:", message);
          throw error;
        }
      },

      // Set current workspace
      setCurrentWorkspace: (workspace: Workspace | null) => {
        set({ currentWorkspace: workspace });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set(initialState),
    }),
    { name: "workspace-store" } // DevTools name
  )
);