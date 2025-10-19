/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#000000',
          green: '#00FF00',
          'green-dim': '#00CC00',
          'green-bright': '#33FF33',
          white: '#FFFFFF',
          gray: '#AAAAAA',
          'dark-gray': '#333333',
          link: '#66FFFF',
          description: '#CCCCCC',
          border: '#555555',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

