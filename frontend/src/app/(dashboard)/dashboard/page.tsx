"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Plus, Users, MessageSquare, CheckSquare, FileText } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
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
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">
              Workspaces
            </CardTitle>
            <Users className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">No workspaces yet</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">
              Messages
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">No messages yet</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">
              Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">No tasks yet</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">
              Documents
            </CardTitle>
            <FileText className="w-4 h-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">No documents yet</p>
          </CardContent>
        </Card>
      </div>

      {/* User Info Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-slate-700"
              />
            )}
            <div>
              <p className="text-lg font-semibold text-white">
                {user?.fullName || user?.username}
              </p>
              <p className="text-sm text-slate-400">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspaces Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Workspaces</h2>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2">
            <Plus className="w-4 h-4" />
            Create Workspace
          </Button>
        </div>

        {/* Empty State */}
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No workspaces yet
            </h3>
            <p className="text-slate-400 mb-6 text-center max-w-md">
              Create your first workspace to start collaborating with your team
              in real-time.
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}