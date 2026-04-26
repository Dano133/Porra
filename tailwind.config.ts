import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wc: {
          background: "#0B0B12",
          surface: "#151824",
          primary: "#16D3C5",
          secondary: "#6D28D9",
          accent: "#C1121F",
          accentSoft: "#FF6B6B",
          gold: "#D4A63A",
          text: "#F5F7FA",
          muted: "#B8C0CC",
          border: "#2A3140",
        },
      },
    },
  },
  plugins: [],
};

export default config;