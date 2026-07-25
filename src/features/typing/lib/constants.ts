// Typing-test tuning constants.

/** Number of words generated per batch. */
export const WORD_BATCH_SIZE = 100;

/** Maximum extra characters a user can type beyond a word's length. */
export const MAX_EXTRA_CHARS = 5;

/** Threshold (words remaining) before fetching more words. */
export const WORD_PREFETCH_THRESHOLD = 20;

/** Available test durations (seconds). */
export const DURATION_OPTIONS = [15, 30, 60, 120] as const;

/** Default test duration (seconds). */
export const DEFAULT_DURATION = 30;

/** Typing-area line height in px (used for scroll calculation). */
export const LINE_HEIGHT_PX = 56;
