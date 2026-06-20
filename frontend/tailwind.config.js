/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#172033',
        secondary: '#64748b',
        accent: '#e8f3f2',
        background: '#f6f8fb',
        ink: '#172033',
        graphite: '#334155',
        champagne: '#eab308',
        porcelain: '#ffffff',
        clinical: '#0f766e',
        oxygen: '#e6f7f5',
        alert: '#b42318',
      },
    },
  },
  plugins: [],
}
