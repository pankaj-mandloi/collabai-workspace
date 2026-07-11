import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Message, TypingUser } from "@/types/message.types";
import { messageService } from "@/services/message.service";

interface MessageState {
  // ============================================
  // STATE
  // ============================================

  messagesByWorkspace: Record<string, Message[]>;
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  paginationByWorkspace: Record<
    string,
    {
      hasMore: boolean;
      oldestMessageDate: string | null;
    }
  >;
  typingUsersByWorkspace: Record<string, TypingUser[]>;
  onlineUsersByWorkspace: Record<string, string[]>;

  // ============================================
  // ACTIONS - Fetching
  // ============================================

  fetchMessages: (workspaceId: string) => Promise<void>;
  loadMoreMessages: (workspaceId: string) => Promise<void>;

  // ============================================
  // ACTIONS - Real-time
  // ============================================

  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string, workspaceId: string) => void;

  // ============================================
  // ACTIONS - Typing
  // ============================================

  addTypingUser: (typingUser: TypingUser) => void;
  removeTypingUser: (userId: string, workspaceId: string) => void;

  // ============================================
  // ACTIONS - Presence
  // ============================================

  setOnlineUsers: (workspaceId: string, userIds: string[]) => void;
  addOnlineUser: (workspaceId: string, userId: string) => void;
  removeOnlineUser: (workspaceId: string, userId: string) => void;

  // ============================================
  // ACTIONS - Workspace
  // ============================================

  setActiveWorkspace: (workspaceId: string | null) => void;
  clearWorkspaceData: (workspaceId: string) => void;

  // ============================================
  // ACTIONS - Utility
  // ============================================

  clearError: () => void;
  reset: () => void;
}

const initialState = {
  messagesByWorkspace: {},
  activeWorkspaceId: null,
  isLoading: false,
  isLoadingMore: false,
  isSending: false,
  error: null,
  paginationByWorkspace: {},
  typingUsersByWorkspace: {},
  onlineUsersByWorkspace: {},
};

