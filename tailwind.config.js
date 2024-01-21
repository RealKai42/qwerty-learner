/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionDuration: {
        0: '0ms',
      },
      padding: {
        0.8: '0.2rem',
      },
      width: {
        3.5: '0.875rem',
        5.5: '1.375rem',
        15: '3.75rem',
        18: '4.5rem',
        70: '17.5rem',
        75: '18.75rem',
        84: '21rem',
        85: '21.25rem',
        100: '25rem',
        116: '29rem',
        150: '37.5rem',
        160: '40rem',
        200: '50rem',
      },
      height: {
        3.5: '0.875rem',
        5.5: '1.375rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        112: '28rem',
        120: '30rem',
        152: '38rem',
      },
      borderWidth: {
        3: '3px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        dic3: '1100px',
        dic4: '1440px',
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
  plugins: [require('@headlessui/tailwindcss'), require('@tailwindcss/forms'), require('tailwindcss-animate')],
}
