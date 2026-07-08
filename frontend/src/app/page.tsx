"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";

export default function Home() {
  const { isConnected, socketId } = useSocket();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-950 text-white p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          CollabAI 🚀
        </h1>
        <p className="text-slate-400 text-xl">
          Real-Time AI Collaboration Workspace
        </p>
      </div>

      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Socket.io Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="font-mono text-sm text-slate-300">
              {isConnected ? `Connected: ${socketId}` : "Disconnected"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => alert("Setup Complete! 🎉")}
        size="lg"
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        Test Setup
      </Button>

      <p className="text-slate-600 text-sm mt-8">
        Next.js 16 • TypeScript • Tailwind • ShadCN • Socket.io • Zustand
      </p>
    </div>
  );
}