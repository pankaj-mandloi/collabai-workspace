"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useUser } from "@clerk/nextjs";
import { InviteMemberDialog } from "@/components/features/workspace/invite-member-dialog";
import {
  Settings,
  Save,
  Trash2,
  Loader2,
  Crown,
  Shield,
  Users,
  UserMinus,
  UserPlus,
  AlertCircle,
  Check,
  RotateCcw,
  Mail,
  Clock,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useUser();

  const {
    currentWorkspace,
    updateWorkspace,
    deleteWorkspace,
    removeMember,
    cancelInvitation,
    fetchWorkspaceById,
    isUpdating,
    isDeleting,
  } = useWorkspaceStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const [removeMemberDialog, setRemoveMemberDialog] = useState<{
    open: boolean;
    memberId: string;
    memberName: string;
  }>({ open: false, memberId: "", memberName: "" });

  const [cancelInviteDialog, setCancelInviteDialog] = useState<{
    open: boolean;
    invitationId: string;
    email: string;
  }>({ open: false, invitationId: "", email: "" });

  // Load workspace data
  useEffect(() => {
    if (currentWorkspace) {
      const data = {
        name: currentWorkspace.name,
        description: currentWorkspace.description || "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [currentWorkspace]);

  if (!currentWorkspace) return null;

  // Check roles
  const currentMember = currentWorkspace.members.find(
    (m) => m.user.email === user?.primaryEmailAddress?.emailAddress
  );
  const isOwner = currentMember?.role === "owner";
  const isAdmin = currentMember?.role === "admin";
  const canManage = isOwner || isAdmin;

  const getInitials = (firstName?: string, email?: string) => {
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Crown className="w-3 h-3 text-emerald-400" />;
    if (role === "admin") return <Shield className="w-3 h-3 text-lime-400" />;
    return null;
  };

  const getRoleStyle = (role: string) => {
    if (role === "owner")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (role === "admin")
      return "bg-lime-500/10 text-lime-400 border-lime-500/20";
    return "bg-white/5 text-slate-400 border-white/10";
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const newData = { ...formData, [name]: value };
    const changed =
      newData.name !== originalData.name ||
      newData.description !== originalData.description;
    setHasChanges(changed);
    setIsSaved(false);
  };

  // Reset
  const handleReset = () => {
    setFormData({ ...originalData });
    setHasChanges(false);
    setIsSaved(false);
    toast.success("Changes reverted to original");
  };

  // Validate
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return false;
    }
    if (formData.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters");
      return false;
    }
    return true;
  };

  // Save click
  const handleSaveClick = () => {
    if (!validateForm()) return;
    setSaveDialogOpen(true);
  };

  // Confirm save
  const handleConfirmSave = async () => {
    setSaveDialogOpen(false);

    try {
      await updateWorkspace(workspaceId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      const newData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };
      setFormData(newData);
      setOriginalData(newData);
      setHasChanges(false);
      setIsSaved(true);

      await fetchWorkspaceById(workspaceId);

      toast.success("Workspace updated successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      toast.error("Failed to update", {
        description: error.response?.data?.message,
      });
    }
  };

  // Delete workspace
  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.response?.data?.message,
      });
    }
  };

  // Remove member
  const handleRemoveMember = async () => {
    if (!removeMemberDialog.memberId) return;

    try {
      await removeMember(workspaceId, removeMemberDialog.memberId);
      toast.success("Member removed");
      setRemoveMemberDialog({ open: false, memberId: "", memberName: "" });
      await fetchWorkspaceById(workspaceId);
    } catch (error: any) {
      toast.error("Failed to remove member", {
        description: error.response?.data?.message,
      });
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async () => {
    if (!cancelInviteDialog.invitationId) return;

    try {
      await cancelInvitation(workspaceId, cancelInviteDialog.invitationId);
      toast.success("Invitation cancelled", {
        description: `Removed invitation for ${cancelInviteDialog.email}`,
      });
      setCancelInviteDialog({ open: false, invitationId: "", email: "" });
      await fetchWorkspaceById(workspaceId);
    } catch (error: any) {
      toast.error("Failed to cancel invitation", {
        description: error.response?.data?.message,
      });
    }
  };

  // Pending invitations
  const pendingInvitations =
    currentWorkspace.invitations?.filter(
      (inv: any) => inv.status === "pending"
    ) || [];

  return (
    <div className="flex-1 flex flex-col bg-[#070908] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 py-3.5 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-base">
                Workspace Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mr-2">
                <Check className="w-3.5 h-3.5" />
                Saved
              </div>
            )}

            {hasChanges && canManage && (
              <>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="bg-transparent border-white/10 text-slate-300 hover:bg-white/[0.05] hover:text-white h-9 px-4 gap-1.5 text-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>

                <Button
                  onClick={handleSaveClick}
                  disabled={isUpdating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 gap-1.5 text-sm"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* General Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-white">General</h2>
              {!canManage && (
                <span className="text-xs text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded">
                  View only
                </span>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">
                Workspace Name
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Marketing Team"
                disabled={!canManage}
                maxLength={50}
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 h-10"
              />
              <div className="flex items-center justify-between">
                {formData.name !== originalData.name && (
                  <p className="text-[10px] text-yellow-400">
                    Changed from: "{originalData.name}"
                  </p>
                )}
                <p className="text-[10px] text-slate-600 ml-auto">
                  {formData.name.length}/50
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">
                Description
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description..."
                disabled={!canManage}
                maxLength={500}
                rows={3}
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                {formData.description !== originalData.description && (
                  <p className="text-[10px] text-yellow-400">
                    Description changed
                  </p>
                )}
                <p className="text-[10px] text-slate-600 ml-auto">
                  {formData.description.length}/500
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 space-y-2">
              <p className="text-xs text-slate-400">
                <span className="text-slate-600">Created:</span>{" "}
                {format(new Date(currentWorkspace.createdAt), "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-slate-600">Members:</span>{" "}
                {currentWorkspace.members.length}
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-slate-600">Slug:</span>{" "}
                {currentWorkspace.slug}
              </p>
            </div>
          </section>

          {/* Members Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <span className="text-xs text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded">
                  {currentWorkspace.members.length}
                </span>
              </div>

              {canManage && (
                <Button
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 gap-1.5 text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {currentWorkspace.members.map((member, idx) => {
                const displayName =
                  member.user.firstName ||
                  member.user.email?.split("@")[0] ||
                  "Unknown";

                const isMemberOwner = member.role === "owner";
                const canRemove = isOwner && !isMemberOwner;

                return (
                  <div
                    key={member.user._id || `member-${idx}`}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 hover:bg-white/[0.05] transition-colors"
                  >
                    <Avatar className="w-10 h-10 border-2 border-emerald-500/20">
                      {member.user.avatar && (
                        <AvatarImage
                          src={member.user.avatar}
                          alt={displayName}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-sm font-bold">
                        {getInitials(member.user.firstName, member.user.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {displayName}
                        </p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {member.user.email}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] ${getRoleStyle(member.role)}`}
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>

                    {canRemove && (
                      <button
                        onClick={() =>
                          setRemoveMemberDialog({
                            open: true,
                            memberId: member.user._id,
                            memberName: displayName,
                          })
                        }
                        className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Pending Invitations Section */}
          {pendingInvitations.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">
                  Pending Invitations
                </h2>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
                  {pendingInvitations.length}
                </span>
              </div>

              <div className="space-y-2">
                {pendingInvitations.map((inv: any, idx: number) => (
                  <div
                    key={inv._id || `inv-${idx}`}
                    className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-yellow-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {inv.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Invited as{" "}
                        <span className="text-yellow-400">{inv.role}</span>
                        {inv.invitedAt && (
                          <span className="text-slate-600">
                            {" "}
                            • {format(new Date(inv.invitedAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    >
                      Pending
                    </Badge>

                    {/* Cancel Invitation Button */}
                    {canManage && (
                      <button
                        onClick={() =>
                          setCancelInviteDialog({
                            open: true,
                            invitationId: inv._id,
                            email: inv.email,
                          })
                        }
                        className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Cancel invitation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-red-400">
                Danger Zone
              </h2>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">
                      Delete Workspace
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">
                      Permanently delete this workspace and all its data. This
                      action cannot be undone.
                    </p>
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 gap-1.5 text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Workspace
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="h-8" />
        </div>
      </div>

      {/* ============================================ */}
      {/* ALL DIALOGS                                  */}
      {/* ============================================ */}

      {/* Save Confirmation Dialog */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Save className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Save Changes?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1 space-y-2">
                  <span className="block">
                    Are you sure you want to save these changes?
                  </span>
                  {formData.name !== originalData.name && (
                    <span className="block text-xs">
                      Name:{" "}
                      <span className="text-red-400 line-through">
                        {originalData.name}
                      </span>{" "}
                      →{" "}
                      <span className="text-emerald-400">{formData.name}</span>
                    </span>
                  )}
                  {formData.description !== originalData.description && (
                    <span className="block text-xs text-yellow-400">
                      Description will be updated
                    </span>
                  )}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel
              disabled={isUpdating}
              className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0"
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-10 px-6 min-w-[100px] disabled:opacity-70"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving
                </>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workspace Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Delete Workspace?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">
                    "{currentWorkspace.name}"
                  </span>
                  ? All data will be permanently deleted.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0"
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px] disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting
                </>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={removeMemberDialog.open}
        onOpenChange={(open) =>
          setRemoveMemberDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <UserMinus className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Remove Member?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  Remove{" "}
                  <span className="text-white font-medium">
                    "{removeMemberDialog.memberName}"
                  </span>{" "}
                  from this workspace?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0">
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px]"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog
        open={cancelInviteDialog.open}
        onOpenChange={(open) =>
          setCancelInviteDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Cancel Invitation?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  Cancel the invitation for{" "}
                  <span className="text-white font-medium">
                    "{cancelInviteDialog.email}"
                  </span>
                  ? They will no longer be able to join this workspace.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0">
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px]"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}