import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themes } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Luff-Everyday \u2022 Focus & Flow",
  description: "Minimalist productivity tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeStyles = themes
    .map(
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
    }
  `,
    )
    .join("\n");

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <main className="min-h-screen max-w-7xl mx-auto px-4 md:px-8">
              {children}
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
