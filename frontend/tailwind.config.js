export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f1f',
        midnight: '#0f172a',
        sky: '#38bdf8',
        aurora: '#a855f7',
        coral: '#fb7185',
        haze: '#e2e8f0',
      },
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.25)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
    },
  },
  plugins: [],
}
