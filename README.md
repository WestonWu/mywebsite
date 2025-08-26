# 个人网站项目

这是一个使用Vue.js + Vite构建的个人网站项目，包含主页、关于我、项目展示和联系表单等功能模块。

## 项目特点

- 🎨 **现代UI设计**：采用磨砂玻璃（Glassmorphism）设计风格，视觉效果优雅
- 🚀 **高性能**：使用Vite构建工具，快速启动和热更新
- 📱 **响应式设计**：适配不同屏幕尺寸的设备
- 💻 **模块化结构**：代码组织清晰，易于维护和扩展
- 📧 **联系表单**：支持用户发送消息
- 📊 **技能展示**：使用图表直观展示技能水平

## 技术栈

- **前端框架**：Vue.js 3
- **构建工具**：Vite
- **路由管理**：Vue Router
- **样式**：CSS3 (包含磨砂玻璃效果)
- **部署**：GitHub Pages / 任意静态网站托管服务

## 快速开始

### 前提条件

确保您已安装以下软件：
- [Node.js](https://nodejs.org/) (v14.0或更高版本)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/WestonWu/mywebsit.git
cd mywebsit
```

2. 安装依赖
```bash
npm install
# 或使用yarn
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或使用yarn
yarn dev
```

4. 在浏览器中访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
# 或使用yarn
yarn build
```

构建后的文件将生成在 `dist` 目录中，可以部署到任何静态网站托管服务。

## 项目结构

```
├── .gitignore         # Git忽略规则配置
├── index.html         # HTML入口文件
├── package.json       # 项目依赖和脚本配置
├── vite.config.js     # Vite配置文件
└── src/               # 源代码目录
    ├── App.vue        # 应用根组件
    ├── assets/        # 静态资源文件
    │   └── images/    # 图片资源
    ├── components/    # 可复用组件
    │   ├── NavBar.vue          # 导航栏组件
    │   ├── ParticleBackground.vue # 粒子背景组件
    │   └── SkillChart.vue      # 技能图表组件
    ├── main.js        # 应用入口文件
    ├── router/        # 路由配置
    │   └── index.js   # 路由定义
    └── views/         # 页面组件
        ├── AboutView.vue       # 关于我页面
        ├── ContactView.vue     # 联系页面
        ├── HomeView.vue        # 首页
        └── ProjectsView.vue    # 项目展示页面
```

## 功能模块说明

### 首页
- 个人简介和欢迎信息
- 主要功能入口
- 粒子背景效果

### 关于我
- 个人详细介绍
- 技能展示（使用图表可视化）
- 教育和工作经历

### 项目展示
- 个人项目列表
- 项目详情和链接
- 项目分类和筛选

### 联系页面
- 联系表单（支持发送消息）
- 社交媒体链接
- 其他联系方式

## 自定义配置

### 修改颜色主题
可以在 `App.vue` 或相关组件中修改CSS变量来自定义颜色主题。

### 添加新页面
1. 在 `src/views/` 目录下创建新的Vue组件
2. 在 `src/router/index.js` 中注册新路由
3. 在导航栏组件中添加对应链接

## 部署指南

### GitHub Pages
1. 构建生产版本
```bash
npm run build
```

2. 部署到GitHub Pages
可以使用 [gh-pages](https://www.npmjs.com/package/gh-pages) 包自动化部署过程：
```bash
npm install -g gh-pages
gh-pages -d dist
```

## License

MIT License

## 致谢

感谢所有支持和贡献这个项目的朋友！