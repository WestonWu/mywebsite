<template>
  <div id="app">
    <!-- 条件渲染粒子效果和雨滴效果 -->
    <DOMParticle v-if="showParticles" />
    <RainEffect v-if="showRain" />

    <Navbar />
    <main>
      <router-view />
    </main>

    <!-- 添加切换按钮 -->
    <div class="effect-toggle">
      <button @click="toggleEffect('particles')" :class="{ active: showParticles }" class="effect-btn">粒子效果</button>
      <button @click="toggleEffect('rain')" :class="{ active: showRain }" class="effect-btn">雨滴效果</button>
    </div>

    <!-- 回到顶部按钮 -->
    <button
      class="scroll-top-btn"
      :class="{ visible: showScrollTop }"
      @click="scrollToTop"
      aria-label="回到顶部"
      :aria-hidden="!showScrollTop"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  </div>
</template>

<script>
import DOMParticle from "./components/DOMParticle.vue"
import RainEffect from "./components/RainEffect.vue"
import Navbar from "./components/NavBar.vue"
import { ref, provide } from "vue"

export default {
  name: "App",
  components: {
    DOMParticle,
    RainEffect,
    Navbar,
  },
  data() {
    return {
      showParticles: true, // 默认显示粒子效果
      showRain: false,
      showScrollTop: false,
    }
  },
  setup() {
    // 主题模式，默认深色模式
    const isDarkMode = ref(true)

    // 切换主题模式
    function toggleTheme() {
      isDarkMode.value = !isDarkMode.value
      document.documentElement.classList.toggle("light-mode", !isDarkMode.value)
      // 保存主题设置到localStorage
      localStorage.setItem("theme", isDarkMode.value ? "dark" : "light")
    }

    // 提供主题相关的数据和方法给子组件
    provide("theme", {
      isDarkMode,
      toggleTheme,
    })

    return {
      isDarkMode,
      toggleTheme,
    }
  },
  methods: {
    toggleEffect(effectType) {
      if (effectType === "particles") {
        this.showParticles = true
        this.showRain = false
      } else if (effectType === "rain") {
        this.showParticles = false
        this.showRain = true
      }
    },
    // 处理滚动事件，控制回到顶部按钮的显示/隐藏
    handleScroll() {
      // 当页面向下滚动超过300px时显示按钮
      this.showScrollTop = window.scrollY > 300
    },
    // 平滑滚动到页面顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll)
    // 从localStorage恢复主题设置
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      this.toggleTheme()
    }
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll)
  },
}
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: var(--primary-bg);
  overflow-x: hidden;
}

body {
  background: linear-gradient(to bottom, var(--primary-bg), var(--secondary-bg));
}

:root {
  /* 动画持续时间 */
  --animation-duration: 0.5s;
  --animation-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition: all 0.3s ease;
  --border-radius: 12px;
  /* 深色模式变量 */
  --primary-bg: #000000;
  --secondary-bg: #1a1a2e;
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.75);
  --accent-color: #3a86ff;
  --accent-color-hover: #1a6dff;
  --border-color: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.1);
  --active-bg: rgba(255, 255, 255, 0.15);
  --card-bg: rgba(255, 255, 255, 0.05);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --gradient-primary: linear-gradient(135deg, #3a86ff, #1a6dff);
}

/* 浅色模式变量 */
.light-mode {
  --primary-bg: #ffffff;
  --secondary-bg: #f5f7fa;
  --text-primary: rgba(0, 0, 0, 0.95);
  --text-secondary: rgba(0, 0, 0, 0.75);
  --border-color: rgba(0, 0, 0, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.05);
  --active-bg: rgba(0, 0, 0, 0.1);
  --card-bg: rgba(0, 0, 0, 0.02);
  --shadow-color: rgba(0, 0, 0, 0.1);
}

#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background: linear-gradient(to bottom, var(--primary-bg), var(--secondary-bg));
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* 通用文本样式 */
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-primary);
}

p,
span,
div {
  color: var(--text-secondary);
}

/* 通用按钮样式 */
button,
.btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--animation-duration) var(--animation-timing);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
}

/* 触摸目标优化 - 确保所有可交互元素符合WCAG标准（至少44x44像素） */
button,
.btn,
a[href],
input[type="button"],
input[type="submit"],
input[type="reset"],
select,
textarea,
.clickable {
  /* 确保触摸目标大小至少为44x44像素 */
  min-width: 44px;
  min-height: 44px;
  /* 优化触摸交互 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* 确保足够的点击区域 */
  padding: 8px 12px;
}

button::before,
.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: all 0.6s ease;
}

button:hover,
.btn:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
  border-color: rgba(255, 255, 255, 0.2);
}

button:hover::before,
.btn:hover::before {
  left: 100%;
}

button:active,
.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 链接样式 */
a {
  color: var(--accent-color);
  text-decoration: none;
  transition: all var(--animation-duration) var(--animation-timing);
  position: relative;
  display: inline-block;
}

a::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-color);
  transition: width var(--animation-duration) var(--animation-timing);
}

a:hover {
  color: var(--accent-color-hover);
  transform: translateY(-1px);
}

a:hover::after {
  width: 100%;
}

/* 输入框样式 */
input,
textarea,
select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 10px 15px;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

/* 回到顶部按钮样式 */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 99;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.scroll-top-btn.visible {
  opacity: 1;
  visibility: visible;
}

.scroll-top-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px var(--shadow-color);
}

/* 添加切换按钮样式 */
.effect-toggle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.effect-btn {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.effect-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.effect-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .effect-toggle {
    bottom: 70px;
  }

  .effect-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .scroll-top-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 45px;
    height: 45px;
  }
}

input:focus,
textarea:focus,
select:focus {
  background: rgba(0, 0, 0, 0.3);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.2);
}

/* 卡片样式 */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px var(--shadow-color);
  transition: all var(--animation-duration) var(--animation-timing);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--animation-duration) var(--animation-timing);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--shadow-color);
  border-color: rgba(255, 255, 255, 0.15);
}

.card:hover::before {
  transform: scaleX(1);
}

/* 列表样式 */
ul,
ol {
  color: var(--text-secondary);
}

/* 表格样式 */
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  color: var(--text-secondary);
}

th {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.App {
  text-align: center;
}

/* 页面过渡动画样式 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity var(--animation-duration) var(--animation-timing),
    transform var(--animation-duration) var(--animation-timing);
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.navbar {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-brand a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -0.5px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: var(--transition);
}

.nav-links a:hover {
  color: var(--primary-color);
}

.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: var(--transition);
}

.nav-links a:hover::after {
  width: 100%;
}

.home,
.about,
.projects,
.contact {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

h1::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: 3px;
}

.hero-section,
.about-content,
.contact-content {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2.5rem;
}

.skills ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.skills li {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: var(--transition);
}

.skills li:hover {
  background: var(--hover-bg);
  transform: translateY(-1px);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.project-card {
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--gradient-primary);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.contact-content ul {
  list-style: none;
  padding: 0;
}

.contact-content li {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .nav-brand {
    margin-bottom: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .hero-section,
  .about-content,
  .contact-content,
  .project-card {
    padding: 2rem;
  }
}

/* 更新按钮样式 */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(58, 134, 255, 0.3);
}
</style>
