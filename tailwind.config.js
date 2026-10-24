/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
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
        // Light Green & Emerald Scale: Crisp, fresh, spring meadow & mint
        burgundy: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80', // Fresh light green
          500: '#22C55E', // Vibrant light green
          600: '#16A34A', // Core action green
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#144327',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#144327',
        },
        campus: {
          50: '#FAF6EE', // Cosmic Latte Canvas
          100: '#F4EBE2', // Mocha Cream Surface
          200: '#EADBCB', // Mocha Cream Border
          300: '#DEC6B0',
          400: '#B08A6B',
          500: '#734E33',
          600: '#563823',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#144327',
        },
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#EADBCB',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        accent: {
          burgundy: '#16A34A',
          green: '#22C55E',
          lightGreen: '#4ADE80',
          forest: '#16A34A',
          mocha: '#B08A6B',
          latte: '#FAF6EE',
          gold: '#C59B27',
          emerald: '#22C55E',
          amber: '#B45309',
          rose: '#16A34A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(22, 163, 74, 0.05), 0 1px 2px -1px rgba(22, 163, 74, 0.03)',
        'card': '0 4px 20px -2px rgba(22, 163, 74, 0.07), 0 2px 6px -1px rgba(22, 163, 74, 0.03)',
        'elevated': '0 20px 40px -8px rgba(20, 83, 45, 0.22), 0 8px 16px -4px rgba(20, 83, 45, 0.08)',
        'glass': '0 8px 32px 0 rgba(22, 163, 74, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'glow-burgundy': '0 0 28px -4px rgba(34, 197, 94, 0.45)',
        'glow-green': '0 0 28px -4px rgba(34, 197, 94, 0.45)',
        'glow-mocha': '0 0 24px -4px rgba(176, 138, 107, 0.4)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
