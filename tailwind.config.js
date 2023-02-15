module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      transitionDuration: {
        0: '0ms',
      },
      padding: {
        0.8: '0.2rem',
      },
      borderRadius: {
        large: '0.75rem',
        lg: '0.5rem',
        md: '0.375rem',
      },
    },
  },
  variants: {
    extend: {
      visibility: ['hover', 'group-hover'],
      textOpacity: ['dark'],
      backgroundOpacity: ['dark'],
    },
  },
  plugins: [],
}
