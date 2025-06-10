## 项目简介

这是一个前端项目，主要功能是**单词学习和背诵**，通过单词卡片和打字练习等交互方式，帮助用户记忆和巩固英语词汇。  
技术栈为 Vue3 + Vite，采用模块化开发，代码结构整洁，便于扩展。

---

## 项目结构与文件用途

```plaintext
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
```

---

### 主要文件说明

- **src/App.vue**  
  Vue 应用的根组件，负责挂载主页面（如 `WordPage`），是整个应用的入口视图。

- **src/main.js**  
  应用启动入口，初始化 Vue 应用、全局状态、全局样式等。

- **src/components/index.vue**  
  主页面组件，负责显示核心功能（如单词学习界面、轮播卡片等）。

- **src/components/Typing.vue**  
  打字练习相关的 Vue 组件，实现单词/句子的打字交互功能。

- **src/components/WordCard.vue**  
  单词卡片组件，展示单个单词及相关信息（释义、例句等）。

- **src/data/words.json**  
  存放单词数据的 JSON 文件，如 IELTS 单词表。供前端读取和学习使用。

- **src/stores/typing.js**  
  Pinia 状态管理模块，管理打字和单词学习相关的应用状态（如当前单词、进度、成绩等）。

- **src/index.css**  
  全局样式文件，定义项目基础样式，也可能包含 Tailwind CSS 等工具类。

- **public/sounds/**  
  存放学习过程中使用的音效文件，如单词朗读、胜利提示等。

- **vite.config.js / tailwind.config.js / postcss.config.js**  
  分别是 Vite、Tailwind CSS 和 PostCSS 的配置文件，用于前端工程化构建和样式管理。

- **package.json**  
  记录依赖、项目脚本、元信息等。

- **README.md**  
  项目的说明文档，通常包含安装、使用、贡献说明等。

