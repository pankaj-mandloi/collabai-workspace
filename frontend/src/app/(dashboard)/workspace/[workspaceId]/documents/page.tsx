"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Star, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useDocumentStore, useWorkspaceDocuments } from "@/store/document.store";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const documents = useWorkspaceDocuments(workspaceId);
  const {
    fetchWorkspaceDocuments,
    createDocument,
    deleteDocument,
    toggleStar,
    isLoading,
    isCreating,
    isDeleting,
  } = useDocumentStore();

  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaceDocuments(workspaceId);
  }, [workspaceId]);

  const handleCreateDocument = async () => {
    try {
      const doc = await createDocument({
        workspaceId,
        title: "Untitled Document",
        content: "",
        icon: "📄",
      });
      toast.success("Document created!");
      router.push(`/workspace/${workspaceId}/documents/${doc._id}`);
    } catch (error: any) {
      toast.error("Failed to create document", {
        description: error.response?.data?.message,
      });
    }
  };

  const handleToggleStar = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      await toggleStar(docId);
    } catch (error) {
      toast.error("Failed to star document");
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;
    try {
      await deleteDocument(deleteDocId, workspaceId);
      toast.success("Document deleted");
      setDeleteDocId(null);
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.response?.data?.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 top-[64px] left-64 right-0 flex flex-col bg-[#070908]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 py-3.5 border-b border-white/[0.06] bg-[#070908]/70 backdrop-blur-xl flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-base">Documents</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {documents.length} {documents.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 gap-1.5 text-sm disabled:opacity-70"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                New Document
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="relative flex-1 overflow-y-auto p-6">
        {isLoading && documents.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
              <p className="text-sm text-slate-500">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No documents yet
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Create your first document to start writing and collaborating.
            </p>
            <Button
              onClick={handleCreateDocument}
              disabled={isCreating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-2">
            {documents.map((doc) => {
              const isStarred = doc.starredBy?.length > 0;
              const editorName =
                doc.lastEditedBy?.firstName ||
                doc.lastEditedBy?.email?.split("@")[0] ||
                "Unknown";

              return (
                <div
                  key={doc._id}
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/documents/${doc._id}`)
                  }
                  className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 rounded-lg p-4 cursor-pointer transition-all flex items-center gap-4"
                >
                  <div className="text-2xl">{doc.icon || "📄"}</div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Edited by {editorName} •{" "}
                      {format(new Date(doc.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      {doc.wordCount > 0 && ` • ${doc.wordCount} words`}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleToggleStar(e, doc._id)}
                    className={`opacity-0 group-hover:opacity-100 w-8 h-8 rounded flex items-center justify-center transition-all ${
                      isStarred
                        ? "text-yellow-400 opacity-100"
                        : "text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                    }`}
                    title={isStarred ? "Unstar" : "Star"}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={isStarred ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDocId(doc._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDocId}
        onOpenChange={() => setDeleteDocId(null)}
      >
        <AlertDialogContent className="bg-[#0a0c0b] border-white/10 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-bold text-white">
                  Delete Document?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-sm mt-1">
                  This document will be permanently deleted. This action cannot
                  be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 flex-row justify-end">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-slate-600 hover:bg-slate-700 text-white border-0 font-medium h-10 px-6 min-w-[100px] mt-0"
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-medium h-10 px-6 min-w-[100px] disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting
                </>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}