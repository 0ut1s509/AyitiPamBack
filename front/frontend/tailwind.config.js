/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These are example colors; feel free to change them!
        'av-blue': {
          100: '#e0f2fe',
          500: '#0ea5e9', // A vibrant, trustworthy blue
          600: '#0284c7',
          700: '#0369a1',
        },
        'av-green': {
          100: '#dcfce7',
          500: '#22c55e', // A positive, affirming green
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}