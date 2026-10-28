/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0D6E6E',
          dark: '#005454',
          light: '#E6F4F4',
          container: '#0d6e6e',
        },
        secondary: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          container: '#F59E0B',
        },
        tertiary: {
          DEFAULT: '#1D4ED8',
          light: '#EFF6FF',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
        }
      },
    },
  },
  plugins: [],
};
