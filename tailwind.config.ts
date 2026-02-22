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
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Caudex", "ui-serif", "Georgia", "serif"],
      },
      spacing: {
        "luxury-1": "var(--space-1)",
        "luxury-2": "var(--space-2)",
        "luxury-3": "var(--space-3)",
        "luxury-4": "var(--space-4)",
        "luxury-5": "var(--space-5)",
        "luxury-6": "var(--space-6)",
        "luxury-8": "var(--space-8)",
        "luxury-10": "var(--space-10)",
        "luxury-12": "var(--space-12)",
        "luxury-16": "var(--space-16)",
        "luxury-20": "var(--space-20)",
        "luxury-24": "var(--space-24)",
        "luxury-32": "var(--space-32)",
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
