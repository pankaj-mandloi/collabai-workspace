import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useMemo } from "react";
import {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from "@/types/document.types";
import { documentService } from "@/services/document.service";

interface DocumentState {
  // State
  documentsByWorkspace: Record<string, Document[]>;
  activeDocument: Document | null;
  isLoading: boolean;
  isCreating: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchWorkspaceDocuments: (workspaceId: string) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  createDocument: (payload: CreateDocumentPayload) => Promise<Document>;
  updateDocument: (id: string, payload: UpdateDocumentPayload) => Promise<Document>;
  deleteDocument: (id: string, workspaceId: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  setActiveDocument: (doc: Document | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  documentsByWorkspace: {},
  activeDocument: null,
  isLoading: false,
  isCreating: false,
  isSaving: false,
  isDeleting: false,
  error: null,
};

export const useDocumentStore = create<DocumentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchWorkspaceDocuments: async (workspaceId: string) => {
        set({ isLoading: true, error: null });
        try {
          const documents = await documentService.getWorkspaceDocuments(
            workspaceId
          );
          set((state) => ({
            documentsByWorkspace: {
              ...state.documentsByWorkspace,
              [workspaceId]: documents,
            },
            isLoading: false,
          }));
          console.log(`✅ Loaded ${documents.length} documents`);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch documents";
          set({ error: message, isLoading: false });
        }
      },

      fetchDocumentById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const document = await documentService.getDocumentById(id);
          set({ activeDocument: document, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch document";
          set({ error: message, isLoading: false });
        }
      },

      createDocument: async (payload: CreateDocumentPayload) => {
        set({ isCreating: true, error: null });
        try {
          const newDoc = await documentService.createDocument(payload);

          set((state) => {
            const currentDocs =
              state.documentsByWorkspace[payload.workspaceId] || [];
            return {
              documentsByWorkspace: {
                ...state.documentsByWorkspace,
                [payload.workspaceId]: [newDoc, ...currentDocs],
              },
              isCreating: false,
            };
          });

          console.log("✅ Document created:", newDoc.title);
          return newDoc;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to create document";
          set({ error: message, isCreating: false });
          throw error;
        }
      },

      updateDocument: async (id: string, payload: UpdateDocumentPayload) => {
        set({ isSaving: true, error: null });
        try {
          const updated = await documentService.updateDocument(id, payload);
          const workspaceId = updated.workspace;

          set((state) => {
            const currentDocs =
              state.documentsByWorkspace[workspaceId] || [];
            return {
              documentsByWorkspace: {
                ...state.documentsByWorkspace,
                [workspaceId]: currentDocs.map((d) =>
                  d._id === id ? updated : d
                ),
              },
              activeDocument:
                state.activeDocument?._id === id ? updated : state.activeDocument,
              isSaving: false,
            };
          });

          return updated;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to update document";
          set({ error: message, isSaving: false });
          throw error;
        }
      },

      deleteDocument: async (id: string, workspaceId: string) => {
        set({ isDeleting: true, error: null });
        try {
          await documentService.deleteDocument(id);
          set((state) => ({
            documentsByWorkspace: {
              ...state.documentsByWorkspace,
              [workspaceId]: (
                state.documentsByWorkspace[workspaceId] || []
              ).filter((d) => d._id !== id),
            },
            activeDocument:
              state.activeDocument?._id === id ? null : state.activeDocument,
            isDeleting: false,
          }));
          console.log("✅ Document deleted");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to delete document";
          set({ error: message, isDeleting: false });
          throw error;
        }
      },

      toggleStar: async (id: string) => {
        try {
          const updated = await documentService.toggleStar(id);
          const workspaceId = updated.workspace;

          set((state) => ({
            documentsByWorkspace: {
              ...state.documentsByWorkspace,
              [workspaceId]: (
                state.documentsByWorkspace[workspaceId] || []
              ).map((d) => (d._id === id ? updated : d)),
            },
            activeDocument:
              state.activeDocument?._id === id ? updated : state.activeDocument,
          }));
        } catch (error: any) {
          console.error("❌ Star toggle error:", error.message);
          throw error;
        }
      },

      setActiveDocument: (doc: Document | null) => {
        set({ activeDocument: doc });
      },

      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    { name: "document-store" }
  )
);

// Stable empty reference
const EMPTY_DOCS: Document[] = [];

// Selectors
export const useWorkspaceDocuments = (workspaceId: string | null) => {
  return useDocumentStore((state) =>
    workspaceId
      ? state.documentsByWorkspace[workspaceId] || EMPTY_DOCS
      : EMPTY_DOCS
  );
};

export const useActiveDocument = () => {
  return useDocumentStore((state) => state.activeDocument);
};