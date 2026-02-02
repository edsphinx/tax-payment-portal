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
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Luxury custom colors
        ocean: {
          50: "hsl(185 60% 95%)",
          100: "hsl(185 55% 90%)",
          200: "hsl(185 55% 80%)",
          300: "hsl(185 55% 65%)",
          400: "hsl(185 60% 50%)",
          500: "hsl(185 65% 35%)",
          600: "hsl(185 70% 30%)",
          700: "hsl(185 75% 25%)",
          800: "hsl(185 80% 20%)",
          900: "hsl(185 85% 15%)",
        },
        coral: {
          50: "hsl(16 80% 97%)",
          100: "hsl(16 80% 92%)",
          200: "hsl(16 80% 82%)",
          300: "hsl(16 80% 72%)",
          400: "hsl(16 85% 65%)",
          500: "hsl(16 85% 55%)",
          600: "hsl(16 80% 45%)",
          700: "hsl(16 75% 38%)",
          800: "hsl(16 70% 30%)",
          900: "hsl(16 65% 22%)",
        },
        golden: {
          50: "hsl(43 90% 96%)",
          100: "hsl(43 90% 90%)",
          200: "hsl(43 85% 78%)",
          300: "hsl(43 85% 65%)",
          400: "hsl(43 90% 55%)",
          500: "hsl(43 95% 45%)",
          600: "hsl(40 90% 40%)",
          700: "hsl(38 85% 35%)",
          800: "hsl(35 80% 28%)",
          900: "hsl(32 75% 22%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        luxury: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
        glow: "0 0 40px rgba(20, 130, 140, 0.15)",
        "glow-lg": "0 0 60px rgba(20, 130, 140, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
