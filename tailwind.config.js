/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1ed760",
          "green-hover": "#1fdf64",
          "green-dark": "#169c46",
          black: "#000000",
          base: "#121212",
          card: "#181818",
          "card-hover": "#282828",
          elevated: "#242424",
          highlight: "#2a2a2a",
          subdued: "#a7a7a7",
          text: "#ffffff"
        }
      },
      fontFamily: {
        sans: ['CircularSp', 'CircularStd', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
