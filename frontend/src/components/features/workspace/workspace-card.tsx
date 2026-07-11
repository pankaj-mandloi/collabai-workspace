"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Workspace } from "@/types/workspace.types";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  MoreVertical,
  Users,
  Settings,
  Trash2,
  Crown,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useState } from "react";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { user } = useUser();
  const { deleteWorkspace, isDeleting } = useWorkspaceStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentMember = workspace.members.find(
    (m) => m.user.email === user?.primaryEmailAddress?.emailAddress
  );
  const userRole = currentMember?.role;
  const isOwner = userRole === "owner";
  const canManage = userRole === "owner" || userRole === "admin";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Delete "${workspace.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteWorkspace(workspace._id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = () => {
    if (userRole === "owner") return <Crown className="w-3 h-3" />;
    if (userRole === "admin") return <Shield className="w-3 h-3" />;
    return <Users className="w-3 h-3" />;
  };

  const getRoleStyle = () => {
    if (userRole === "owner")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (userRole === "admin")
      return "bg-lime-500/10 text-lime-400 border-lime-500/20";
    return "bg-white/5 text-slate-400 border-white/10";
  };

  return (
    <Link href={`/workspace/${workspace._id}`} className="block group">
      <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all cursor-pointer h-full">
        {/* Hover Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 border-2 border-emerald-500/20">
                {workspace.avatar ? (
                  <AvatarImage src={workspace.avatar} alt={workspace.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black font-bold">
                  {getInitials(workspace.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  {workspace.name}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {canManage && (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#0a0c0b] border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem className="text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Description */}
          <div className="mb-4 min-h-[2.5rem]">
            {workspace.description ? (
              <p className="text-sm text-slate-400 line-clamp-2">
                {workspace.description}
              </p>
            ) : (
              <p className="text-sm text-slate-600 italic">
                No description
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Users className="w-3.5 h-3.5" />
              <span>
                {workspace.members.length}{" "}
                {workspace.members.length === 1 ? "member" : "members"}
              </span>
            </div>

            {userRole && (
              <Badge
                variant="outline"
                className={`text-xs gap-1 ${getRoleStyle()}`}
              >
                {getRoleIcon()}
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}