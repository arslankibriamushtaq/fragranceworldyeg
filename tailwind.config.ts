import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fbf5ef",
          100: "#f5e8db",
          200: "#ead0b5",
          300: "#dcb68f",
          400: "#b88c65",
          500: "#a77a54",
          600: "#8c6444",
          700: "#6f4f37",
          800: "#553d2b",
          900: "#3e2d21",
        },
        forest: {
          50: "#fdf1ec",
          100: "#f5e3db",
          200: "#d9ccc6",
          300: "#a89d98",
          400: "#6f6663",
          500: "#4a4341",
          600: "#2b2624",
          700: "#1f1b1a",
          800: "#171413",
          900: "#0d0b0b",
        },
        luxury: {
          dark: "#0d0b0b",
          darker: "#060505",
          light: "#ffe4d9",
          cream: "#fff3ee",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.7s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 140, 101, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(184, 140, 101, 0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(13, 11, 11, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(13, 11, 11, 0)" },
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #b88c65 0%, #dcb68f 50%, #b88c65 100%)",
        "green-gradient":
          "linear-gradient(135deg, #0d0b0b 0%, #2b2624 50%, #0d0b0b 100%)",
        "dark-gradient":
          "linear-gradient(135deg, #060505 0%, #1f1b1a 50%, #060505 100%)",
      },
      boxShadow: {
        gold: "0 4px 20px rgba(184, 140, 101, 0.25)",
        "gold-lg": "0 8px 40px rgba(184, 140, 101, 0.35)",
        green: "0 4px 20px rgba(13, 11, 11, 0.22)",
        "green-lg": "0 8px 40px rgba(13, 11, 11, 0.3)",
        luxury: "0 25px 60px rgba(13, 11, 11, 0.12)",
        "luxury-lg": "0 40px 80px rgba(13, 11, 11, 0.15)",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
