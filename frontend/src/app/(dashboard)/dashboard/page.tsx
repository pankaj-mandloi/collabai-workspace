"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { WorkspaceCard } from "@/components/features/workspace/workspace-card";
import { CreateWorkspaceDialog } from "@/components/features/workspace/create-workspace-dialog";
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

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {user?.firstName || user?.username || "there"}
            </span>
            ! 👋
          </h1>
          <p className="text-slate-400">
            Here's what's happening with your workspaces today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Workspaces"
            value={workspaces.length}
            icon={<Users className="w-4 h-4 text-blue-400" />}
            subtitle={
              workspaces.length === 0
                ? "No workspaces yet"
                : `${workspaces.length} active`
            }
          />
          <StatCard
            title="Messages"
            value={0}
            icon={<MessageSquare className="w-4 h-4 text-purple-400" />}
            subtitle="Coming soon"
          />
          <StatCard
            title="Tasks"
            value={0}
            icon={<CheckSquare className="w-4 h-4 text-green-400" />}
            subtitle="Coming soon"
          />
          <StatCard
            title="Documents"
            value={0}
            icon={<FileText className="w-4 h-4 text-pink-400" />}
            subtitle="Coming soon"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Workspaces Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Workspaces</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage and collaborate with your teams
              </p>
            </div>

            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
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
            <Card className="bg-slate-900 border-slate-800 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No workspaces yet
                </h3>
                <p className="text-slate-400 mb-6 text-center max-w-md">
                  Create your first workspace to start collaborating with your
                  team in real-time.
                </p>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Workspace
                </Button>
              </CardContent>
            </Card>
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
  value: number;
  icon: React.ReactNode;
  subtitle: string;
}

function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-slate-400 font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
            <Skeleton className="h-3 w-1/2 bg-slate-800" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full bg-slate-800" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Skeleton className="h-4 w-20 bg-slate-800" />
          <Skeleton className="h-6 w-16 bg-slate-800" />
        </div>
      </CardContent>
    </Card>
  );
}