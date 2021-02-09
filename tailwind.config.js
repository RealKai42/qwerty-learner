module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    borderRadius: {
      large: '0.75rem',
      lg: '0.5rem',
      md: '0.375rem',
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
