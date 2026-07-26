import { z } from "zod";
import { route, requireUser, HttpError } from "@/shared/lib/http";
import { uploadImage, type UploadedImage } from "@/shared/lib/cloudinary";

/** Every feature that uploads images registers its bucket here — keeps Cloudinary
 * folders predictable and stops callers from writing to arbitrary paths. */
const folderSchema = z.enum(["avatars", "todos"]);

/** Per-folder size cap — todo attachments are capped tighter than the profile avatar. */
const MAX_BYTES: Record<z.infer<typeof folderSchema>, number> = {
  avatars: 5 * 1024 * 1024,
  todos: 2 * 1024 * 1024,
};
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export const POST = route(async (req): Promise<UploadedImage> => {
  const userId = await requireUser();

  const form = await req.formData();
  const folder = folderSchema.parse(form.get("folder"));
  const file = form.get("file");

  if (!(file instanceof File)) throw new HttpError(400, "Missing file");
  if (!ALLOWED_TYPES.has(file.type)) throw new HttpError(400, "Unsupported image type");
  const maxBytes = MAX_BYTES[folder];
  if (file.size > maxBytes) {
    throw new HttpError(400, `Image must be under ${maxBytes / (1024 * 1024)}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadImage(buffer, `loop-everyday/${folder}/${userId}`);
});
