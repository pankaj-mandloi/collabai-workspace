import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { SocketProvider } from "@/providers/socket-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CollabAI - Real-time AI Collaboration",
  description:
    "Team collaboration platform with AI agents, real-time chat, and collaborative editing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
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
    >
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">
          <SocketProvider>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              richColors
              closeButton
            />
          </SocketProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}