export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy aliases kept for any remaining references
        'livescore': {
          primary: '#ff6b2b',
          dark: '#0d0d1a',
          gray: '#1a1a2e',
          lightgray: '#16213e',
          text: '#ffffff',
        },
        // Ember Dark design tokens as Tailwind colors
        ember: {
          DEFAULT: '#ff6b2b',
          dim: 'rgba(255,107,43,0.15)',
          glow: 'rgba(255,107,43,0.35)',
        },
        amber: {
          DEFAULT: '#f7b731',
          dim: 'rgba(247,183,49,0.15)',
        },
        'live-red': '#fc4444',
        'bg-base': '#0d0d1a',
        'bg-card': '#1a1a2e',
        'bg-elevated': '#16213e',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '18px',
        'xl': '24px',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'score-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 1.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite linear',
        'fade-up': 'fade-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both',
        'score-pop': 'score-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}
