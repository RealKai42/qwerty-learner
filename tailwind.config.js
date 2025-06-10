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
          '"Varela Round"',
          '"Nunito"',
          '"Quicksand"',
          '"HarmonyOS_Regular"',  // 添加更圆润的中文字体
          '"PingFang SC"',
          '"Microsoft Yahei"',
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