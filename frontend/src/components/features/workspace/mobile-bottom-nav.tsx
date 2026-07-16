"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CheckSquare, FileText, Settings } from "lucide-react";

interface MobileBottomNavProps {
  workspaceId: string;
}

export function MobileBottomNav({ workspaceId }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      icon: MessageSquare,
      label: "Chat",
      href: `/workspace/${workspaceId}`,
      active: pathname === `/workspace/${workspaceId}`,
    },
    {
      icon: CheckSquare,
      label: "Tasks",
      href: `/workspace/${workspaceId}/tasks`,
      active: pathname === `/workspace/${workspaceId}/tasks`,
    },
    {
      icon: FileText,
      label: "Docs",
      href: `/workspace/${workspaceId}/documents`,
      active: pathname.startsWith(`/workspace/${workspaceId}/documents`),
    },
    {
      icon: Settings,
      label: "Settings",
      href: `/workspace/${workspaceId}/settings`,
      active: pathname === `/workspace/${workspaceId}/settings`,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c0b] border-t border-white/[0.06] flex items-center justify-around px-2 py-1.5">
      {navItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
            item.active
              ? "text-emerald-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}