"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

  // Get current user's role in this workspace
  const currentMember = workspace.members.find(
    (m) => m.user.email === user?.primaryEmailAddress?.emailAddress,
  );
  const userRole = currentMember?.role;
  const isOwner = userRole === "owner";
  const canManage = userRole === "owner" || userRole === "admin";

  // Handle delete
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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role icon
  const getRoleIcon = () => {
    if (userRole === "owner") return <Crown className="w-3 h-3" />;
    if (userRole === "admin") return <Shield className="w-3 h-3" />;
    return <Users className="w-3 h-3" />;
  };

  // Get role color
  const getRoleColor = () => {
    if (userRole === "owner")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (userRole === "admin")
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  return (
    <Link href={`/workspace/${workspace._id}`}>
      <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 border-2 border-slate-700">
                {workspace.avatar ? (
                  <AvatarImage src={workspace.avatar} alt={workspace.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(workspace.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {workspace.name}
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

            {/* Actions Menu (only for owner/admin) */}
            {canManage && (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-900 border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {workspace.description ? (
            <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
              {workspace.description}
            </p>
          ) : (
            <p className="text-sm text-slate-600 italic min-h-[2.5rem]">
              No description
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Users className="w-4 h-4" />
              <span>
                {workspace.members.length}{" "}
                {workspace.members.length === 1 ? "member" : "members"}
              </span>
            </div>

            {userRole && (
              <Badge
                variant="outline"
                className={`text-xs gap-1 ${getRoleColor()}`}
              >
                {getRoleIcon()}
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
