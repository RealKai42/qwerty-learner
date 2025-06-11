## 项目简介

这是一个前端项目，主要功能是**单词学习和背诵**，通过单词卡片和打字练习等交互方式，帮助用户记忆和巩固英语词汇。  
技术栈为 Vue3 + Vite，采用模块化开发，代码结构整洁，便于扩展。

---

## 项目结构与文件用途

words/
├── node_modules/           # 依赖包目录
├── public/                 # 公共资源（如声音文件、logo等）
│   └── sounds/             # 音效资源
│   └── logo.svg            # 项目logo
├── scripts/                # 可选的脚本文件夹
├── src/                    # 源码目录
│   ├── components/         # 组件目录
│   │   ├── index.vue       # 主页面组件（如单词学习主界面）
│   │   ├── Typing.vue      # 打字练习组件
│   │   └── WordCard.vue    # 单词卡片组件
│   ├── data/               # 数据目录
│   │   └── words.json      # 单词数据（如 IELTS 词库等）
│   ├── stores/             # 状态管理
│   │   └── typing.js       # Pinia 状态模块（管理打字和单词学习的状态）
│   ├── App.vue             # 应用入口组件
│   ├── index.css           # 全局样式表
│   ├── main.js             # 应用主入口文件
│   └── types/              # 类型声明（可选，当前为空）
├── .gitignore              # Git 忽略文件
├── index.html              # 入口 HTML 文件
├── package.json            # 项目依赖和脚本
├── package-lock.json       # 依赖锁定文件
├── postcss.config.js       # PostCSS 配置
├── README.md               # 项目说明文档
├── tailwind.config.js      # Tailwind CSS 配置
└── vite.config.js          # Vite 构建配置