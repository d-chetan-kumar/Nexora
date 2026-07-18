/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F7F5',
        forest: '#1A3C2B',
        gridColor: '#3A3A38',
        coral: '#FF8C69',
        mint: '#9EFFBF',
        gold: '#F4D35E',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"General Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
      },
      animation: {
        'orbit-spin': 'orbit-spin 20s linear infinite',
      },
      keyframes: {
        'orbit-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
