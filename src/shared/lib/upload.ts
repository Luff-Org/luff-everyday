export interface UploadedImage {
  url: string;
  publicId: string;
}

/** Folders registered in `src/app/api/upload/route.ts` — add new ones there first. */
export type UploadFolder = "avatars" | "todos";

/** Typed client for the generic image-upload API. Shared across features. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json() as Promise<UploadedImage>;
}
