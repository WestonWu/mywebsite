<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">我的个人网站</router-link>
    </div>
    <div class="menu-toggle" :class="{ active: isMenuOpen }" @click="toggleMenu">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
    <ul class="nav-links" :class="{ active: isMenuOpen }">
      <li>
        <router-link to="/" @click="closeMenu">首页</router-link>
      </li>
      <li>
        <router-link to="/about" @click="closeMenu">关于我</router-link>
      </li>
      <li>
        <router-link to="/projects" @click="closeMenu">项目展示</router-link>
      </li>
      <li>
        <router-link to="/gallery" @click="closeMenu">作品图库</router-link>
      </li>
      <li>
        <router-link to="/blog" @click="closeMenu">博客文章</router-link>
      </li>
      <li>
        <router-link to="/tools" @click="closeMenu">实用工具</router-link>
      </li>
      <li>
        <router-link to="/contact" @click="closeMenu">联系方式</router-link>
      </li>
    </ul>
    <!-- 主题切换按钮 -->
    <button
      class="theme-toggle-btn"
      @click="toggleTheme"
      aria-label="切换主题模式"
      :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        v-if="isDarkMode"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        v-else
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { ref, inject } from "vue"
import { onMounted, onUnmounted } from "vue"

// 注入主题相关的数据和方法
const theme = inject("theme")
const { isDarkMode, toggleTheme } = theme

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

// 添加滚动监听，当页面滚动时关闭菜单
function handleScroll() {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll)
})

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
})
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-brand a {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.nav-links a:hover {
  color: var(--text-primary);
}

.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--accent-color);
  transition: all 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* 桌面端样式 */
.menu-toggle {
  display: none;
}

/* 主题切换按钮样式 */
.theme-toggle-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-primary);
  position: relative;
  z-index: 100;
}

.theme-toggle-btn:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    margin-bottom: 0;
  }

  .menu-toggle {
    display: block;
    cursor: pointer;
    z-index: 110;
  }

  .theme-toggle-btn {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    transition: all 0.3s ease;
    background-color: var(--text-primary);
  }

  .menu-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle.active .bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .menu-toggle.active .bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  .nav-links {
    position: fixed;
    left: -100%;
    top: 0;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    width: 100%;
    height: 100vh;
    text-align: center;
    transition: 0.3s;
    padding-top: 80px;
    gap: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .nav-links.active {
    left: 0;
    z-index: 105;
  }

  .nav-links a {
    font-size: 1.5rem;
    padding: 1rem;
  }

  .nav-links a::after {
    height: 3px;
  }
}
</style>
