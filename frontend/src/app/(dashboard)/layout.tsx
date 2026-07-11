"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070908] text-white relative">
      {/* Ambient background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-900/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1f1c_1px,transparent_1px),linear-gradient(to_bottom,#1a1f1c_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,#000_50%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center text-sm text-black font-bold shadow-lg shadow-emerald-500/20">
              C
            </div>
            <span className="text-slate-100">CollabAI</span>
          </Link>

          <div className="flex items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-emerald-500/20",
                },
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}