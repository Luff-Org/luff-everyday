import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/shared/components/Providers";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import DynamicFavicon from "@/shared/components/DynamicFavicon";
import Header from "@/shared/components/Header";
import { THEMES } from "@/shared/lib/constants";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://luff-everyday.vercel.app",
  ),
  title: "Luff. • Focus & Flow",
  description: "Minimalist typing tests and productivity tools.",
};

import { Toaster } from "sonner";

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

  const themeStyles = THEMES.map(
    (t) => `
    .${t.id} {
      --background: ${t.bg};
      --foreground: ${t.fg};
      --primary: ${t.primary};
      --error: ${t.error};
      --correct: ${t.fg};
      --sub-text: ${t.sub};
      --card-bg: ${t.bg};
      --card-border: ${t.sub};
      color-scheme: ${colorScheme(t.bg)};
    }
  `,
  ).join("\n");

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className={`${inter.className} ${robotoMono.variable}`}>
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
