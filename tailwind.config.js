/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cosmic Latte: The astronomical average color of the universe - celestial warm ivory
        latte: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5EEDD',
          300: '#EFE3CA',
          400: '#E4D2B0',
          500: '#D5BE93',
          600: '#BAA074',
        },
        // Mocha Cream: Velvety roasted taupe, cafe-creme, and buttery biscuit warmth
        mocha: {
          50: '#FAF6F1',
          100: '#F4EBE2',
          200: '#EADBCB',
          300: '#DEC6B0',
          400: '#CAA78B',
          500: '#B08A6B',
          600: '#91694A',
          700: '#734E33',
          800: '#563823',
          900: '#3D2617',
          950: '#27170D',
        },
        // Deep Burgundy: Regal oxblood, vintage black-cherry, and luxurious wine
        burgundy: {
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F8CFD5',
          300: '#F0A7B2',
          400: '#DF697B',
          500: '#C4364D',
          600: '#9E1B31',
          700: '#781022',
          800: '#560917',
          900: '#3D0610', // Prime Deep Burgundy
          950: '#250309', // Deepest Oxblood Velvet
        },
        campus: {
          50: '#FAF6EE', // Cosmic Latte Canvas
          100: '#F4EBE2', // Mocha Cream Surface
          200: '#EADBCB', // Mocha Cream Border
          300: '#DEC6B0',
          400: '#B08A6B',
          500: '#734E33',
          600: '#563823',
          700: '#560917',
          800: '#3D0610',
          900: '#250309', // Deep Burgundy Core
          950: '#180206',
        },
        brand: {
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#EADBCB',
          500: '#9E1B31',
          600: '#781022',
          700: '#560917',
          800: '#3D0610',
          900: '#250309',
        },
        accent: {
          burgundy: '#781022',
          mocha: '#B08A6B',
          latte: '#FAF6EE',
          gold: '#C59B27',
          emerald: '#166534',
          amber: '#B45309',
          rose: '#9E1B31',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(61, 6, 16, 0.04), 0 1px 2px -1px rgba(61, 6, 16, 0.03)',
        'card': '0 4px 20px -2px rgba(61, 6, 16, 0.06), 0 2px 6px -1px rgba(61, 6, 16, 0.03)',
        'elevated': '0 20px 40px -8px rgba(37, 3, 9, 0.22), 0 8px 16px -4px rgba(37, 3, 9, 0.08)',
        'glass': '0 8px 32px 0 rgba(61, 6, 16, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'glow-burgundy': '0 0 28px -4px rgba(120, 16, 34, 0.45)',
        'glow-mocha': '0 0 24px -4px rgba(176, 138, 107, 0.4)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
