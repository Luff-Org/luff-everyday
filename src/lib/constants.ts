// ─────────────────────────────────────────────────────────────────────────────
// Luff-Everyday: Centralized Constants
// All application-wide constants live here. Import from '@/lib/constants'.
// ─────────────────────────────────────────────────────────────────────────────

// ── Typing Test ──────────────────────────────────────────────────────────────

/** Number of words generated per batch */
export const WORD_BATCH_SIZE = 100;

/** Maximum extra characters a user can type beyond a word's length */
export const MAX_EXTRA_CHARS = 5;

/** Threshold (words remaining) before fetching more words */
export const WORD_PREFETCH_THRESHOLD = 20;

/** Available test durations (seconds) */
export const DURATION_OPTIONS = [15, 30, 60, 120] as const;

/** Default test duration (seconds) */
export const DEFAULT_DURATION = 30;

/** Typing area line height in px (used for scroll calculation) */
export const LINE_HEIGHT_PX = 56;

// ── Word Pool ────────────────────────────────────────────────────────────────

export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
] as const;

/** Generates a space-separated string of `count` random words */
export function generateWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]);
  }
  return result.join(" ");
}

// ── Fonts ────────────────────────────────────────────────────────────────────

export interface FontDef {
  id: string;
  name: string;
  fontString: string;
}

