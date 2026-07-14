"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useEffect } from "react";
import { StatusPicker } from "@/components/features/user/status-picker";
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Crown,
  Shield,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName =
    user.fullName ||
    user.firstName ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";

  const email = user.primaryEmailAddress?.emailAddress || "";
  const joinedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM d, yyyy")
    : "Unknown";

  const getInitials = () => {
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const getRoleInWorkspace = (workspace: any) => {
    const member = workspace.members?.find(
      (m: any) => m.user.email === email
    );
    return member?.role || "member";
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Crown className="w-3 h-3 text-emerald-400" />;
    if (role === "admin") return <Shield className="w-3 h-3 text-lime-400" />;
    return <Users className="w-3 h-3 text-slate-400" />;
  };

  const getRoleStyle = (role: string) => {
    if (role === "owner")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (role === "admin")
      return "bg-lime-500/10 text-lime-400 border-lime-500/20";
    return "bg-white/5 text-slate-400 border-white/10";
  };

  // Calculate stats
  const totalWorkspaces = workspaces.length;
  const ownerCount = workspaces.filter((ws) => {
    const role = getRoleInWorkspace(ws);
    return role === "owner";
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300 font-medium tracking-wider uppercase">
            Profile
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">
          My Profile
        </h1>
        <p className="text-slate-400 text-lg">
          View your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-white/[0.02] backdrop-blur-sm p-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24 border-4 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
            {user.imageUrl && (
              <AvatarImage src={user.imageUrl} alt={displayName} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black text-3xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {displayName}
            </h2>
            <p className="text-slate-400 text-sm mb-4">{email}</p>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>{totalWorkspaces} workspaces</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Crown className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ownerCount} owned</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-400" />
          Account Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Full Name
            </p>
            <p className="text-white font-medium">{displayName}</p>
          </div>

          {/* Email */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Email
            </p>
            <p className="text-white font-medium">{email}</p>
          </div>

          {/* First Name */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              First Name
            </p>
            <p className="text-white font-medium">
              {user.firstName || "Not set"}
            </p>
          </div>

          {/* Last Name */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Last Name
            </p>
            <p className="text-white font-medium">
              {user.lastName || "Not set"}
            </p>
          </div>

          {/* Username */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Username
            </p>
            <p className="text-white font-medium">
              {user.username || "Not set"}
            </p>
          </div>

          {/* Joined Date */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Account Created
            </p>
            <p className="text-white font-medium">{joinedDate}</p>
          </div>
        </div>
      </div>

      {/* My Workspaces */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          My Workspaces
          <span className="text-xs text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded">
            {totalWorkspaces}
          </span>
        </h3>

        {workspaces.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8 text-center">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              You haven't joined any workspaces yet.
            </p>
            <Link
              href="/dashboard"
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
            >
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {workspaces.map((workspace) => {
              const role = getRoleInWorkspace(workspace);

              return (
                <Link
                  key={workspace._id}
                  href={`/workspace/${workspace._id}`}
                  className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all"
                >
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border-2 border-emerald-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black font-bold text-sm">
                      {workspace.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                      {workspace.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {workspace.members.length} members
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        Created{" "}
                        {format(new Date(workspace.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <Badge
                    variant="outline"
                    className={`text-[10px] gap-1 ${getRoleStyle(role)}`}
                  >
                    {getRoleIcon(role)}
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Platform Features Used */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Features Available
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors">
            <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">Real-time Chat</p>
            <p className="text-[10px] text-slate-500 mt-1">Active</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors">
            <CheckSquare className="w-5 h-5 text-lime-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">Task Boards</p>
            <p className="text-[10px] text-slate-500 mt-1">Active</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors">
            <FileText className="w-5 h-5 text-emerald-300 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">Documents</p>
            <p className="text-[10px] text-slate-500 mt-1">Active</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors">
            <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">AI Agent</p>
            <p className="text-[10px] text-slate-500 mt-1">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}