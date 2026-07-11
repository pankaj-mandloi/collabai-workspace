"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/providers/socket-provider";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  CheckSquare,
  FileText,
  Bot,
  Users,
  Zap,
  Rocket,
} from "lucide-react";

export default function Home() {
  const { isConnected } = useSocket();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-[#070908] text-white relative overflow-hidden">
      {/* Ambient background glow — forest green depth */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-900/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-[-10%] w-[450px] h-[450px] bg-lime-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f1c_1px,transparent_1px),linear-gradient(to_bottom,#1a1f1c_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-40" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] px-6 py-4 backdrop-blur-xl bg-[#070908]/70">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center text-sm text-black font-bold shadow-lg shadow-emerald-500/20">
              C
            </div>
            <span className="text-slate-100">CollabAI</span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoaded && !isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/20 transition-all">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}

            {isLoaded && isSignedIn && (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/5"
                  >
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
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-lime-400 animate-pulse" : "bg-red-400"
            }`}
          />
          <span className="text-sm text-slate-400 font-medium">
            {isConnected ? "Real-time Connected" : "Connecting..."}
          </span>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-xs text-emerald-400">Powered by AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.05]">
          <span className="text-white">Team Collaboration</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Chat, manage tasks, edit documents together, and get intelligent
          help from an AI that understands your entire workspace.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoaded && !isSignedIn && (
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/25 gap-2 px-8 h-12 transition-all group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </SignUpButton>
          )}

          {isLoaded && isSignedIn && (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/25 gap-2 px-8 h-12 transition-all group"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.06]">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium tracking-wider">
              FEATURES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Everything your team needs
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            One platform for chat, tasks, documents, and AI collaboration.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large AI Card */}
          <div className="md:col-span-2 group relative rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-white/[0.02] to-white/[0.02] backdrop-blur-sm p-8 hover:border-emerald-500/30 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">
                AI Agent that knows your workspace
              </h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Ask questions about your chats, documents, and tasks. The AI
                understands your workspace context and provides intelligent
                answers powered by Gemini.
              </p>

              <div className="rounded-lg bg-black/40 border border-white/[0.06] p-4 font-mono text-sm">
                <div className="text-slate-500 mb-2">// Ask anything</div>
                <div className="text-emerald-400">
                  @ai what tasks are pending this week?
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Chat */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Real-time Chat
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Instant messaging with typing indicators and online presence.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              Live updates
            </div>
          </div>

          {/* Task Management */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 hover:bg-white/[0.05] hover:border-lime-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center mb-6">
              <CheckSquare className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Task Boards
            </h3>
            <p className="text-slate-400 text-sm">
              Kanban boards with drag-drop, priorities, and checklists.
            </p>
          </div>

          {/* Documents */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Documents
            </h3>
            <p className="text-slate-400 text-sm">
              Collaborative editing with real-time synchronization.
            </p>
          </div>

          {/* Team Workspaces */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Team Workspaces
            </h3>
            <p className="text-slate-400 text-sm">
              Organize teams with roles and workspace-based isolation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
            <Rocket className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium tracking-wider">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Get started in 3 steps
          </h2>
          <p className="text-slate-400 text-lg">
            Setup your team workspace in under a minute
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                1
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Sign Up
            </h3>
            <p className="text-slate-400 text-sm">
              Create your account in seconds with secure authentication.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-lg">
                2
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-lime-500/30 to-transparent" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Create Workspace
            </h3>
            <p className="text-slate-400 text-sm">
              Set up your team workspace and invite members to collaborate.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300 font-bold text-lg">
                3
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-400/30 to-transparent" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start Collaborating
            </h3>
            <p className="text-slate-400 text-sm">
              Chat, manage tasks, edit documents, and let AI help you work
              smarter.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium tracking-wider">
              MODERN STACK
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Built with modern technologies
          </h2>
          <p className="text-slate-400">
            Production-grade stack for reliability and performance
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            "Next.js 16",
            "TypeScript",
            "MongoDB",
            "Socket.io",
            "Clerk Auth",
            "Gemini AI",
            "Tailwind",
            "Zustand",
          ].map((tech) => (
            <div
              key={tech}
              className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-3 text-center hover:border-emerald-500/30 transition-all"
            >
              <span className="text-sm font-medium text-slate-300">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-4xl mx-auto px-6 py-24">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-white/[0.02] to-lime-950/20 backdrop-blur-sm p-12 md:p-16 overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Ready to get started?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Create your workspace and start collaborating with your team in
              real-time.
            </p>

            <div className="flex justify-center">
              {isLoaded && !isSignedIn && (
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/25 gap-2 px-8 h-12 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </SignUpButton>
              )}

              {isLoaded && isSignedIn && (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/25 gap-2 px-8 h-12 group"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center text-xs text-black font-bold">
              C
            </div>
            <span className="text-sm font-semibold text-white">CollabAI</span>
          </div>
          <div className="text-xs text-slate-500">
            Real-time team collaboration platform
          </div>
        </div>
      </footer>
    </div>
  );
}