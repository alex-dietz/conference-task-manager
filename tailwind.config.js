/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      colors: {
        // Brand colors - Primary red palette (customize for your event)
        'brand': {
          50: '#fef7f6',
          100: '#fdeeed',
          200: '#fbd5d1',
          300: '#f7b5ac',
          400: '#f08c7e',
          500: '#e56550',
          600: '#d1472d',
          700: '#b0321a',
          800: '#922619',
          900: '#79231c',
          950: '#540c06',  // Primary brand color rgb(84, 12, 6)
        },
        // Complementary blue-gray
        'secondary': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Gold/amber accent
        'accent': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Success green
        'success': {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Team-specific colors
        'indigo': {
          100: '#e0e7ff',
          700: '#4338ca',
        },
        'rose': {
          100: '#ffe4e6',
          700: '#be123c',
        },
        'teal': {
          100: '#ccfbf1',
          700: '#0f766e',
        },
        'purple': {
          100: '#f3e8ff',
          700: '#7e22ce',
        },
      },
    },
  },
  plugins: [],
}
