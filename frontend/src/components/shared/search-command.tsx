"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWorkspaceMessages } from "@/store/message.store";
import { useWorkspaceTasks } from "@/store/task.store";
import { useWorkspaceDocuments } from "@/store/document.store";
import {
  MessageSquare,
  CheckSquare,
  FileText,
  Search,
  Hash,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();

  // Detect if we're inside a workspace
  const workspaceId = params.workspaceId as string | undefined;
  const isInWorkspace = !!workspaceId;

  // Get workspace data (only if inside workspace)
  const messages = useWorkspaceMessages(workspaceId || null);
  const tasks = useWorkspaceTasks(workspaceId || null);
  const documents = useWorkspaceDocuments(workspaceId || null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  // Filters (only when in workspace)
  const filteredMessages =
    isInWorkspace && query.trim()
      ? messages
          .filter(
            (msg) =>
              !msg.isDeleted &&
              msg.content.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const filteredTasks =
    isInWorkspace && query.trim()
      ? tasks
          .filter(
            (task) =>
              !task.isDeleted &&
              (task.title.toLowerCase().includes(query.toLowerCase()) ||
                task.description
                  ?.toLowerCase()
                  .includes(query.toLowerCase()))
          )
          .slice(0, 5)
      : [];

  const filteredDocuments =
    isInWorkspace && query.trim()
      ? documents
          .filter(
            (doc) =>
              !doc.isDeleted &&
              (doc.title.toLowerCase().includes(query.toLowerCase()) ||
                doc.content
                  ?.toLowerCase()
                  .includes(query.toLowerCase()))
          )
          .slice(0, 5)
      : [];

  const totalResults =
    filteredMessages.length + filteredTasks.length + filteredDocuments.length;
  const hasQuery = query.trim().length > 0;

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-lime-400";
      case "low":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "todo":
        return "○";
      case "in_progress":
        return "◐";
      case "done":
        return "●";
      default:
        return "○";
    }
  };

  // Workspace navigation items
  const workspaceNavItems = workspaceId
    ? [
        {
          icon: MessageSquare,
          label: "Chat",
          description: "Go to workspace chat",
          href: `/workspace/${workspaceId}`,
          color: "text-emerald-400",
        },
        {
          icon: CheckSquare,
          label: "Tasks",
          description: "View task boards",
          href: `/workspace/${workspaceId}/tasks`,
          color: "text-lime-400",
        },
        {
          icon: FileText,
          label: "Documents",
          description: "Browse documents",
          href: `/workspace/${workspaceId}/documents`,
          color: "text-emerald-300",
        },
        {
          icon: Hash,
          label: "Settings",
          description: "Workspace settings",
          href: `/workspace/${workspaceId}/settings`,
          color: "text-slate-400",
        },
      ]
    : [];

  return (
    <>
      {/* Search Trigger Button — Always Visible in Top Nav */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all w-72 group"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        <span className="text-sm text-slate-500 flex-1 text-left">
          {isInWorkspace ? "Search workspace..." : "Search..."}
        </span>
        <kbd className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] text-slate-500 font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Mobile Search Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0c0b] border-white/10 text-white sm:max-w-[550px] p-0 gap-0">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <Input
              ref={inputRef}
              placeholder={
                isInWorkspace
                  ? "Search messages, tasks, documents..."
                  : "Search..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-0 text-white text-sm placeholder:text-slate-500 focus-visible:ring-0 h-8 p-0"
            />
            {hasQuery && isInWorkspace && (
              <span className="text-[10px] text-slate-500 flex-shrink-0">
                {totalResults} results
              </span>
            )}
          </div>

          {/* Results Area */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {/* ============================================ */}
            {/* NOT IN WORKSPACE — Show message              */}
            {/* ============================================ */}
            {!isInWorkspace && (
              <div className="py-8 text-center">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  Open a workspace to search
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Search messages, tasks, and documents inside a workspace
                </p>
                <button
                  onClick={() => navigateTo("/dashboard")}
                  className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Go to Dashboard →
                </button>
              </div>
            )}

            {/* ============================================ */}
            {/* IN WORKSPACE — No Query (Quick Navigation)   */}
            {/* ============================================ */}
            {isInWorkspace && !hasQuery && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 font-semibold">
                  Quick Navigation
                </p>
                {workspaceNavItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </button>
                ))}
              </div>
            )}

            {/* ============================================ */}
            {/* IN WORKSPACE — Has Query (Search Results)    */}
            {/* ============================================ */}

            {/* No Results */}
            {isInWorkspace && hasQuery && totalResults === 0 && (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  No results for "{query}"
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Try different keywords
                </p>
              </div>
            )}

            {/* Messages */}
            {filteredMessages.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 font-semibold">
                  Messages ({filteredMessages.length})
                </p>
                {filteredMessages.map((msg) => {
                  const senderName =
                    msg.sender?.firstName ||
                    msg.sender?.email?.split("@")[0] ||
                    "User";
                  const content =
                    msg.content.length > 100
                      ? msg.content.substring(0, 100) + "..."
                      : msg.content;

                  return (
                    <button
                      key={msg._id}
                      onClick={() =>
                        navigateTo(`/workspace/${workspaceId}`)
                      }
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-400">
                            {senderName}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {format(
                              new Date(msg.createdAt),
                              "MMM d, h:mm a"
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {content}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {(filteredTasks.length > 0 ||
                  filteredDocuments.length > 0) && (
                  <div className="border-b border-white/[0.06] my-1" />
                )}
              </div>
            )}

            {/* Tasks */}
            {filteredTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 font-semibold">
                  Tasks ({filteredTasks.length})
                </p>
                {filteredTasks.map((task) => (
                  <button
                    key={task._id}
                    onClick={() =>
                      navigateTo(`/workspace/${workspaceId}/tasks`)
                    }
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <CheckSquare className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {getStatusEmoji(task.status)}
                        </span>
                        <span className="text-xs font-medium text-white truncate">
                          {task.title}
                        </span>
                        <span
                          className={`text-[10px] font-medium uppercase ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                {filteredDocuments.length > 0 && (
                  <div className="border-b border-white/[0.06] my-1" />
                )}
              </div>
            )}

            {/* Documents */}
            {filteredDocuments.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 font-semibold">
                  Documents ({filteredDocuments.length})
                </p>
                {filteredDocuments.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() =>
                      navigateTo(
                        `/workspace/${workspaceId}/documents/${doc._id}`
                      )
                    }
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <span className="text-lg flex-shrink-0">
                      {doc.icon || "📄"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500">
                          {doc.wordCount || 0} words
                        </span>
                        <span className="text-[10px] text-slate-600">
                          •
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">
                  ↵
                </kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            <span className="text-[10px] text-emerald-500/50">
              CollabAI Search
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}