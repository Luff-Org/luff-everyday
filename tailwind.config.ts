import type { Config } from "tailwindcss";

const alpha = (cssVar: string) =>
  `color-mix(in srgb, var(${cssVar}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Themes are delivered as bare `var(--x)` hex values, which Tailwind
        // cannot split into channels — so a plain `var(--x)` entry makes every
        // opacity modifier (`bg-foreground/30`) compile to *nothing at all*.
        // Routing through color-mix keeps the hex vars while giving Tailwind an
        // `<alpha-value>` slot to substitute, so `/xx` works everywhere.
        background: alpha("--background"),
        foreground: alpha("--foreground"),
        primary: alpha("--primary"),
        error: alpha("--error"),
        correct: alpha("--correct"),
        "sub-text": alpha("--sub-text"),
        "card-bg": alpha("--card-bg"),
        "card-border": alpha("--card-border"),
      },
    },
  },
  plugins: [],
};
export default config;
