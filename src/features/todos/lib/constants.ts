// Todo attachment tuning constants.

/** Max number of images attachable to a single todo. */
export const MAX_TODO_IMAGES = 3;

/** Max size per todo image, in bytes — mirrors the server-side cap in `/api/upload`. */
export const MAX_TODO_IMAGE_BYTES = 2 * 1024 * 1024;
