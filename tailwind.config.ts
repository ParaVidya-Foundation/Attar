import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F6F1E7",
        ink: "#0E1A2B",
        gold: "#C9A34A",
        ash: "#D9D3C7",
        charcoal: "#3C3B37",
        white: "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 8px 30px rgba(14, 26, 43, 0.08)",
      },
    },
  },
  // Dark mode is intentionally not enabled by default, but can be added later.
  darkMode: "class",
  plugins: [],
};

export default config;
