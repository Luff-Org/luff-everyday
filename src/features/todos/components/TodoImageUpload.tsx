"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/shared/lib/upload";
import { MAX_TODO_IMAGES, MAX_TODO_IMAGE_BYTES } from "@/features/todos/lib/constants";
import type { TodoImageInput } from "@/features/todos/types";
import { ImagePreviewModal } from "./ImagePreviewModal";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-sub-text/70";
const MAX_MB = MAX_TODO_IMAGE_BYTES / (1024 * 1024);

/**
 * Add/remove control for a todo's attached photos — used in both the quick-add
 * bar (create) and the task detail drawer (edit). Enforces `MAX_TODO_IMAGES`
 * count and `MAX_TODO_IMAGE_BYTES` size client-side; `/api/upload` re-checks
 * both server-side.
 */
export function TodoImageUpload({
  images,
  onChange,
}: {
  images: TodoImageInput[];
  onChange: (images: TodoImageInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const remaining = MAX_TODO_IMAGES - images.length;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length) return;

    const files = picked.slice(0, remaining);
    if (picked.length > files.length) {
      toast.error(`Only ${MAX_TODO_IMAGES} images allowed per task.`);
    }

    const oversized = files.find((f) => f.size > MAX_TODO_IMAGE_BYTES);
    if (oversized) {
      toast.error(`"${oversized.name}" is over ${MAX_MB}MB — pick a smaller image.`);
      return;
    }
    if (!files.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadImage(f, "todos")));
      onChange([...images, ...uploaded.map((u) => ({ url: u.url, publicId: u.publicId }))]);
    } catch {
      toast.error("Upload failed. Try a different image.");
    } finally {
      setUploading(false);
    }
  }

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={labelClass}>Images</span>
        <span className="text-[10px] font-bold text-sub-text/60">
          {images.length}/{MAX_TODO_IMAGES} · max {MAX_MB}MB each
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div
            key={img.publicId}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-sub-text/35"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              onClick={() => setPreviewUrl(img.url)}
              className="h-full w-full cursor-zoom-in object-cover transition-opacity hover:opacity-90"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove image"
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-background bg-error text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < MAX_TODO_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Add image"
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-sub-text/45 text-sub-text/70 transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-bold">{remaining} left</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}
