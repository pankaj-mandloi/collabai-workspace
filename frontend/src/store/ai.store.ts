import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AIMessage, ChatAIPayload } from "@/types/ai.types";
import { aiService } from "@/services/ai.service";

interface AIState {
  // Messages per workspace
  messagesByWorkspace: Record<string, AIMessage[]>;

  // Loading states
  isThinking: boolean;
  isPanelOpen: boolean;

  // Error
  error: string | null;

  // Actions
  sendMessage: (payload: ChatAIPayload) => Promise<void>;
  clearMessages: (workspaceId: string) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  messagesByWorkspace: {},
  isThinking: false,
  isPanelOpen: false,
  error: null,
};

export const useAIStore = create<AIState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      sendMessage: async (payload: ChatAIPayload) => {
        const { message, workspaceId } = payload;

        // Add user message immediately
        const userMessage: AIMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messagesByWorkspace: {
            ...state.messagesByWorkspace,
            [workspaceId]: [
              ...(state.messagesByWorkspace[workspaceId] || []),
              userMessage,
            ],
          },
          isThinking: true,
          error: null,
        }));

        try {
          // Call AI with workspace context
          const response = await aiService.chatWithWorkspace({
            message,
            workspaceId,
          });

          // Add AI response
          const aiMessage: AIMessage = {
            id: `ai-${Date.now()}`,
            role: "ai",
            content: response.message,
            timestamp: response.timestamp,
            contextUsed: response.contextUsed,
          };

          set((state) => ({
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: [
                ...(state.messagesByWorkspace[workspaceId] || []),
                aiMessage,
              ],
            },
            isThinking: false,
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "AI service error";

          // Add error message as AI response
          const errorMsg: AIMessage = {
            id: `error-${Date.now()}`,
            role: "ai",
            content: `❌ ${errorMessage}`,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            messagesByWorkspace: {
              ...state.messagesByWorkspace,
              [workspaceId]: [
                ...(state.messagesByWorkspace[workspaceId] || []),
                errorMsg,
              ],
            },
            isThinking: false,
            error: errorMessage,
          }));
        }
      },

      clearMessages: (workspaceId: string) => {
        set((state) => ({
          messagesByWorkspace: {
            ...state.messagesByWorkspace,
            [workspaceId]: [],
          },
        }));
      },

      togglePanel: () => {
        set((state) => ({ isPanelOpen: !state.isPanelOpen }));
      },

      setPanelOpen: (open: boolean) => {
        set({ isPanelOpen: open });
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    { name: "ai-store" }
  )
);

// Stable empty reference
const EMPTY_MESSAGES: AIMessage[] = [];

// Selector for workspace-specific messages
export const useAIMessages = (workspaceId: string | null) => {
  return useAIStore((state) =>
    workspaceId
      ? state.messagesByWorkspace[workspaceId] || EMPTY_MESSAGES
      : EMPTY_MESSAGES
  );
};