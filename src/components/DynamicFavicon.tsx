"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { THEMES } from "@/lib/constants";

export default function DynamicFavicon() {
  const { theme: themeId } = useThemeStore();

  useEffect(() => {
    const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

    // Create SVG string
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="7" fill="${currentTheme.bg}" />
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="central" 
          text-anchor="middle" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="20" 
          fill="${currentTheme.primary}"
        >LE</text>
      </svg>
    `.trim();

    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml,${encodedSvg}`;

    // Update existing or create new link element
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = dataUri;

    // Also update apple-touch-icon
    let appleLink: HTMLLinkElement | null = document.querySelector(
      "link[rel='apple-touch-icon']",
    );
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.getElementsByTagName("head")[0].appendChild(appleLink);
    }
    appleLink.href = dataUri;
  }, [themeId]);

  return null; // This component doesn't render any UI
}
