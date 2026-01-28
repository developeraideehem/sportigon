export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'livescore': {
          primary: '#00A859',
          dark: '#1A1A1A',
          gray: '#2D2D2D',
          lightgray: '#F5F5F5',
          text: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
