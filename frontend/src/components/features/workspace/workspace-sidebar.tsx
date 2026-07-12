"use client";

import { Workspace } from "@/types/workspace.types";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  MessageSquare,
  CheckSquare,
  FileText,
  Settings,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceSidebarProps {
  workspace: Workspace;
}

export function WorkspaceSidebar({ workspace }: WorkspaceSidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const workspaceId = params.workspaceId as string;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    {
      icon: MessageSquare,
      label: "Chat",
      href: `/workspace/${workspaceId}`,
      active: pathname === `/workspace/${workspaceId}`,
      aiBadge: true,
    },
    {
      icon: CheckSquare,
      label: "Tasks",
      href: `/workspace/${workspaceId}/tasks`,
      active: pathname === `/workspace/${workspaceId}/tasks`,
    },
    {
      icon: FileText,
      label: "Documents",
      href: `/workspace/${workspaceId}/documents`,
      active: pathname.startsWith(`/workspace/${workspaceId}/documents`),
    },
  ];

  const isSettingsActive = pathname === `/workspace/${workspaceId}/settings`;

  return (
    <aside className="w-64 bg-[#0a0c0b] border-r border-white/[0.06] flex flex-col relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/[0.03] blur-2xl pointer-events-none" />

      {/* Back Link */}
      <div className="relative px-4 py-3 border-b border-white/[0.06]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 text-xs transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      {/* Workspace Header */}
      <div className="relative p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-emerald-500/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-lime-400 text-black font-bold text-sm">
              {getInitials(workspace.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">
              {workspace.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {workspace.members.length}{" "}
              {workspace.members.length === 1 ? "member" : "members"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 py-2">
          Channels
        </div>

        {navItems.map((item, idx) => {
          const baseClass =
            "group w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all";

          const activeClass = item.active
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent";

          return (
            <Link
              key={idx}
              href={item.href}
              className={`${baseClass} ${activeClass}`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  item.active
                    ? "text-emerald-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>

              {item.aiBadge && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider pointer-events-none select-none cursor-default">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              )}

              {item.active && !item.aiBadge && (
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings Button — Now Links to Settings Page */}
      <div className="relative p-3 border-t border-white/[0.06]">
        <Link
          href={`/workspace/${workspaceId}/settings`}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
            isSettingsActive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-slate-500 hover:bg-white/[0.03] hover:text-white border border-transparent"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Workspace Settings
        </Link>
      </div>
    </aside>
  );
}