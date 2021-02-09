module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {},
    borderRadius: {
      large: '0.75rem',
      lg: '0.5rem',
      md: '0.375rem',
    },
  },
  variants: {
    extend: {
      visibility: ['hover', 'group-hover'],
    },
  },
  plugins: [],
}
