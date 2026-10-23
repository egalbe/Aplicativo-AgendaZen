import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0F4C5C",      // Deep Teal oficial
          primary: "#13677A",   // Teal intermediário para hovers
          light: "#52B788",     // Jade / Sage Green oficial
          accent: "#E0A96D",    // Soft Warm Gold oficial
          surface: "#F8FAFC",   // Fundo limpo
          text: "#2B2D42",      // Slate Gray oficial
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0F4C5C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#52B788",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#E5484D",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#E0A96D",
          foreground: "#2B2D42",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2B2D42",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
