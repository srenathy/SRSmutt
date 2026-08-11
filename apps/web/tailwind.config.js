/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C120C',
          light: '#2E2018',
          dark: '#120A06'
        },
        kumkum: {
          DEFAULT: '#8C2F22',
          light: '#A63C2E',
          dark: '#6E2217'
        },
        turmeric: {
          DEFAULT: '#C99A3D',
          light: '#E0B253',
          dark: '#A67C29'
        },
        ivory: {
          DEFAULT: '#EFE3CE',
          light: '#F8F3EA',
          dark: '#E2D3B8'
        },
        textInk: '#241811'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
