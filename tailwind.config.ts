import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gold-primary': '#B89B4E',
        'gold-highlight': '#F5B931',
        'gold-deep': '#A8720A',
        'midnight': '#0D1B2A',
        'ink': '#1A1A1A',
        'stone': '#777777',
        'blush': '#FDF3DC',
      },
      fontFamily: {
        sans: ['var(--font-radikal)', 'sans-serif'],
      },
      borderRadius: {
        'brand-sm': '4px',
        'brand-md': '8px',
        'brand-lg': '16px',
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(13, 27, 42, 0.12)',
        'brand-md': '0 4px 16px rgba(13, 27, 42, 0.16)',
        'brand-lg': '0 8px 32px rgba(13, 27, 42, 0.20)',
        'gold': '0 4px 20px rgba(212, 146, 10, 0.25)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
      maxWidth: {
        'container': '1540px',
      },
    },
  },
  plugins: [],
}

export default config
