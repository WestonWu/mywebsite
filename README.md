# 个人网站项目

这是一个使用Vue.js + Vite构建的多功能个人网站项目，包含首页、关于我、项目展示、联系表单、博客系统、作品图库和实用工具集等功能模块。

## 项目特点

- 🎨 **现代UI设计**：采用磨砂玻璃（Glassmorphism）设计风格，视觉效果优雅
- 🚀 **高性能**：使用Vite构建工具，快速启动和热更新
- 📱 **响应式设计**：适配不同屏幕尺寸的设备，符合WCAG标准
- 💻 **模块化结构**：代码组织清晰，易于维护和扩展
- 🌓 **主题切换**：支持深色/浅色主题无缝切换，记住用户偏好
- 🌦️ **季节时间背景**：根据当前季节和时间自动切换背景图片（春夏秋冬，早午晚夜）
- 📧 **联系表单**：支持用户发送消息
- 📊 **技能展示**：使用图表直观展示技能水平
- 📝 **博客系统**：支持博客文章列表和详情页
- 🖼️ **作品图库**：展示个人作品和项目截图
- 🛠️ **实用工具集**：集成17个常用在线工具

## 技术栈

- **前端框架**：Vue.js 3
- **构建工具**：Vite
- **路由管理**：Vue Router
- **状态管理**：Vue 3 Composition API (provide/inject)
- **样式**：CSS3 (包含磨砂玻璃效果、响应式设计)
- **部署**：GitHub Pages / 任意静态网站托管服务

## 快速开始

### 前提条件

确保您已安装以下软件：
- [Node.js](https://nodejs.org/) (v14.0或更高版本)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/WestonWu/mywebsite.git
cd mywebsite
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
├── .env.example       # 环境变量示例文件
├── .gitignore         # Git忽略规则配置
├── index.html         # HTML入口文件
├── package.json       # 项目依赖和脚本配置
├── vite.config.js     # Vite配置文件
├── public/            # 静态资源目录
│   ├── backgrounds/   # 季节背景图片（春夏秋冬，早午晚夜）
│   └── resume_example.txt  # 简历示例文件
└── src/               # 源代码目录
    ├── App.vue        # 应用根组件
    ├── assets/        # 静态资源文件
    │   └── images/    # 图片资源
    ├── components/    # 可复用组件
    │   ├── tools/     # 实用工具组件（17个）
    │   ├── CustomSelect.vue   # 自定义选择组件
    │   ├── DOMParticle.vue     # DOM粒子效果组件
    │   ├── HelpModal.vue       # 帮助模态框
    │   ├── NavBar.vue          # 导航栏组件
    │   ├── RainEffect.vue      # 下雨效果组件
    │   ├── SeasonalBackground.vue # 季节时间背景组件
    │   └── SkillChart.vue      # 技能图表组件
    ├── composables/   # 组合式函数
    │   ├── useCityFavorites.js # 城市收藏功能
    │   ├── useGeolocation.js   # 地理位置获取
    │   ├── useTemperatureConversion.js # 温度转换
    │   ├── useToolFavorites.js # 工具收藏功能
    │   ├── useToolUtils.js     # 工具通用函数
    │   ├── useWeatherApi.js    # 天气API调用
    │   └── useWeatherCache.js  # 天气数据缓存
    ├── main.js        # 应用入口文件
    ├── router/        # 路由配置
    │   └── index.js   # 路由定义
    └── views/         # 页面组件
        ├── AboutView.vue       # 关于我页面
        ├── BlogPostView.vue    # 博客详情页
        ├── BlogView.vue        # 博客列表页
        ├── ContactView.vue     # 联系页面
        ├── GalleryView.vue     # 作品图库页
        ├── HomeView.vue        # 首页
        ├── ProjectsView.vue    # 项目展示页面
        └── ToolsView.vue       # 实用工具页面
```

## 功能模块说明

### 首页
- 个人简介和欢迎信息
- 主要功能入口导航
- 季节时间动态背景效果

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

### 博客系统
- 博客文章列表展示
- 博客文章详情页
- 支持文章分类和标签

### 作品图库
- 个人作品和项目截图展示
- 图片分类和筛选

### 实用工具集
集成了17个常用在线工具：

| 工具名称 | 功能描述 |
|---------|---------|
| 空气质量查询 | 查询指定城市的空气质量指数 |
| Base64编码解码 | 字符串与Base64格式互转 |
| 颜色转换器 | RGB、HEX、HSL颜色格式互转 |
| 颜色渐变生成器 | 生成自定义颜色渐变效果 |
| 倒计时工具 | 创建和管理倒计时任务 |
| 体感温度计算器 | 根据温度和湿度计算体感温度 |
| 降水量转换 | 不同降水量单位间的转换 |
| 二维码生成器 | 生成自定义二维码 |
| 日出日落查询 | 查询指定地点的日出日落时间 |
| 文本大小写转换 | 转换文本的大小写格式 |
| 时间戳转换 | 时间戳与日期时间互转 |
| UV指数查询 | 查询指定地区的紫外线指数 |
| 单位转换器 | 多种计量单位转换 |
| URL编码解码 | URL字符串编码和解码 |
| 当前天气查询 | 查询指定城市的当前天气 |
| 天气预报 | 获取指定城市的天气预报 |
| 字数统计 | 统计文本的字数、字符数等 |

## 核心功能详解

### 季节时间背景

项目根据当前日期和时间自动切换背景图片，包含以下场景：

- **季节**：春、夏、秋、冬
- **时段**：早晨、下午、傍晚、夜晚

背景图片位于 `public/backgrounds/` 目录下，您可以自定义替换。

### 主题切换

支持深色/浅色主题切换，主题设置会保存到localStorage中，记住用户偏好。

### 触摸目标优化

所有可交互元素均符合WCAG标准，至少44x44像素，确保良好的触摸体验。

## 自定义配置

### 修改颜色主题

可以在 `App.vue` 中修改CSS变量来自定义颜色主题：

```css
:root {
  --primary-bg: #000000;
  --secondary-bg: #1a1a2e;
  --text-primary: rgba(255, 255, 255, 1);
  --text-secondary: rgba(255, 255, 255, 0.85);
  --accent-color: #3a86ff;
  /* 更多变量... */
}
```

### 添加新页面

1. 在 `src/views/` 目录下创建新的Vue组件
2. 在 `src/router/index.js` 中注册新路由
3. 在 `src/components/NavBar.vue` 中添加对应导航链接

### 添加新工具

1. 在 `src/components/tools/` 目录下创建新的工具组件
2. 在 `src/views/ToolsView.vue` 中添加工具配置

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

### 其他静态网站托管

将 `dist` 目录中的文件上传到任意静态网站托管服务即可，如Vercel、Netlify、阿里云OSS等。

## License

MIT License

## 致谢

感谢所有支持和贡献这个项目的朋友！