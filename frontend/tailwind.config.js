/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: { 50: '#F9F8F6', 100: '#EFE9E3', 200: '#D9CFC7', 300: '#C9B59C' },
        ink: '#282521',
        teal: '#2D7772',
        coral: '#D47A5D',
        gold: '#C59A48'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 12px 32px rgba(54, 43, 32, 0.07)' }
    }
  },
  plugins: []
}
