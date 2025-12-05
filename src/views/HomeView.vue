<template>
  <div class="home">
    <div class="hero-section">
      <!-- 视差背景元素 -->
      <div class="parallax-bg">
        <div class="parallax-layer layer-1" data-speed="0.05"></div>
        <div class="parallax-layer layer-2" data-speed="0.1"></div>
        <div class="parallax-layer layer-3" data-speed="0.15"></div>
      </div>

      <div class="hero-content scroll-reveal">
        <h1 class="hero-title">欢迎来到我的个人网站</h1>
        <h2 class="hero-subtitle">你好，我是 <span class="highlight">开发者</span></h2>
        <p class="hero-description">一名热爱技术与创新的开发者，致力于创建美观且功能强大的数字体验</p>
        <div class="cta-buttons">
          <router-link to="/projects" class="cta-button primary">查看项目</router-link>
          <router-link to="/contact" class="cta-button secondary">联系我</router-link>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>向下滚动</span>
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
    <!-- 个人简介部分 -->
    <section class="about-section">
      <div class="container">
        <h2 class="section-title">关于我</h2>
        <div class="about-content">
          <div class="about-image">
            <img src="@/assets/images/avatar.jpg" alt="巧克力" class="profile-picture" />
          </div>
          <div class="about-text">
            <h3>你好，我是<span class="highlight">巧克力</span></h3>
            <p>一名充满激情的全栈开发者，拥有超过5年的Web开发经验。我热衷于创建优雅、高效且用户友好的数字体验。</p>
            <p>
              我的技术栈涵盖前端和后端开发，包括HTML5、CSS3、JavaScript、Vue.js、React、Node.js等。我不断学习新技术，以保持在快速发展的行业中的竞争力。
            </p>
            <p>
              除了编码，我还喜欢摄影、旅行和探索新的美食。我相信这些爱好能够激发我的创造力，并为我的工作带来独特的视角。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 技能亮点部分 -->
    <section class="skills-section">
      <div class="container">
        <h2 class="section-title">技能亮点</h2>
        <div class="chart-tabs">
          <button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }">所有技能</button>
          <button @click="activeTab = 'frontend'" :class="{ active: activeTab === 'frontend' }">前端技能</button>
          <button @click="activeTab = 'backend'" :class="{ active: activeTab === 'backend' }">后端技能</button>
          <button @click="activeTab = 'other'" :class="{ active: activeTab === 'other' }">其他技能</button>
        </div>
        <div class="chart-container">
          <SkillChart v-if="showChart" :skills="currentSkills" chartType="radar" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import SkillChart from "../components/SkillChart.vue"

// 切换图表显示的选项卡
const activeTab = ref("all")
const showChart = ref(true)
let chartTimer = null

// 技能数据
const skillsData = [
  { name: "HTML5 & CSS3", level: 90, category: "frontend" },
  { name: "JavaScript", level: 85, category: "frontend" },
  { name: "Vue.js", level: 80, category: "frontend" },
  { name: "React", level: 75, category: "frontend" },
  { name: "Node.js", level: 80, category: "backend" },
  { name: "Express", level: 75, category: "backend" },
  { name: "MongoDB", level: 70, category: "backend" },
  { name: "RESTful API", level: 85, category: "backend" },
  { name: "Git", level: 85, category: "other" },
  { name: "Webpack", level: 70, category: "other" },
  { name: "响应式设计", level: 90, category: "other" },
  { name: "UI/UX设计基础", level: 65, category: "other" },
]

// 监听activeTab变化，短暂隐藏组件后重新显示
watch(activeTab, (newTab) => {
  // 隐藏图表
  showChart.value = false

  // 清除之前的定时器
  clearTimeout(chartTimer)

  // 延迟100ms后重新显示图表
  chartTimer = setTimeout(() => {
    showChart.value = true
  }, 100)
})

// 使用计算属性来响应式地过滤技能数据
const frontendSkills = computed(() => skillsData.filter((skill) => skill.category === "frontend"))
const backendSkills = computed(() => skillsData.filter((skill) => skill.category === "backend"))
const otherSkills = computed(() => skillsData.filter((skill) => skill.category === "other"))

// 计算当前要显示的技能数据
const currentSkills = computed(() => {
  if (activeTab.value === "frontend") return frontendSkills.value
  if (activeTab.value === "backend") return backendSkills.value
  if (activeTab.value === "other") return otherSkills.value
  return skillsData
})

