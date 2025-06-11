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
      '"Microsoft YaHei"',  // 添加微软雅黑
      '"Noto Sans SC"',     // 添加思源黑体
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