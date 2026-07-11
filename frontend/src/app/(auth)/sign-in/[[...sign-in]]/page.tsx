import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#070908] text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-900/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-[-10%] w-[450px] h-[450px] bg-lime-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f1c_1px,transparent_1px),linear-gradient(to_bottom,#1a1f1c_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-40" />

      {/* Back to home */}
      <div className="relative z-10 px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & Welcome */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                CollabAI
              </span>
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              <span className="text-white">Welcome</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">
                back
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to continue to your workspaces
            </p>
          </div>

          {/* Clerk Sign In with Dark Theme */}
          <div className="flex justify-center">
            <SignIn
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: "#10b981",
                },
                elements: {
                  formButtonPrimary:
                    "bg-emerald-500 hover:bg-emerald-600 text-white",
                  footerActionLink:
                    "text-emerald-400 hover:text-emerald-300",
                },
              } as any}
            />
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}