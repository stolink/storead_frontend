import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mocha: {
          "50": "#F9F6F4",
          "100": "#EFE8E4",
          "200": "#DFCFC6",
          "300": "#CBB2A6",
          "400": "#BD9B8D",
          "500": "#A47764",
          "600": "#8F6150",
          "700": "#7D5A4B",
          "800": "#68483D",
          "900": "#3D302A",
          "950": "#29201C",
        },
        cloud: {
          "50": "#F1F0EC",
        },
        sage: {
          "50": "#F0F4EF",
          "100": "#E1E9E0",
          "200": "#C3D3C1",
          "400": "#7A9878",
          "500": "#5F7D5F",
          "600": "#4E6B4E",
          "700": "#3E4C3E",
        },
        espresso: {
          "900": "#3D302A",
        },
        paper: "#FDFBF8", // Cloud 50 equivalent
        ink: "#3D302A",
        relation: {
          friendly: "#7A8C6F",
          hostile: "#9C4A3F",
          romance: "#B38B82",
          family: "#4F5861",
          neutral: "#8D8B88",
        },
        status: {
          success: "#5B7B4B",
          warning: "#B8860B",
          error: "#A33A3A",
        },
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
          DEFAULT: "#F1F0EC", // Cloud 100 equivalent
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        heading: ["DM Serif Display", "Pretendard", "sans-serif"],
        body: ["Spectral", "Pretendard", "serif"],
        serif: ["Spectral", "serif"],
        display: ["DM Serif Display", "serif"],
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontSize: {
        body: "16px",
        small: "14px",
        h1: "32px",
        h2: "24px",
        h3: "20px",
      },
      spacing: {
        unit: "4px",
        component: "16px",
        gap: "24px",
        section: "48px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rank-slide": "rank-slide 600ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
        // New UI/UX animations
        "fade-up": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "fade-in": "fadeIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "slide-down": "slideDown 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        // Staggered delays
        "stagger-1": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.05s forwards",
        "stagger-2": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards",
        "stagger-3": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.15s forwards",
        "stagger-4": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.2s forwards",
        "stagger-5": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.25s forwards",
        "stagger-6": "fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.3s forwards",
      },
      transitionTimingFunction: {
        organic: "cubic-bezier(0.19, 1, 0.22, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        paper: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "paper-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        "paper-floating":
          "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "rank-slide": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(var(--slide-distance))" },
        },
        // New UI/UX keyframes
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
