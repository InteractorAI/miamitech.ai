/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        miami: {
          black: '#050505',
          dark: '#121212',
          pink: '#FF00FF',
          orange: '#FF4500',
          purple: '#8A2BE2',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

