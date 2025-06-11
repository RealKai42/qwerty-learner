### 在线预览

https://qwerty-learner-drab.vercel.app

### 项目结构与文件用途

```
words/
├── node_modules/           # 依赖包目录
├── public/                 # 公共资源目录
│   ├── sounds/             # 音效资源
│   └── logo.svg            # 项目Logo
├── scripts/                # 可选的脚本文件夹
├── src/                    # 源码目录
│   ├── components/         # 组件目录
│   │   ├── index.vue       # 主页面组件
│   │   ├── Typing.vue      # 打字练习组件
│   │   └── WordCard.vue    # 单词卡片组件
│   ├── data/               # 数据目录
│   │   └── words.json      # 单词数据（如IELTS词库）
│   ├── stores/             # 状态管理
│   │   └── typing.js       # Pinia状态模块
│   ├── App.vue             # 应用入口组件
│   ├── index.css           # 全局样式表
│   ├── main.js             # 应用主入口文件
│   └── types/              # 类型声明（可选）
├── .gitignore              # Git忽略文件
├── index.html              # 入口HTML文件
├── package.json            # 项目依赖和脚本
├── package-lock.json       # 依赖锁定文件
├── postcss.config.js       # PostCSS配置
├── README.md               # 项目说明文档
├── tailwind.config.js      # Tailwind CSS配置
└── vite.config.js          # Vite构建配置
```

### 核心文件功能说明

1. **index.html**
   - 应用入口HTML文件
   - 包含预加载资源、元数据和应用挂载点
   - 已优化性能、SEO和可访问性

2. **main.js**
   - 初始化Vue应用
   - 安装Pinia状态管理
   - 导入全局样式
   - 挂载应用到DOM

3. **App.vue**
   - 根组件，定义应用整体结构
   - 通常包含导航栏、主内容区域和页脚
   - 处理全局状态和路由

4. **Typing.vue**
   - 打字练习核心组件
   - 处理键盘输入、错误检测和进度跟踪
   - 与Pinia状态交互更新学习进度

5. **WordCard.vue**
   - 单词卡片组件
   - 显示当前单词、音标和翻译
   - 处理单词朗读和学习反馈

6. **typing.js (Pinia Store)**
   - 管理打字和单词学习状态
   - 跟踪当前单词、错误次数和学习进度
   - 提供持久化存储功能

7. **words.json**
   - 单词数据文件
   - 包含词汇列表、音标和翻译
   - 可扩展为多词库结构

8. **index.css**
   - 全局样式定义
   - 字体设置、动画效果和Tailwind扩展

9. **tailwind.config.js**
   - Tailwind CSS配置
   - 自定义颜色、字体和工具类

### 技术栈与依赖

- **前端框架**：Vue.js 3
- **状态管理**：Pinia
- **CSS框架**：Tailwind CSS
- **构建工具**：Vite
- **字体资源**：Google Fonts (Nunito, Quicksand, Varela Round)
- **图标库**：Font Awesome 5
- **开发依赖**：PostCSS, ESLint, Prettier

### 项目启动流程

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`

