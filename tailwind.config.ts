import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        error: "var(--error)",
        correct: "var(--correct)",
        "sub-text": "var(--sub-text)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
      },
    },
  },
  plugins: [],
};
export default config;
