import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#070a12",
          800: "#0b1120",
          700: "#0f172a",
          600: "#141d33",
          500: "#1c2742",
        },
        forge: {
          DEFAULT: "#ff6b2c",
          glow: "#ff8a4c",
          dim: "#b8451a",
        },
        accent: {
          cyan: "#38e0d4",
          violet: "#8b7cff",
          green: "#3ddc84",
          amber: "#ffc24b",
          red: "#ff5c6c",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,107,44,0.25), 0 8px 40px -8px rgba(255,107,44,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -25px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,107,44,0.5)" },
          "100%": { boxShadow: "0 0 0 10px rgba(255,107,44,0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
