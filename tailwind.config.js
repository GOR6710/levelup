/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-hover": "hsl(var(--border-hover))",
        input: "hsl(var(--input))",
        "input-focus": "hsl(var(--input-focus))",
        ring: "hsl(var(--ring))",
        "ring-offset": "hsl(var(--ring-offset))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
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
          light: "hsl(var(--muted-light))",
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
          hover: "hsl(var(--card-hover))",
          active: "hsl(var(--card-active))",
        },
        // v3.0 Enhanced color system
        cyan: {
          DEFAULT: "#00d4ff",
          50: "#e6f9ff",
          100: "#b3f0ff",
          200: "#80e6ff",
          300: "#4ddcff",
          400: "#1ad2ff",
          500: "#00d4ff",
          600: "#00a8cc",
          700: "#007a99",
          800: "#004d66",
          900: "#002633",
        },
        neon: {
          green: "#00ff88",
          blue: "#00d4ff",
          purple: "#a855f7",
          orange: "#ffaa00",
          red: "#ff4444",
          yellow: "#ffff00",
          pink: "#ff66b2",
        },
        // Semantic colors for stats
        stat: {
          strength: "#ff6b6b",
          intelligence: "#4ecdc4",
          skill: "#45b7d1",
          endurance: "#96ceb4",
          charisma: "#feca57",
          creativity: "#ff9ff3",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        'glow': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
        'glow-warm': 'var(--glow-warm)',
        'glow-cool': 'var(--glow-cool)',
        'card': 'var(--shadow)',
        'card-lg': 'var(--shadow-lg)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-cool': 'var(--gradient-cool)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0, 212, 255, 0.5)" },
          "50%": { boxShadow: "0 0 25px rgba(0, 212, 255, 0.8), 0 0 50px rgba(0, 212, 255, 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.2)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "progress-fill": "progress-fill 1s ease-out forwards",
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
