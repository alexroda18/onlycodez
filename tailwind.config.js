/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        'primary': "#3B82F6",
        'secondary': "#10B981",
        'accent': "#F59E0B",
        'background': "#F9FAFB",
        'foreground': "#1F2937",
      },
    },
  },
  plugins: [],
} 