"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Users,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { WorkspaceCard } from "@/components/features/workspace/workspace-card";
import { CreateWorkspaceDialog } from "@/components/features/workspace/create-workspace-dialog";
import { PendingInvitations } from "@/components/features/workspace/pending-invitations";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    clearError,
  } = useWorkspaceStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Calculate total members across all workspaces
  const totalMembers = workspaces.reduce(
    (acc, w) => acc + w.members.length,
    0
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium tracking-wider uppercase">
              Dashboard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">
              {user?.firstName || user?.username || "there"}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Here's what's happening across your teams today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Workspaces"
            value={workspaces.length}
            icon={<Users className="w-4 h-4" />}
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            iconColor="text-emerald-400"
            description={
              workspaces.length === 0
                ? "Get started by creating one"
                : `Your active workspace${workspaces.length > 1 ? "s" : ""}`
            }
          />
          <StatCard
            title="Members"
            value={totalMembers}
            icon={<Users className="w-4 h-4" />}
            iconBg="bg-lime-500/10 border-lime-500/20"
            iconColor="text-lime-400"
            description="Across your teams"
          />
          <StatCard
            title="Live Chat"
            value="Real-time"
            icon={<MessageSquare className="w-4 h-4" />}
            iconBg="bg-emerald-400/10 border-emerald-400/20"
            iconColor="text-emerald-300"
            description="Message your team instantly"
            showPulse
          />
          <StatCard
            title="Tasks"
            value="Boards"
            icon={<CheckSquare className="w-4 h-4" />}
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            iconColor="text-emerald-400"
            description="Drag & drop task boards"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Pending Invitations */}
        <PendingInvitations />

        {/* Workspaces Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Your Workspaces
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your team spaces for collaboration
              </p>
            </div>

            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/20 gap-2 h-10 px-6"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </Button>
          </div>

          {/* Loading Skeletons */}
          {isLoading && workspaces.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <WorkspaceCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && workspaces.length === 0 && (
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-white/[0.02] backdrop-blur-sm p-12 md:p-16 overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-2">
                  Let's set up your workspace
                </h3>
                <p className="text-slate-400 mb-8 max-w-md">
                  A workspace is where you and your team come together. Chat,
                  plan tasks, and collaborate — all in one place.
                </p>

                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25 gap-2 px-8 h-12 group"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Workspaces Grid */}
          {!isLoading && workspaces.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace._id} workspace={workspace} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
  showPulse?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  description,
  showPulse,
}: StatCardProps) {
  const isNumber = typeof value === "number";

  return (
    <div className="group relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all flex flex-col">
      {/* Icon Row */}
      <div className="flex items-start justify-between mb-4 h-9">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        {showPulse && (
          <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse mt-2" />
        )}
      </div>

      {/* Value */}
      <div className="h-9 flex items-center mb-2">
        <div
          className={`font-semibold text-white tracking-tight leading-none ${
            isNumber ? "text-3xl" : "text-xl"
          }`}
        >
          {value}
        </div>
      </div>

      {/* Title */}
      <div className="text-xs text-slate-400 font-medium mb-1 h-4 flex items-center">
        {title}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-white/[0.05] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-white/[0.05] rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-white/[0.05] rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-white/[0.05] rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-white/[0.05] rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="h-4 w-20 bg-white/[0.05] rounded animate-pulse" />
        <div className="h-6 w-16 bg-white/[0.05] rounded-full animate-pulse" />
      </div>
    </div>
  );
}