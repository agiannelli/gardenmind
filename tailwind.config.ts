import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  "#e8f0eb",
          100: "#c5d9cb",
          200: "#a8c4af",
          300: "#7aab88",
          400: "#4a7c59",
          500: "#3a6347",
          600: "#2d5239",
          700: "#1f3a28",
          800: "#122318",
          900: "#060d09",
        },
        earth: {
          50:  "#f2ece3",
          100: "#deccb5",
          200: "#c4a882",
          300: "#aa8450",
          400: "#7c5c3a",
          500: "#63492e",
          600: "#4a3722",
          700: "#312416",
          800: "#19120b",
          900: "#060402",
        },
        cream: "#faf8f4",
      },
      fontFamily: {
        sans:  ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.625rem",
        lg: "1rem",
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
