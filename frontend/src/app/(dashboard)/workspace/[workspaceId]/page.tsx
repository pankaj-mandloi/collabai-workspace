"use client";

import { useWorkspaceStore } from "@/store/workspace.store";
import { ChatArea } from "@/components/features/chat/chat-area";

export default function WorkspaceDetailPage() {
  const { currentWorkspace } = useWorkspaceStore();

  if (!currentWorkspace) return null;

  return <ChatArea workspace={currentWorkspace} />;
}