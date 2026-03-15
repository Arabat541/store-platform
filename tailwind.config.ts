import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#135bec",
          50: "#eef4ff",
          100: "#d9e5ff",
          200: "#bbd2ff",
          300: "#8cb4ff",
          400: "#5689ff",
          500: "#2f62ff",
          600: "#135bec",
          700: "#1049d4",
          800: "#133cac",
          900: "#163787",
          950: "#112252",
        },
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
