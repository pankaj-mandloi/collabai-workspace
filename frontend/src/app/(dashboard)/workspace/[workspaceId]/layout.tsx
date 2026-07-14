"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useMessageStore } from "@/store/message.store";
import { WorkspaceSidebar } from "@/components/features/workspace/workspace-sidebar";
import { MembersSidebar } from "@/components/features/workspace/members-sidebar";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
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

  // Fetch workspace
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceById(workspaceId);
      setActiveWorkspace(workspaceId);
    }
    return () => {
      setActiveWorkspace(null);
    };
  }, [workspaceId]);

  // Join socket room
  useEffect(() => {
    if (!isConnected || !workspaceId) return;

    const join = async () => {
      try {
        const onlineUsers = await joinWorkspace(workspaceId);
        setOnlineUsers(workspaceId, onlineUsers);
        setJoinError(null);
      } catch (error: any) {
        setJoinError(error.message);
      }
    };

    join();
    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [isConnected, workspaceId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (message: any) => addMessage(message);
    const handleMessageUpdate = (message: any) => updateMessage(message);
    const handleMessageDelete = ({ messageId, workspaceId }: any) =>
      removeMessage(messageId, workspaceId);
    const handleMessageReaction = (message: any) => {
      console.log("Reaction received:", message);
      updateMessage(message);
    };
    const handleUserTyping = (typingUser: any) => addTypingUser(typingUser);
    const handleUserStoppedTyping = ({ userId, workspaceId }: any) =>
      removeTypingUser(userId, workspaceId);
    const handleUserOnline = ({ userId, workspaceId }: any) =>
      addOnlineUser(workspaceId, userId);
    const handleUserOffline = ({ userId, workspaceId }: any) =>
      removeOnlineUser(workspaceId, userId);

    // ✅ NEW: User Status Update Handler
    const handleUserStatus = ({ userId, user }: any) => {
      console.log(`🔄 User status updated: ${user.email} → ${user.status}`);
      
      // Update user status in messages
      // Since messages store doesn't have user status separately,
      // we need to update the sender status in existing messages
      
      // Option 1: Update message store messages
      // We'll update by finding messages from this user and updating sender status
      // For now, we'll just log it. Future messages will have updated status.
    };

    socket.on("message:receive", handleMessageReceive);
    socket.on("message:update", handleMessageUpdate);
    socket.on("message:delete", handleMessageDelete);
    socket.on("message:reaction", handleMessageReaction);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:stopped-typing", handleUserStoppedTyping);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("user:status", handleUserStatus); // ✅ Add this

    return () => {
      socket.off("message:receive", handleMessageReceive);
      socket.off("message:update", handleMessageUpdate);
      socket.off("message:delete", handleMessageDelete);
      socket.off("message:reaction", handleMessageReaction);
      socket.off("user:typing", handleUserTyping);
      socket.off("user:stopped-typing", handleUserStoppedTyping);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("user:status", handleUserStatus); // ✅ Add this
    };
  }, [socket]);

  // Loading
  if (isLoading || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Loader2 className="w-7 h-7 text-black animate-spin" />
          </div>
          <p className="text-white font-medium text-sm">Loading workspace...</p>
          <p className="text-slate-500 text-xs">Please wait</p>
        </div>
      </div>
    );
  }

  // Error
  if (joinError) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/[0.03] border border-red-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">
                Access Denied
              </h3>
              <p className="text-slate-400 text-sm">{joinError}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[64px] flex bg-[#070908]">
      {/* Left Sidebar */}
      <WorkspaceSidebar workspace={currentWorkspace} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">{children}</div>

      {/* Right Sidebar */}
      <MembersSidebar workspace={currentWorkspace} />
    </div>
  );
}