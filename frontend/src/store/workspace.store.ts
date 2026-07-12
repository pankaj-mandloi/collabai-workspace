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
  // ============================================
  // STATE
  // ============================================

  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // ============================================
  // ACTIONS
  // ============================================

  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  getWorkspace: (id: string) => Workspace | null;
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
  cancelInvitation: (
    workspaceId: string,
    invitationId: string
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

      // ============================================
      // FETCH ALL WORKSPACES
      // ============================================

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

      // ============================================
      // FETCH SINGLE WORKSPACE
      // ============================================

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

      // ============================================
      // GET WORKSPACE FROM STORE (no API call)
      // ============================================

      getWorkspace: (id: string) => {
        const state = get();
        return state.workspaces.find((w) => w._id === id) || null;
      },

      // ============================================
      // CREATE WORKSPACE
      // ============================================

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

      // ============================================
      // UPDATE WORKSPACE
      // ============================================

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

      // ============================================
      // DELETE WORKSPACE
      // ============================================

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

      // ============================================
      // INVITE MEMBER
      // ============================================

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

      // ============================================
      // CANCEL INVITATION
      // ============================================

      cancelInvitation: async (
        workspaceId: string,
        invitationId: string
      ) => {
        set({ error: null });
        try {
          const updatedWorkspace = await workspaceService.cancelInvitation(
            workspaceId,
            invitationId
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
          console.log("✅ Invitation cancelled");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to cancel invitation";
          set({ error: message });
          console.error("❌ Cancel invitation error:", message);
          throw error;
        }
      },

      // ============================================
      // REMOVE MEMBER
      // ============================================

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

      // ============================================
      // WORKSPACE MANAGEMENT
      // ============================================

      setCurrentWorkspace: (workspace: Workspace | null) => {
        set({ currentWorkspace: workspace });
      },

      // ============================================
      // UTILITY
      // ============================================

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    { name: "workspace-store" }
  )
);

// ============================================
// SELECTORS (Optimized hooks)
// ============================================

/**
 * Get workspace by ID from store
 */
export const useWorkspaceById = (id: string | null) => {
  return useWorkspaceStore((state) =>
    id ? state.workspaces.find((w) => w._id === id) || null : null
  );
};

/**
 * Get current workspace
 */
export const useCurrentWorkspace = () => {
  return useWorkspaceStore((state) => state.currentWorkspace);
};

/**
 * Get workspaces count
 */
export const useWorkspacesCount = () => {
  return useWorkspaceStore((state) => state.workspaces.length);
};