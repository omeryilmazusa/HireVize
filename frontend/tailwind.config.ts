import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0F5FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#1E6FFF",
          600: "#1E6FFF",
          700: "#1558D6",
          800: "#1E40AF",
          900: "#0A1628",
        },
        navy: {
          500: "#94A3B8",
          600: "#64748B",
          800: "#1A2332",
          900: "#0A1628",
        },
        border: {
          card: "#E8EDF5",
          subtle: "#F1F5F9",
        },
        surface: {
          page: "#F5F7FA",
          subtle: "#F8FAFC",
          hover: "#F8FAFF",
          selected: "#F0F5FF",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease-out",
      },
      width: {
        sidebar: "220px",
      },
    },
  },
  plugins: [],
};

export default config;
