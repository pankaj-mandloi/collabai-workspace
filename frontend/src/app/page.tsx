"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Bot } from "lucide-react";

export default function Home() {
  const { isConnected } = useSocket();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CollabAI 🚀
          </div>

          <div className="flex items-center gap-4">
            {isLoaded && !isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}

            {isLoaded && isSignedIn && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-slate-800">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-sm text-slate-400">
            {isConnected ? "Real-time Connected" : "Connecting..."}
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Team Collaboration
          <br />
          Powered by AI
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Real-time chat, collaborative documents, task management, and AI agents — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoaded && !isSignedIn && (
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
          )}

          {isLoaded && isSignedIn && (
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <Users className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Chat, edit documents, and manage tasks with your team in real-time.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <Bot className="w-10 h-10 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI-Powered Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Smart AI that understands your workspace context and helps automatically.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <Sparkles className="w-10 h-10 text-pink-400 mb-2" />
              <CardTitle className="text-white">All-in-One</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Chat + Docs + Tasks + AI. No more switching between multiple tools.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          Built with Next.js 16 • TypeScript • Tailwind • ShadCN • Socket.io • Clerk
        </div>
      </footer>
    </div>
  );
}