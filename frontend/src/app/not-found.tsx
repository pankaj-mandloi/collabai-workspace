import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070908] text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-900/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] bg-lime-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f1c_1px,transparent_1px),linear-gradient(to_bottom,#1a1f1c_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-40" />

      {/* Content */}
      <div className="relative text-center max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            CollabAI
          </span>
        </Link>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-[120px] md:text-[150px] font-bold leading-none bg-gradient-to-b from-emerald-400 via-lime-400 to-emerald-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Page not found
        </h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-10 px-6 rounded-md shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-emerald-500/30 text-white font-medium h-10 px-6 rounded-md transition-all text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}