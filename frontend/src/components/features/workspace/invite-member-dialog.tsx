"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Loader2, UserPlus, Mail, Shield, Users, X } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) {
  const { inviteMember } = useWorkspaceStore();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email");
      return;
    }

    setIsInviting(true);
    setError("");

    try {
      await inviteMember(workspaceId, {
        email: email.trim().toLowerCase(),
        role,
      });

      toast.success("Invitation sent!", {
        description: `Invited ${email} as ${role}`,
      });

      setEmail("");
      setRole("member");
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send invitation";
      setError(message);
      toast.error("Failed to invite", { description: message });
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isInviting) {
      setEmail("");
      setRole("member");
      setError("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0c0b] border-white/10 text-white sm:max-w-[480px] p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <UserPlus className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Invite Member
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-1">
                  Send an invitation to join this workspace
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              disabled={isInviting}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 h-10"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value) setRole(value as "member" | "admin");
              }}
              disabled={isInviting}
            >
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white h-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0c0b] border-white/10 text-white">
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-lime-400" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
            <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white font-medium">
                How invitations work
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                The user must have a CollabAI account with this email. They will
                see the invitation on their dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 flex items-center justify-end gap-2">
          <Button
            onClick={() => handleClose(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 min-w-[80px] text-sm"
          >
            Cancel
          </Button>

          <Button
            onClick={handleInvite}
            disabled={isInviting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 min-w-[80px] gap-1.5 text-sm disabled:!opacity-70"
          >
            {isInviting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}