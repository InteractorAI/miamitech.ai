/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0b0b0e',
          card: '#111116',
          elevated: '#18181e',
          hover: '#1e1e26',
          border: '#232329',
        },
        fg: {
          primary: '#f0f0f5',
          secondary: '#9a9aad',
          muted: '#55555e',
        },
        accent: {
          green: '#00c853',
          pink: '#e040fb',
          blue: '#448aff',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
