"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useSocket } from "@/providers/socket-provider"; // ✅ Add this
import { UserStatus } from "@/types/user.types";
import {
  Check,
  ChevronDown,
  Activity,
  Clock,
  BellOff,
  Power,
} from "lucide-react";
import { toast } from "sonner";

interface StatusPickerProps {
  className?: string;
}

const getStatusIcon = (status: UserStatus) => {
  const iconClass = "w-3.5 h-3.5";
  switch (status) {
    case "online":
      return <Activity className={`${iconClass} text-emerald-400`} />;
    case "away":
      return <Clock className={`${iconClass} text-yellow-400`} />;
    case "busy":
      return <BellOff className={`${iconClass} text-red-400`} />;
    case "offline":
      return <Power className={`${iconClass} text-slate-400`} />;
    default:
      return <Activity className={`${iconClass} text-emerald-400`} />;
  }
};

const getStatusLabel = (status: UserStatus) => {
  switch (status) {
    case "online": return "Online";
    case "away": return "Away";
    case "busy": return "Busy";
    case "offline": return "Offline";
    default: return "Online";
  }
};

export function StatusPicker({ className = "" }: StatusPickerProps) {
  const { updateUserStatus, getUserStatus } = useWorkspaceStore();
  const { socket, isConnected } = useSocket(); // ✅ Add this
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<UserStatus>("online");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStatus = async () => {
      const status = await getUserStatus();
      if (status) {
        setCurrentStatus(status);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (status: UserStatus) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Update in database
      await updateUserStatus({ status });
      setCurrentStatus(status);
      
      // ✅ Emit socket event for real-time update
      if (socket && isConnected) {
        socket.emit("user:status", { status });
        console.log(`📤 Status update emitted: ${status}`);
      }
      
      toast.success(`Status updated to ${getStatusLabel(status)}`);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md 
          text-xs font-medium text-slate-300 hover:text-white 
          hover:bg-white/[0.05] transition-all"
        title="Set your status"
      >
        {getStatusIcon(currentStatus)}
        <span className="hidden md:inline">{getStatusLabel(currentStatus)}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-48 
          bg-[#0a0c0b] border border-white/10 rounded-lg shadow-2xl 
          shadow-emerald-500/5 z-50 overflow-hidden">
          <div className="p-1 space-y-0.5">
            <div className="px-3 py-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Set status
            </div>

            <button
              onClick={() => handleStatusChange("online")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md 
                text-sm transition-all ${
                  currentStatus === "online"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="flex-1 text-left">Online</span>
              {currentStatus === "online" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleStatusChange("away")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md 
                text-sm transition-all ${
                  currentStatus === "away"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
            >
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="flex-1 text-left">Away</span>
              {currentStatus === "away" && <Check className="w-3.5 h-3.5 text-yellow-400" />}
            </button>

            <button
              onClick={() => handleStatusChange("busy")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md 
                text-sm transition-all ${
                  currentStatus === "busy"
                    ? "bg-red-500/10 text-red-400"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
            >
              <BellOff className="w-4 h-4 text-red-400" />
              <span className="flex-1 text-left">Busy</span>
              {currentStatus === "busy" && <Check className="w-3.5 h-3.5 text-red-400" />}
            </button>

            <button
              onClick={() => handleStatusChange("offline")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md 
                text-sm transition-all ${
                  currentStatus === "offline"
                    ? "bg-white/5 text-slate-400"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
            >
              <Power className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left">Offline</span>
              {currentStatus === "offline" && <Check className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}