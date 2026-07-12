"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentEditor } from "@/components/features/documents/document-editor";
import { useDocumentStore } from "@/store/document.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Star, Check, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  const workspaceId = params.workspaceId as string;

  const {
    fetchDocumentById,
    updateDocument,
    toggleStar,
    activeDocument,
    isLoading,
    isSaving,
  } = useDocumentStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("📄");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDocumentById(documentId);
  }, [documentId]);

  useEffect(() => {
    if (activeDocument) {
      setTitle(activeDocument.title);
      setContent(activeDocument.content);
      setIcon(activeDocument.icon || "📄");
      setLastSaved(new Date(activeDocument.lastSavedAt));
    }
  }, [activeDocument]);

  const autoSave = useCallback(
    async (updates: { title?: string; content?: string; icon?: string }) => {
      try {
        await updateDocument(documentId, updates);
        setLastSaved(new Date());
        setHasChanges(false);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    },
    [documentId, updateDocument]
  );

  const debouncedSave = useCallback(
    (updates: any) => {
      setHasChanges(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => autoSave(updates), 2000);
    },
    [autoSave]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave({ content: newContent });
  };

  const handleToggleStar = async () => {
    try {
      await toggleStar(documentId);
      toast.success("Star toggled");
    } catch (error) {
      toast.error("Failed to toggle star");
    }
  };

  if (isLoading || !activeDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#070908]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading document...</p>
        </div>
      </div>
    );
  }

  const isStarred = activeDocument.starredBy?.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-[#070908] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#070908]/95 backdrop-blur-xl px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/workspace/${workspaceId}/documents`)
            }
            className="text-slate-400 hover:text-white hover:bg-white/[0.05] gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="w-px h-6 bg-white/10" />

          <span className="text-2xl">{icon}</span>

          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Document"
            className="bg-transparent border-0 text-white text-lg font-semibold focus-visible:ring-0 h-auto p-0 flex-1"
            maxLength={200}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span>Unsaved</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Saved {format(lastSaved, "h:mm a")}</span>
              </>
            ) : null}
          </div>

          <button
            onClick={handleToggleStar}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              isStarred
                ? "text-yellow-400 bg-yellow-500/10"
                : "text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10"
            }`}
          >
            <Star
              className="w-4 h-4"
              fill={isStarred ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor
          content={content}
          onChange={handleContentChange}
          editable={true}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl px-6 py-2 text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>{activeDocument.wordCount || 0} words</span>
          <span>•</span>
          <span>
            Created{" "}
            {format(new Date(activeDocument.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          <span>Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
}