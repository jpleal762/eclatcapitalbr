import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', 'sans-serif'],
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        chart: {
          yellow: "hsl(var(--chart-yellow))",
          gray: "hsl(var(--chart-gray))",
          dark: "hsl(var(--chart-dark))",
          graphite: "hsl(var(--chart-graphite))",
          "graphite-light": "hsl(var(--chart-graphite-light))",
        },
        // ─── TV Mode design tokens ───
        tv: {
          bg: "hsl(var(--tv-bg))",
          card: "hsl(var(--tv-card))",
          border: "hsl(var(--tv-border))",
          text: "hsl(var(--tv-text))",
          muted: "hsl(var(--tv-muted))",
          gold: "hsl(var(--tv-gold))",
          green: "hsl(var(--tv-green))",
          yellow: "hsl(var(--tv-yellow))",
          red: "hsl(var(--tv-red))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "celebrate-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-3px) rotate(-10deg)" },
          "50%": { transform: "translateY(0) rotate(0deg)" },
          "75%": { transform: "translateY(-3px) rotate(10deg)" },
        },
        "celebrate-pop": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.7" },
        },
        "celebrate-sparkle": {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.2)", filter: "brightness(1.4)" },
        },
        // Sprint Mascot Animations
        "runner-legs": {
          "0%, 100%": { transform: "rotate(-20deg)" },
          "50%": { transform: "rotate(20deg)" },
        },
        "runner-arms": {
          "0%, 100%": { transform: "rotate(-15deg)" },
          "50%": { transform: "rotate(15deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pedal": {
          "0%, 100%": { transform: "rotate(-25deg)" },
          "50%": { transform: "rotate(25deg)" },
        },
        "flame": {
          "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
          "50%": { opacity: "0.8", transform: "scaleY(1.15)" },
        },
        "flame-inner": {
          "0%, 100%": { opacity: "0.9", transform: "scaleY(1)" },
          "50%": { opacity: "1", transform: "scaleY(1.25)" },
        },
        "celebrate-arms": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-8deg)" },
          "75%": { transform: "rotate(8deg)" },
        },
        "celebrate-hands": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.3)" },
        },
        "twinkle-delayed": {
          "0%, 50%": { opacity: "0.4", transform: "scale(1.3)" },
          "25%, 75%": { opacity: "1", transform: "scale(1)" },
        },
        "trophy-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-clock": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "celebrate-bounce": "celebrate-bounce 0.8s ease-in-out infinite",
        "celebrate-pop": "celebrate-pop 1s ease-in-out infinite",
        "celebrate-sparkle": "celebrate-sparkle 1.5s ease-in-out infinite",
        // Sprint Mascot Animations
        "runner-legs": "runner-legs 0.4s ease-in-out infinite",
        "runner-arms": "runner-arms 0.4s ease-in-out infinite",
        "spin-slow": "spin-slow 2s linear infinite",
        "pedal": "pedal 0.6s ease-in-out infinite",
        "flame": "flame 0.3s ease-in-out infinite",
        "flame-inner": "flame-inner 0.25s ease-in-out infinite",
        "celebrate-arms": "celebrate-arms 0.8s ease-in-out infinite",
        "celebrate-hands": "celebrate-hands 0.6s ease-in-out infinite",
        "twinkle": "twinkle 1.5s ease-in-out infinite",
        "twinkle-delayed": "twinkle-delayed 1.5s ease-in-out infinite 0.75s",
        "trophy-bounce": "trophy-bounce 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
