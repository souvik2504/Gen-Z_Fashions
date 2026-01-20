
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      aspectRatio: {
        '1/1': '1 / 1',
      }
    }
  },
  plugins: [],
};
