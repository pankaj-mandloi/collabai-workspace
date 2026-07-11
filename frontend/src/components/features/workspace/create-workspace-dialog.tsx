"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Loader2, Sparkles, X, Users } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const { createWorkspace, isCreating } = useWorkspaceStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  // Validate form
  const validate = () => {
    const newErrors = { name: "", description: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Workspace name is required";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
      isValid = false;
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const workspace = await createWorkspace({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      toast.success("Workspace created successfully!", {
        description: `${workspace.name} is ready to use`,
      });

      handleReset();
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create workspace";
      toast.error("Error creating workspace", {
        description: message,
      });
    }
  };

  const handleReset = () => {
    setFormData({ name: "", description: "" });
    setErrors({ name: "", description: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isCreating) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0c0b] border-white/10 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Create New Workspace
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-1">
                  Set up a new workspace for your team to collaborate
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-white text-sm font-medium flex items-center gap-1"
            >
              Workspace Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Marketing Team"
              value={formData.name}
              onChange={handleChange}
              disabled={isCreating}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 h-10"
              autoFocus
              maxLength={50}
            />
            {errors.name && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.name}
              </p>
            )}
            <p className="text-[10px] text-slate-600 text-right">
              {formData.name.length}/50
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-white text-sm font-medium"
            >
              Description{" "}
              <span className="text-[11px] text-slate-500 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of your workspace..."
              value={formData.description}
              onChange={handleChange}
              disabled={isCreating}
              rows={3}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none text-sm"
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className="text-[10px] text-slate-600 text-right">
              {formData.description.length}/500
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">
                You'll be the owner
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                You can invite team members after creation
              </p>
            </div>
          </div>
        </form>

        {/* Footer - Small buttons */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#070908]/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={() => handleClose(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium h-9 px-4 min-w-[80px] text-sm"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium h-9 px-4 min-w-[80px] gap-1.5 text-sm disabled:!opacity-70"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}