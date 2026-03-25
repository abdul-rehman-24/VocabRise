import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
      },
      backgroundColor: {
        'dark-bg': '#0F0F0F',
        'dark-card': '#1A1A1A',
      },
      borderColor: {
        'dark-border': '#2A2A2A',
      },
      textColor: {
        'dark-text': '#F5F5F5',
        'dark-muted': '#6B7280',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
