import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import DynamicFavicon from "@/components/DynamicFavicon";
import Header from "@/components/Header";
import { THEMES } from "@/lib/constants";

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
