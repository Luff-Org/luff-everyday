import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/shared/components/Providers";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import DynamicFavicon from "@/shared/components/DynamicFavicon";
import Header from "@/shared/components/Header";
import { THEMES, DEFAULT_THEME, STORAGE_KEYS } from "@/shared/lib/constants";
import { readableOn } from "@/shared/lib/contrast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

/** The font-picker families (settings page). Loaded async — see the link below. */
const PICKER_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bangers&family=Bungee&family=Comic+Neue&family=Creepster&family=Fira+Code&family=Inconsolata&family=Inter:wght@400;500;700&family=JetBrains+Mono&family=Lato:wght@400;700&family=Lobster&family=Luckiest+Guy&family=Monoton&family=Nunito:wght@400;700&family=Oswald:wght@400;600&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;500;600&family=Press+Start+2P&family=Righteous&family=Roboto+Mono&family=Roboto:wght@400;500;700&family=Space+Mono&family=Ubuntu+Mono&family=Ubuntu:wght@400;500;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://luff-everyday.vercel.app",
  ),
  title: "Luff. • Focus & Flow",
  description: "Minimalist typing tests and productivity tools.",
};

/**
 * Runs before the browser paints anything: reads the same localStorage keys the
 * zustand stores persist to and stamps the theme class / font variable onto
 * <html>. This is what lets the app render immediately instead of hiding the
 * tree until React hydrates — no flash of the wrong theme, no blank first frame.
 *
 * Also flips the picker-font stylesheet to `media="all"` once it has finished
 * downloading, so that sheet never blocks the first render.
 */
const PRE_PAINT_SCRIPT = `
(function () {
  try {
    var read = function (key) {
      var raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) || {}).state || null : null;
    };
    var theme = (read(${JSON.stringify(STORAGE_KEYS.theme)}) || {}).theme || ${JSON.stringify(DEFAULT_THEME)};
    document.documentElement.className = theme === "light" ? "" : theme;
    var font = (read(${JSON.stringify(STORAGE_KEYS.font)}) || {}).appFontFamilyString;
    if (font) document.documentElement.style.setProperty("--app-font", font);
  } catch (e) {}
  var link = document.getElementById("picker-fonts");
  if (link) {
    if (link.sheet) link.media = "all";
    else link.addEventListener("load", function () { link.media = "all"; });
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Derive the native color-scheme from each theme's background luminance so
  // native controls (select popups, date pickers, scrollbars) match the theme.
  const colorScheme = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? "dark" : "light";
  };

  const themeStyles = THEMES.map((t) => {
    // Palettes are authored for character, not legibility, so every text-role
    // colour is floored against its own background before it ships. See
    // `shared/lib/contrast.ts` for why this is derived rather than hand-tuned.
    const fg = readableOn(t.fg, t.bg, 4.5); // AA body text
    const sub = readableOn(t.sub, t.bg, 3); // AA large / secondary UI text
    // `primary` doubles as a button *fill* under `text-background`, and
    // contrast is symmetric, so the 4.5 floor covers both directions at once.
    const primary = readableOn(t.primary, t.bg, 4.5);
    const error = readableOn(t.error, t.bg, 3);

    return `
    .${t.id} {
      --background: ${t.bg};
      --foreground: ${fg};
      --primary: ${primary};
      --error: ${error};
      --correct: ${fg};
      --sub-text: ${sub};
      /* Cards must read as raised off the page, so they are derived from the
         theme's own fg/bg rather than reusing --background (identical to the
         page) or --sub-text (too close to bg in the dark themes). */
      --card-bg: color-mix(in srgb, ${fg} 11%, ${t.bg});
      --card-border: color-mix(in srgb, ${fg} 30%, ${t.bg});
      color-scheme: ${colorScheme(t.bg)};
    }
  `;
  }).join("\n");

  return (
    // The pre-paint script mutates <html>'s class and style; React must not
    // treat that as a hydration mismatch.
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* media="print" keeps this off the critical path; the script below
            promotes it to "all" once it has downloaded. On a warm cache that
            promotion lands before hydration, so React must be told the
            attribute is expected to differ. */}
        <link
          id="picker-fonts"
          rel="stylesheet"
          href={PICKER_FONTS_HREF}
          media="print"
          suppressHydrationWarning
        />
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <ThemeProvider>
          <Providers>
            <DynamicFavicon />
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <Header />
              <main className="min-h-[calc(100vh-5rem)]">{children}</main>
            </div>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid var(--card-border)",
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
