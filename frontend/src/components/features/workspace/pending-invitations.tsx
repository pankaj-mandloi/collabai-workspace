"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { workspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Mail, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function PendingInvitations() {
  const { user } = useUser();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [pendingWorkspaces, setPendingWorkspaces] = useState<any[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Find workspaces where current user has pending invitations
  useEffect(() => {
    if (!user || !workspaces) return;

    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!userEmail) return;

    const pending: any[] = [];
    workspaces.forEach((ws) => {
      const invitation = ws.invitations?.find(
        (inv: any) =>
          inv.email === userEmail && inv.status === "pending"
      );
      if (invitation) {
        pending.push({
          workspace: ws,
          invitation,
        });
      }
    });

    setPendingWorkspaces(pending);
  }, [user, workspaces]);

  const handleAccept = async (workspaceId: string, invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      await workspaceService.acceptInvitation(workspaceId, invitationId);
      toast.success("Invitation accepted! You joined the workspace.");
      await fetchWorkspaces();
    } catch (error: any) {
      toast.error("Failed to accept invitation", {
        description: error.response?.data?.message,
      });
    } finally {
      setAcceptingId(null);
    }
  };

  if (pendingWorkspaces.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">
          Pending Invitations
        </h3>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
          {pendingWorkspaces.length}
        </span>
      </div>

      <div className="space-y-2">
        {pendingWorkspaces.map(({ workspace, invitation }) => {
          const getInitials = (name: string) => {
            return name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
          };

          return (
            <div
              key={invitation._id}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4"
            >
              {/* Workspace Avatar */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                {getInitials(workspace.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {workspace.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Invited as{" "}
                  <span className="text-emerald-400 font-medium">
                    {invitation.role}
                  </span>
                  {workspace.members && (
                    <span className="text-slate-500">
                      {" "}
                      • {workspace.members.length} members
                    </span>
                  )}
                </p>
              </div>

              {/* Accept Button */}
              <Button
                onClick={() =>
                  handleAccept(workspace._id, invitation._id)
                }
                disabled={acceptingId === invitation._id}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 gap-1.5 text-sm disabled:!opacity-70"
              >
                {acceptingId === invitation._id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}