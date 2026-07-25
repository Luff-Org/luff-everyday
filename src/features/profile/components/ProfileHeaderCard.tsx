"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/features/profile/api";
import { ImageUpload } from "@/shared/ui/ImageUpload";

export function ProfileHeaderCard({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [nameInput, setNameInput] = useState(name?.trim() || "");
  const [imageInput, setImageInput] = useState<string | null>(image || null);

  const displayName = name?.trim() || "Anonymous";
  const initial = displayName.charAt(0).toUpperCase();
  const showImage = !!image && !imgError;

  async function handleSave() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      toast.error("Name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      const updated = await profileApi.update({
        name: trimmedName,
        image: imageInput,
      });
      await update({ name: updated.name, image: updated.image });
      setEditing(false);
      setImgError(false);
      router.refresh();
      toast.success("Profile updated.");
    } catch {
      toast.error("Couldn't update profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setNameInput(name?.trim() || "");
    setImageInput(image || null);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-sub-text/10 bg-background/40 p-5">
        <div className="flex items-center gap-4">
          <ImageUpload
            value={imageInput}
            onChange={setImageInput}
            folder="avatars"
            className="h-16 w-16"
            fallback={
              <span className="text-2xl font-black text-primary">
                {(nameInput.trim() || "A").charAt(0).toUpperCase()}
              </span>
            }
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={100}
              placeholder="Your name"
              className="w-full rounded-lg border border-sub-text/20 bg-background px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-sub-text transition-all hover:bg-error/10 hover:text-error disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-sub-text/10 bg-background/40 p-5">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image!}
          alt={displayName}
          onError={() => setImgError(true)}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-black tracking-tight text-foreground">
          {displayName}
        </h1>
        {email && <p className="truncate text-sm text-sub-text">{email}</p>}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-sub-text opacity-0 transition-all hover:bg-primary/10 hover:text-foreground group-hover:opacity-100 md:opacity-60"
        aria-label="Edit profile"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    </div>
  );
}
