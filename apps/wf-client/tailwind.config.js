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
        'border-radius': '0.5rem',
        'border-width': '3px',
        'modal-brdr': '#800000', // maroon
        'primaryGreen': '#008060', // primary green color
        'secondaryRed': '#ff4d4d', // secondary red color
        'lightGray': '#f5f5f5', // very light gray color
      },
      borderWidth: {
        '3': '3px',
      },
      zIndex: {
        'modal': '1000',
      },
    },
  },
  plugins: [],
}