// 添加滚动动画效果和视差效果
onMounted(() => {
  const handleScroll = () => {
    const scrollElements = document.querySelectorAll(".scroll-reveal")
    const parallaxLayers = document.querySelectorAll(".parallax-layer")
    const scrollY = window.scrollY

    // 滚动显示动画
    scrollElements.forEach((el) => {
      const elementHeight = el.offsetHeight
      const elementTop = el.getBoundingClientRect().top + scrollY
      const elementVisible = 150

      if (scrollY > elementTop - window.innerHeight + elementVisible) {
        el.classList.add("active")
      }
    })

    // 视差效果
    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.1
      const yPos = -(scrollY * speed)
      layer.style.transform = `translateY(${yPos}px)`
    })
  }

  // 初始检查
  handleScroll()
  // 监听滚动事件
  window.addEventListener("scroll", handleScroll)

  return () => {
    window.removeEventListener("scroll", handleScroll)
  }
})
</script>

<style scoped>
/* 英雄区域样式 */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
}

/* 视差背景容器 */
.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

/* 视差层基础样式 */
.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 130%; /* 超出视口高度以确保滚动时有足够的空间 */
  background-size: cover;
  background-position: center;
  transition: transform var(--transition);
}

/* 第一层视差 (最慢) */
.layer-1 {
  background: radial-gradient(circle at 50% 50%, rgba(58, 134, 255, 0.15), transparent 70%);
  z-index: -1;
}

/* 第二层视差 (中等速度) */
.layer-2 {
  background: radial-gradient(circle at 20% 30%, rgba(58, 134, 255, 0.1), transparent 60%);
  z-index: -2;
}

/* 第三层视差 (最快) */
.layer-3 {
  background: radial-gradient(circle at 80% 70%, rgba(58, 134, 255, 0.05), transparent 50%);
  z-index: -3;
}

/* 英雄区域内容 */
.hero-content {
  max-width: 800px;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.hero-content.active {
  opacity: 1;
  transform: translateY(0);
}

/* 标题样式 */
.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.8rem;
  margin: 1rem 0;
}

/* 高亮文本 */
.highlight {
  background: linear-gradient(90deg, var(--accent-color), var(--accent-color-hover));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
}

/* 描述文本 */
.hero-description {
  font-size: 1.2rem;
  margin: 1.5rem 0 2.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
}

/* CTA按钮组 */
.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  width: 100%;
  max-width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

.cta-button {
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  max-width: 100%;
  box-sizing: border-box;
}

/* 个人简介部分样式 */
.about-section {
  padding: 5rem 2rem;
  background-color: var(--card-bg);
  position: relative;
  z-index: 1;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  display: block !important;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 技能图表部分样式 */
.skills-section {
  padding: 5rem 2rem;
  background-color: var(--card-bg);
  position: relative;
  z-index: 1;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  display: block !important;
}

.chart-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.chart-tabs button {
  padding: 0.5rem 1rem;
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-tabs button:hover {
  background-color: var(--hover-bg);
  border-color: var(--accent-color);
}

.chart-tabs button.active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.chart-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  /* 设置固定高度，避免组件切换时页面滑动 */
  min-height: 420px;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 80px;
  height: 4px;
  background: var(--accent-color);
  margin: 1rem auto 0;
  border-radius: 2px;
}

.about-content {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  align-items: center;
  justify-content: center;
}

.about-image {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
}

.profile-picture {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 4px solid var(--accent-color);
  object-fit: cover;
  display: block;
}

/* 删除伪元素，因为我们现在使用实际图片 */

.about-text {
  flex: 2;
  min-width: 300px;
}

.about-text h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.about-text p {
  margin-bottom: 1.2rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* 滚动显示动画 */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.scroll-reveal.active {
  opacity: 1;
  transform: translateY(0);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .about-content {
    flex-direction: column;
    text-align: center;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .about-text h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

/* 滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.scroll-indicator:hover {
  opacity: 1;
}

.scroll-indicator svg {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    padding: 1rem;
  }

  .hero-content {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-description {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    padding: 0 1rem;
  }

  .cta-button {
    width: 100%;
    max-width: 280px;
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
  }

  .scroll-indicator {
    bottom: 2rem;
  }
}
</style>
