/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        round: [
          '"Nunito"',
          '"Quicksand"',
          '"Rubik"',
          '"PingFang SC"',
          '"HarmonyOS Sans"',
          '"MiSans"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}