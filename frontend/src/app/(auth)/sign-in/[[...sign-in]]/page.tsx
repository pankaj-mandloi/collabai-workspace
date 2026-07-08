import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2">Sign in to your CollabAI account</p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-slate-900 border border-slate-800 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                formFieldInput: "bg-slate-800 border-slate-700 text-white",
                formFieldLabel: "text-slate-300",
                formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                dividerLine: "bg-slate-700",
                dividerText: "text-slate-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}