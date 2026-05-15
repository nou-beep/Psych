import type { Config } from "tailwindcss";

// Tailwind config with psych-* color utilities mapped to CSS variables.
// Each theme updates the CSS variables in globals.css, so all psych-* colors
// change automatically when the user switches themes.
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        psych: {
          bg: "var(--psych-bg)",
          card: "var(--psych-card)",
          sidebar: "var(--psych-sidebar)",
          primary: "var(--psych-primary)",
          "primary-hover": "var(--psych-primary-hover)",
          "primary-light": "var(--psych-primary-light)",
          accent: "var(--psych-accent)",
          text: "var(--psych-text)",
          muted: "var(--psych-muted)",
          border: "var(--psych-border)",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        sparkle: "sparkle 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
