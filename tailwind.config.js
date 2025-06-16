/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-geist-sans)",
        mono: "var(--font-geist-mono)",
        outfit: "var(--font-outfit)",
        pacifico: "var(--font-pacifico)",
      },
      animation: {
        'blob-pulse': 'blobPulse 12s ease-in-out infinite',
      },
      keyframes: {
        blobPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
      },
    },
  },
  plugins: [],
};
