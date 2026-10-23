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
        // Deep Forest Green: British racing green, velvet pine, and deep jade
        burgundy: {
          50: '#F0F9F4',
          100: '#DCF2E4',
          200: '#BCE5CD',
          300: '#8ED2AD',
          400: '#4CAE7B',
          500: '#268E5A',
          600: '#1A7246',
          700: '#145A37',
          800: '#0F442A',
          900: '#0B331F', // Prime Deep Forest Green
          950: '#061D12', // Deepest Velvet Pine / British Racing Green
        },
        forest: {
          50: '#F0F9F4',
          100: '#DCF2E4',
          200: '#BCE5CD',
          300: '#8ED2AD',
          400: '#4CAE7B',
          500: '#268E5A',
          600: '#1A7246',
          700: '#145A37',
          800: '#0F442A',
          900: '#0B331F',
          950: '#061D12',
        },
        campus: {
          50: '#FAF6EE', // Cosmic Latte Canvas
          100: '#F4EBE2', // Mocha Cream Surface
          200: '#EADBCB', // Mocha Cream Border
          300: '#DEC6B0',
          400: '#B08A6B',
          500: '#734E33',
          600: '#563823',
          700: '#145A37',
          800: '#0B331F',
          900: '#061D12', // Deep Forest Green Core
          950: '#04130B',
        },
        brand: {
          50: '#F0F9F4',
          100: '#DCF2E4',
          200: '#EADBCB',
          500: '#268E5A',
          600: '#1A7246',
          700: '#145A37',
          800: '#0B331F',
          900: '#061D12',
        },
        accent: {
          burgundy: '#0B331F',
          green: '#0B331F',
          forest: '#0B331F',
          mocha: '#B08A6B',
          latte: '#FAF6EE',
          gold: '#C59B27',
          emerald: '#166534',
          amber: '#B45309',
          rose: '#0B331F',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 51, 31, 0.04), 0 1px 2px -1px rgba(11, 51, 31, 0.03)',
        'card': '0 4px 20px -2px rgba(11, 51, 31, 0.06), 0 2px 6px -1px rgba(11, 51, 31, 0.03)',
        'elevated': '0 20px 40px -8px rgba(6, 29, 18, 0.22), 0 8px 16px -4px rgba(6, 29, 18, 0.08)',
        'glass': '0 8px 32px 0 rgba(11, 51, 31, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'glow-burgundy': '0 0 28px -4px rgba(20, 90, 55, 0.45)',
        'glow-green': '0 0 28px -4px rgba(20, 90, 55, 0.45)',
        'glow-mocha': '0 0 24px -4px rgba(176, 138, 107, 0.4)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
