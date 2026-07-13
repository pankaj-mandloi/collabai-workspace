"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onUpload: (url: string, name: string, type: string, size: number) => void;
  disabled?: boolean;
}

export function FileUploadButton({
  onUpload,
  disabled,
}: FileUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Allowed file types
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Allowed: PNG, JPG, GIF, WebP, PDF",
      });
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB",
      });
      return;
    }

    // Show preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload to Cloudinary
    await uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      toast.error("Upload not configured", {
        description: "Cloudinary credentials missing",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "collabai");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Determine file type
      const fileType = file.type.startsWith("image/") ? "image" : "file";

      // Call parent with upload info
      onUpload(data.secure_url, file.name, fileType, file.size);

      toast.success("File uploaded!", {
        description: file.name,
      });

      // Clear preview
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file", {
        description: error.message,
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="w-[42px] h-[42px] rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Upload image or file"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        ) : (
          <ImagePlus className="w-5 h-5" />
        )}
      </button>

      {/* Image Preview (floating above) */}
      {preview && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#0a0c0b] border border-white/10 rounded-lg shadow-2xl">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-[200px] max-h-[150px] rounded object-cover"
            />
            <button
              onClick={cancelPreview}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}