export const APP_FONTS: FontDef[] = [
  { id: "app-inter", name: "Inter", fontString: '"Inter", sans-serif' },
  { id: "app-roboto", name: "Roboto", fontString: '"Roboto", sans-serif' },
  { id: "app-poppins", name: "Poppins", fontString: '"Poppins", sans-serif' },
  { id: "app-nunito", name: "Nunito", fontString: '"Nunito", sans-serif' },
  { id: "app-ubuntu", name: "Ubuntu", fontString: '"Ubuntu", sans-serif' },
  { id: "app-playfair", name: "Playfair", fontString: '"Playfair Display", serif' },
  { id: "app-oswald", name: "Oswald", fontString: '"Oswald", sans-serif' },
  { id: "app-roboto-mono", name: "Roboto Mono", fontString: '"Roboto Mono", monospace' },
  { id: "app-comic-neue", name: "Comic Neue", fontString: '"Comic Neue", cursive' },
  { id: "app-pacifico", name: "Pacifico", fontString: '"Pacifico", cursive' },
  { id: "app-bangers", name: "Bangers", fontString: '"Bangers", cursive' },
  { id: "app-press-start", name: "Start", fontString: '"Press Start 2P", cursive' },
  { id: "app-bungee", name: "Bungee", fontString: '"Bungee", cursive' },
  { id: "app-righteous", name: "Righteous", fontString: '"Righteous", cursive' },
  { id: "app-monoton", name: "Monoton", fontString: '"Monoton", cursive' },
  { id: "app-lobster", name: "Lobster", fontString: '"Lobster", cursive' },
  { id: "app-creepster", name: "Creepster", fontString: '"Creepster", cursive' },
  { id: "app-luckiest-guy", name: "Luckiest Guy", fontString: '"Luckiest Guy", cursive' },
  { id: "app-jetbrains", name: "JetBrains", fontString: '"JetBrains Mono", monospace' },
  { id: "app-system", name: "System Default", fontString: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
];

export const DEFAULT_FONT_ID = "app-system";
export const DEFAULT_FONT_STRING = APP_FONTS.find((f) => f.id === DEFAULT_FONT_ID)!.fontString;

// ── Themes ───────────────────────────────────────────────────────────────────

export interface ThemeDef {
  id: string;
  name: string;
  bg: string;
  primary: string;
  sub: string;
  fg: string;
  error: string;
}

export const THEMES: ThemeDef[] = [
  { id: "dark-luff", name: "dark luff", bg: "#0f172a", primary: "#3b82f6", sub: "#475569", fg: "#f8fafc", error: "#f87171" },
  { id: "light-luff", name: "light luff", bg: "#f8fafc", primary: "#3b82f6", sub: "#94a3b8", fg: "#0f172a", error: "#ef4444" },
  { id: "dracula", name: "dracula", bg: "#282a36", primary: "#bd93f9", sub: "#6272a4", fg: "#f8f8f2", error: "#ff5555" },
  { id: "monokai", name: "monokai", bg: "#272822", primary: "#a6e22e", sub: "#75715e", fg: "#f8f8f2", error: "#f92672" },
  { id: "nord", name: "nord", bg: "#2e3440", primary: "#88c0d0", sub: "#4c566a", fg: "#eceff4", error: "#bf616a" },
  { id: "gruvbox-dark", name: "gruvbox dark", bg: "#282828", primary: "#fabd2f", sub: "#928374", fg: "#ebdbb2", error: "#cc241d" },
  { id: "gruvbox-light", name: "gruvbox light", bg: "#fbf1c7", primary: "#d79921", sub: "#bdae93", fg: "#3c3836", error: "#cc241d" },
  { id: "matrix", name: "matrix", bg: "#000000", primary: "#00ff00", sub: "#004400", fg: "#d1ffcf", error: "#ff0000" },
  { id: "80s-after-dark", name: "80s after dark", bg: "#2b213a", primary: "#f3a8d1", sub: "#696d92", fg: "#f8f8f2", error: "#ff4a5a" },
  { id: "bento", name: "bento", bg: "#2d394d", primary: "#ff7a90", sub: "#4a7a96", fg: "#fff0f2", error: "#ff3c5b" },
  { id: "matcha-moccha", name: "matcha moccha", bg: "#523f33", primary: "#8bd49c", sub: "#7a6658", fg: "#dfd5c9", error: "#d48b8b" },
  { id: "vaporwave", name: "vaporwave", bg: "#1b1d36", primary: "#ff71ce", sub: "#89589d", fg: "#01cdfe", error: "#ff3c5b" },
  { id: "mizu", name: "mizu", bg: "#afcef3", primary: "#1a2639", sub: "#8ea8c3", fg: "#1a2639", error: "#f24236" },
  { id: "camping", name: "camping", bg: "#faf1e4", primary: "#618c56", sub: "#c2b8a3", fg: "#3d4035", error: "#d65d5d" },
  { id: "midnight", name: "midnight blue", bg: "#0a0a1a", primary: "#8b5cf6", sub: "#6d6d8d", fg: "#e0e0ff", error: "#fb7185" },
  { id: "forest", name: "forest", bg: "#f0fdf4", primary: "#16a34a", sub: "#86efac", fg: "#14532d", error: "#dc2626" },
  { id: "retrocast", name: "retrocast", bg: "#2eaf9c", primary: "#212b43", sub: "#48c5b0", fg: "#f8f8f2", error: "#f24236" },
  { id: "miami", name: "miami", bg: "#f35588", primary: "#05dfd7", sub: "#9e365e", fg: "#f0e9c8", error: "#ffffff" },
  { id: "honey", name: "honey", bg: "#f2a900", primary: "#f5e0a3", sub: "#c18700", fg: "#ffffff", error: "#5c4000" },
  { id: "terminal", name: "terminal", bg: "#191a1b", primary: "#79a617", sub: "#4d5c23", fg: "#e5e5e5", error: "#a61717" },
  { id: "bingsu", name: "bingsu", bg: "#b8a7aa", primary: "#8a4f58", sub: "#8a7b7e", fg: "#4a3337", error: "#cc3e44" },
  { id: "lavender", name: "lavender", bg: "#ada6c2", primary: "#e4e3e9", sub: "#827c97", fg: "#2f2a41", error: "#544f6f" },
  { id: "cafe", name: "cafe", bg: "#ceb18d", primary: "#14120f", sub: "#d4d4d4", fg: "#4d392b", error: "#8b3a3a" },
  { id: "diner", name: "diner", bg: "#517693", primary: "#d19e44", sub: "#34526f", fg: "#f2f2f2", error: "#8b3a3a" },
  { id: "aether", name: "aether", bg: "#101820", primary: "#eedaea", sub: "#cfb1c1", fg: "#ffffff", error: "#f28b82" },
  { id: "stealth", name: "stealth", bg: "#010203", primary: "#383e42", sub: "#5e676e", fg: "#e2e4e8", error: "#742222" },
  { id: "superuser", name: "superuser", bg: "#262a33", primary: "#43ffaf", sub: "#526777", fg: "#e5e9f0", error: "#ff5f5f" },
  { id: "modern-ink", name: "modern ink", bg: "#ffffff", primary: "#000000", sub: "#b3b3b3", fg: "#404040", error: "#ff0000" },
  { id: "godspeed", name: "godspeed", bg: "#e2ded0", primary: "#64939b", sub: "#b2aba0", fg: "#445052", error: "#bf616a" },
  { id: "olivia", name: "olivia", bg: "#1c1b1d", primary: "#deaf9d", sub: "#4e4a4e", fg: "#f2efed", error: "#c23f3f" },
  { id: "mountain", name: "mountain", bg: "#0f0f0f", primary: "#e7e7e7", sub: "#4c4c4c", fg: "#e7e7e7", error: "#ce5c5c" },
  { id: "red-samurai", name: "red samurai", bg: "#1f1d1d", primary: "#c52233", sub: "#b19760", fg: "#e5e5e5", error: "#ff5f5f" },
];

export const DEFAULT_THEME = "dark-luff";

// ── Chart ────────────────────────────────────────────────────────────────────

export const CHART_FALLBACK_COLORS = {
  primary: "#e2b714",
  sub: "#646669",
  error: "#ca4754",
} as const;

// ── Persistence Keys (localStorage) ──────────────────────────────────────────

export const STORAGE_KEYS = {
  theme: "luff-theme-storage",
  font: "luff-app-font-storage",
} as const;
