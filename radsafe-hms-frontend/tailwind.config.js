/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        radsafe: {
          bg: '#050505',
          panel: '#0f1115',
          border: '#1f2937',
          primary: '#4338ca', // Indigo
          primaryGlow: 'rgba(67, 56, 202, 0.5)',
          accent: '#06b6d4',  // Cyan
          danger: '#f43f5e',  // Rose
          warning: '#f59e0b', // Amber
          success: '#10b981', // Emerald
          text: '#f8fafc',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px theme("colors.radsafe.primaryGlow")',
        'neon-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
        'neon-danger': '0 0 20px rgba(244, 63, 94, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
