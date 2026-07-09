"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Loader2, Sparkles, Users } from "lucide-react";
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

      // Reset form and close
      setFormData({ name: "", description: "" });
      setErrors({ name: "", description: "" });
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create workspace";
      toast.error("Error", {
        description: message,
      });
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle dialog close (reset form)
  const handleClose = (open: boolean) => {
    if (!open && !isCreating) {
      setFormData({ name: "", description: "" });
      setErrors({ name: "", description: "" });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Create New Workspace
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up a new workspace for your team to collaborate in real-time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Workspace Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Marketing Team"
              value={formData.name}
              onChange={handleChange}
              disabled={isCreating}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              autoFocus
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name}</p>
            )}
            <p className="text-slate-500 text-xs">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description{" "}
              <span className="text-slate-500 text-xs">(optional)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of your workspace..."
              value={formData.description}
              onChange={handleChange}
              disabled={isCreating}
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description}</p>
            )}
            <p className="text-slate-500 text-xs">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-300 font-medium">
                You'll be the owner
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                You can invite team members after creation
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isCreating}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}