export const useMessageStore = create<MessageState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ============================================
      // FETCH MESSAGES
      // ============================================

      fetchMessages: async (workspaceId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await messageService.getWorkspaceMessages(
            workspaceId,
            { limit: 50 }
          );

          const messages = response.messages;
          const oldestMessage = messages[0];

          set((state) => ({
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: messages,
            },
            paginationByWorkspace: {
              ...state.paginationByWorkspace,
              [workspaceId]: {
                hasMore: response.pagination.hasMore,
                oldestMessageDate: oldestMessage?.createdAt || null,
              },
            },
            isLoading: false,
          }));

          console.log(
            `✅ Loaded ${messages.length} messages for workspace ${workspaceId}`
          );
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to fetch messages";
          set({ error: message, isLoading: false });
          console.error("❌ Fetch messages error:", message);
        }
      },

      // ============================================
      // LOAD MORE (Pagination)
      // ============================================

      loadMoreMessages: async (workspaceId: string) => {
        const state = get();
        const pagination = state.paginationByWorkspace[workspaceId];

        if (!pagination?.hasMore || !pagination.oldestMessageDate) {
          console.log("⚠️ No more messages to load");
          return;
        }

        if (state.isLoadingMore) {
          console.log("⚠️ Already loading more messages");
          return;
        }

        set({ isLoadingMore: true });

        try {
          const response = await messageService.getWorkspaceMessages(
            workspaceId,
            {
              limit: 50,
              before: pagination.oldestMessageDate,
            }
          );

          const olderMessages = response.messages;
          const oldestMessage = olderMessages[0];

          set((state) => ({
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: [
                ...olderMessages,
                ...(state.messagesByWorkspace[workspaceId] || []),
              ],
            },
            paginationByWorkspace: {
              ...state.paginationByWorkspace,
              [workspaceId]: {
                hasMore: response.pagination.hasMore,
                oldestMessageDate:
                  oldestMessage?.createdAt || pagination.oldestMessageDate,
              },
            },
            isLoadingMore: false,
          }));

          console.log(`✅ Loaded ${olderMessages.length} older messages`);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to load more messages";
          set({ error: message, isLoadingMore: false });
          console.error("❌ Load more error:", message);
        }
      },

      // ============================================
      // ADD MESSAGE
      // ============================================

      addMessage: (message: Message) => {
        const workspaceId = message.workspace;

        set((state) => {
          const currentMessages = state.messagesByWorkspace[workspaceId] || [];

          if (currentMessages.some((m) => m._id === message._id)) {
            return state;
          }

          return {
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: [...currentMessages, message],
            },
          };
        });
      },

      // ============================================
      // UPDATE MESSAGE
      // ============================================

      updateMessage: (message: Message) => {
        const workspaceId = message.workspace;

        set((state) => {
          const currentMessages = state.messagesByWorkspace[workspaceId] || [];

          return {
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: currentMessages.map((m) =>
                m._id === message._id ? message : m
              ),
            },
          };
        });
      },

      // ============================================
      // REMOVE MESSAGE
      // ============================================

      removeMessage: (messageId: string, workspaceId: string) => {
        set((state) => {
          const currentMessages = state.messagesByWorkspace[workspaceId] || [];

          return {
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: currentMessages.map((m) =>
                m._id === messageId
                  ? {
                      ...m,
                      isDeleted: true,
                      content: "This message was deleted",
                    }
                  : m
              ),
            },
          };
        });
      },

      // ============================================
      // TYPING USERS
      // ============================================

      addTypingUser: (typingUser: TypingUser) => {
        const { workspaceId, userId } = typingUser;

        set((state) => {
          const current = state.typingUsersByWorkspace[workspaceId] || [];

          if (current.some((u) => u.userId === userId)) {
            return state;
          }

          return {
            typingUsersByWorkspace: {
              ...state.typingUsersByWorkspace,
              [workspaceId]: [...current, typingUser],
            },
          };
        });
      },

      removeTypingUser: (userId: string, workspaceId: string) => {
        set((state) => {
          const current = state.typingUsersByWorkspace[workspaceId] || [];

          return {
            typingUsersByWorkspace: {
              ...state.typingUsersByWorkspace,
              [workspaceId]: current.filter((u) => u.userId !== userId),
            },
          };
        });
      },

      // ============================================
      // ONLINE USERS
      // ============================================

      setOnlineUsers: (workspaceId: string, userIds: string[]) => {
        set((state) => ({
          onlineUsersByWorkspace: {
            ...state.onlineUsersByWorkspace,
            [workspaceId]: userIds,
          },
        }));
      },

      addOnlineUser: (workspaceId: string, userId: string) => {
        set((state) => {
          const current = state.onlineUsersByWorkspace[workspaceId] || [];

          if (current.includes(userId)) return state;

          return {
            onlineUsersByWorkspace: {
              ...state.onlineUsersByWorkspace,
              [workspaceId]: [...current, userId],
            },
          };
        });
      },

      removeOnlineUser: (workspaceId: string, userId: string) => {
        set((state) => {
          const current = state.onlineUsersByWorkspace[workspaceId] || [];

          return {
            onlineUsersByWorkspace: {
              ...state.onlineUsersByWorkspace,
              [workspaceId]: current.filter((id) => id !== userId),
            },
          };
        });
      },

      // ============================================
      // WORKSPACE MANAGEMENT
      // ============================================

      setActiveWorkspace: (workspaceId: string | null) => {
        set({ activeWorkspaceId: workspaceId });
      },

      clearWorkspaceData: (workspaceId: string) => {
        set((state) => {
          const {
            [workspaceId]: _msgs,
            ...remainingMessages
          } = state.messagesByWorkspace;
          const {
            [workspaceId]: _typing,
            ...remainingTyping
          } = state.typingUsersByWorkspace;
          const {
            [workspaceId]: _online,
            ...remainingOnline
          } = state.onlineUsersByWorkspace;
          const {
            [workspaceId]: _pagination,
            ...remainingPagination
          } = state.paginationByWorkspace;

          return {
            messagesByWorkspace: remainingMessages,
            typingUsersByWorkspace: remainingTyping,
            onlineUsersByWorkspace: remainingOnline,
            paginationByWorkspace: remainingPagination,
          };
        });
      },

      // ============================================
      // UTILITY
      // ============================================

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    { name: "message-store" }
  )
);

// ============================================
// STABLE EMPTY REFERENCES (prevents re-renders)
// ============================================

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_TYPING: TypingUser[] = [];
const EMPTY_USERS: string[] = [];
const DEFAULT_PAGINATION = {
  hasMore: false,
  oldestMessageDate: null as string | null,
};

// ============================================
// SELECTORS (Optimized hooks)
// ============================================

/**
 * Get messages for a specific workspace
 */
export const useWorkspaceMessages = (workspaceId: string | null) => {
  return useMessageStore((state) =>
    workspaceId
      ? state.messagesByWorkspace[workspaceId] || EMPTY_MESSAGES
      : EMPTY_MESSAGES
  );
};

/**
 * Get typing users for a specific workspace
 */
export const useWorkspaceTypingUsers = (workspaceId: string | null) => {
  return useMessageStore((state) =>
    workspaceId
      ? state.typingUsersByWorkspace[workspaceId] || EMPTY_TYPING
      : EMPTY_TYPING
  );
};

/**
 * Get online users for a specific workspace
 */
export const useWorkspaceOnlineUsers = (workspaceId: string | null) => {
  return useMessageStore((state) =>
    workspaceId
      ? state.onlineUsersByWorkspace[workspaceId] || EMPTY_USERS
      : EMPTY_USERS
  );
};

/**
 * Get pagination info for a workspace
 */
export const useWorkspacePagination = (workspaceId: string | null) => {
  return useMessageStore((state) =>
    workspaceId
      ? state.paginationByWorkspace[workspaceId] || DEFAULT_PAGINATION
      : DEFAULT_PAGINATION
  );
};