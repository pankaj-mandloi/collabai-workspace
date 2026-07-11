"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useMessageStore } from "@/store/message.store";
import { WorkspaceSidebar } from "@/components/features/workspace/workspace-sidebar";
import { ChatArea } from "@/components/features/chat/chat-area";
import { MembersSidebar } from "@/components/features/workspace/members-sidebar";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const { socket, isConnected, joinWorkspace, leaveWorkspace } = useSocket();
  const { fetchWorkspaceById, currentWorkspace, isLoading } =
    useWorkspaceStore();
  const {
    setActiveWorkspace,
    addMessage,
    updateMessage,
    removeMessage,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
  } = useMessageStore();

  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch workspace details
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceById(workspaceId);
      setActiveWorkspace(workspaceId);
    }

    return () => {
      setActiveWorkspace(null);
    };
  }, [workspaceId]);

  // Join workspace room via socket
  useEffect(() => {
    if (!isConnected || !workspaceId) return;

    const join = async () => {
      try {
        const onlineUsers = await joinWorkspace(workspaceId);
        setOnlineUsers(workspaceId, onlineUsers);
        setJoinError(null);
      } catch (error: any) {
        console.error("❌ Failed to join workspace:", error.message);
        setJoinError(error.message);
      }
    };

    join();

    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [isConnected, workspaceId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (message: any) => {
      console.log("📨 New message:", message);
      addMessage(message);
    };

    const handleMessageUpdate = (message: any) => {
      updateMessage(message);
    };

    const handleMessageDelete = ({
      messageId,
      workspaceId,
    }: {
      messageId: string;
      workspaceId: string;
    }) => {
      removeMessage(messageId, workspaceId);
    };

    const handleUserTyping = (typingUser: any) => {
      addTypingUser(typingUser);
    };

    const handleUserStoppedTyping = ({
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    }) => {
      removeTypingUser(userId, workspaceId);
    };

    const handleUserOnline = ({
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    }) => {
      addOnlineUser(workspaceId, userId);
    };

    const handleUserOffline = ({
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    }) => {
      removeOnlineUser(workspaceId, userId);
    };

    socket.on("message:receive", handleMessageReceive);
    socket.on("message:update", handleMessageUpdate);
    socket.on("message:delete", handleMessageDelete);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:stopped-typing", handleUserStoppedTyping);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("message:receive", handleMessageReceive);
      socket.off("message:update", handleMessageUpdate);
      socket.off("message:delete", handleMessageDelete);
      socket.off("user:typing", handleUserTyping);
      socket.off("user:stopped-typing", handleUserStoppedTyping);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [socket]);

  // Loading state
  if (isLoading || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Loader2 className="w-7 h-7 text-black animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-sm">
              Loading workspace...
            </p>
            <p className="text-slate-500 text-xs mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Join error state
  if (joinError) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center relative overflow-hidden px-4">
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-md w-full">
          <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Access Denied
                </h3>
                <p className="text-slate-400 text-sm">{joinError}</p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors group mt-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[64px] flex bg-[#070908]">
      {/* Left Sidebar - Channels/Navigation */}
      <WorkspaceSidebar workspace={currentWorkspace} />

      {/* Main Chat Area */}
      <ChatArea workspace={currentWorkspace} />

      {/* Right Sidebar - Members */}
      <MembersSidebar workspace={currentWorkspace} />
    </div>
  );
}