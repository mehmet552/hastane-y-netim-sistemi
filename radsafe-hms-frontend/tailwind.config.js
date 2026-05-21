/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        radsafe: {
          bg: '#070b14',
          surface: '#0f1628',
          panel: '#141e33',
          elevated: '#1a2744',
          border: 'rgba(148, 163, 184, 0.14)',
          primary: '#0d9488',
          primaryLight: '#2dd4bf',
          accent: '#38bdf8',
          danger: '#fb7185',
          warning: '#fbbf24',
          success: '#34d399',
          text: '#f1f5f9',
          textMuted: '#94a3b8',
          textDim: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'mesh': 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(13, 148, 136, 0.18), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(56, 189, 248, 0.12), transparent), radial-gradient(ellipse 50% 30% at 50% 100%, rgba(13, 148, 136, 0.08), transparent)',
        'grid-pattern': 'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(13, 148, 136, 0.25)',
        'glow-accent': '0 0 32px rgba(56, 189, 248, 0.2)',
        'glow-danger': '0 0 32px rgba(251, 113, 133, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
