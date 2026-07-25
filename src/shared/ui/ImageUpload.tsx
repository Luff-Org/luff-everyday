"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, type UploadFolder } from "@/shared/lib/upload";

/**
 * Generic image-upload control: shows the current image (or a fallback), a
 * camera button to pick/replace a file, and a remove button. Uploads go
 * through the shared `/api/upload` route into `folder`'s Cloudinary bucket.
 * Reused for the profile avatar; todo attachments will use it too.
 */
export function ImageUpload({
  value,
  onChange,
  folder,
  fallback,
  shape = "circle",
  className = "h-16 w-16",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  fallback: ReactNode;
  shape?: "circle" | "square";
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadImage(file, folder);
      setImgError(false);
      onChange(uploaded.url);
    } catch {
      toast.error("Upload failed. Try a different image.");
    } finally {
      setUploading(false);
    }
  }

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const showImage = !!value && !imgError;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className={`h-full w-full overflow-hidden bg-primary/10 ${shapeClass}`}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value!}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">{fallback}</div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change image"
        className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center border-2 border-background bg-primary text-white shadow disabled:opacity-50 ${
          shapeClass === "rounded-full" ? "rounded-full" : "rounded-md"
        }`}
      >
        <Camera className="h-3.5 w-3.5" />
      </button>

      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove image"
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-error text-white shadow"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
