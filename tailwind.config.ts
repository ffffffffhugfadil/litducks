import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0f',
        surface: '#14141b',
        'surface-2': '#1c1c26',
        border: '#26262f',
        'border-2': '#32323e',
        primary: '#7c6cff',
        'primary-dark': '#6455e8',
        'primary-light': '#9d91ff',
        accent: '#7c6cff',
        text: '#ececf1',
        'text-secondary': '#9a9aa8',
        success: '#3fb67e',
        warning: '#e0a23c',
        error: '#f0606b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(124,108,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,108,255,0.05) 1px, transparent 1px)`,
        'grid-pattern-sm': `linear-gradient(rgba(124,108,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,108,255,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
        'grid-sm': '20px 20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124,108,255,0.15)',
        'glow-sm': '0 0 10px rgba(124,108,255,0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
