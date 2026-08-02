/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        gov: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#1e3a8a',
          600: '#1e40af',
          700: '#1d3461',
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.10)',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity',
      }
    },
  },
  plugins: [],
}
