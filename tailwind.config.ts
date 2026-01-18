import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Café Study Palette
        latte: {
          DEFAULT: '#FAF8F5', // Latte Foam - Canvas background
          50: '#FEFCFB',
          100: '#FAF8F5',
          200: '#F5F1EB',
          300: '#F0EAE1',
        },
        ceramic: {
          DEFAULT: '#FFFFFF', // Ceramic White - Cards
        },
        crema: {
          DEFAULT: '#C89F65', // Crema Gold - High scores (80+)
          50: '#F5EDE0',
          100: '#EBDBBF',
          200: '#D7B77F',
          300: '#C89F65',
          400: '#A07F4F',
          500: '#785F3B',
        },
        coldbrew: {
          DEFAULT: '#AFA59B', // Cold Brew - Ghost jobs (<40)
          50: '#F5F3F0',
          100: '#EBE7E1',
          200: '#D7CFC3',
          300: '#AFA59B',
          400: '#8C847B',
          500: '#6A635C',
        },
        espresso: {
          DEFAULT: '#4A3F35', // Espresso - Text on primary buttons
          50: '#F5F4F2',
          100: '#EBE9E5',
          200: '#D7D3CB',
          300: '#A79F8F',
          400: '#756F63',
          500: '#4A3F35',
          600: '#3B3329',
          700: '#2C271D',
        },
        parchment: {
          DEFAULT: '#F4EFEA', // Parchment - RoleWithAI dialogue bubble
          50: '#FDFCFB',
          100: '#FBF9F7',
          200: '#F7F3EF',
          300: '#F4EFEA',
        },
        border: {
          DEFAULT: '#E5E0DA', // Border - Subtle definition
        },
        skip: {
          DEFAULT: '#8C7C6D', // Skip button border and text
          50: '#F5F3F1',
          100: '#EBE7E3',
          200: '#D7CFC7',
          300: '#8C7C6D',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'], // Warm serif for headers & RoleWithAI's dialogue
        rolewithai: ['Lora', 'Merriweather', 'Georgia', 'serif'], // RoleWithAI's conversational voice
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px',
      },
      boxShadow: {
        'cafe': '0 8px 30px rgba(74, 63, 53, 0.05)', // Ceramic card shadow
        'soft': '0 2px 20px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-to-mist': 'fade-to-mist 1s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'breathe': {
          '0%, 100%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.02)',
          },
        },
        'fade-to-mist': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-20px)',
            filter: 'blur(10px)',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(0, 163, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 163, 255, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
