/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'product-bg': '#dcfce7', // light green background 
        'ingredient-bg': '#fee2e2', // light red background
        'product-brdr': '#00e64d', // green border
        'ingredient-brdr': '#800000', // maroon
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
