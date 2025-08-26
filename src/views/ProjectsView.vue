<template>
  <div class="projects">
    <h1>项目展示</h1>
    <p class="projects-description">这里展示了我近年来开发的一些代表性项目，涵盖前端开发、数据可视化和人工智能应用等领域。</p>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-image">
          <img src="@/assets/images/project-personal-website.svg" alt="个人网站" class="project-image">
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3>个人网站</h3>
            <div class="project-tags">
              <span class="tag">Vue 3</span>
              <span class="tag">Vite</span>
              <span class="tag">SCSS</span>
            </div>
          </div>
          <p class="project-description">使用Vue 3和Vite构建的个人展示网站，采用极简科技风格设计。网站包含个人简介、技能展示、项目展示和联系方式等模块，支持响应式布局。</p>
          <div class="project-meta">
            <span class="meta-item"><i class="fas fa-calendar-alt"></i> 2023年</span>
            <span class="meta-item"><i class="fas fa-users"></i> 个人项目</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link primary">查看项目</a>
            <a href="#" class="project-link secondary">源代码</a>
          </div>
        </div>
      </div>

      <div class="project-card">
        <div class="project-image">
          <img src="@/assets/images/project-data-visualization.svg" alt="数据可视化平台" class="project-image">
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3>数据可视化平台</h3>
            <div class="project-tags">
              <span class="tag">JavaScript</span>
              <span class="tag">D3.js</span>
              <span class="tag">React</span>
            </div>
          </div>
          <p class="project-description">基于D3.js的数据可视化平台，支持多种图表类型（柱状图、折线图、饼图等）和实时数据更新。平台提供拖拽式界面设计，用户可以自定义图表样式和数据来源。</p>
          <div class="project-meta">
            <span class="meta-item"><i class="fas fa-calendar-alt"></i> 2022年</span>
            <span class="meta-item"><i class="fas fa-users"></i> 团队项目</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link primary">查看项目</a>
            <a href="#" class="project-link secondary">源代码</a>
          </div>
        </div>
      </div>

      <div class="project-card">
        <div class="project-image">
          <img src="@/assets/images/project-ai-assistant.svg" alt="AI助手应用" class="project-image">
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3>AI助手应用</h3>
            <div class="project-tags">
              <span class="tag">Vue</span>
              <span class="tag">Node.js</span>
              <span class="tag">OpenAI API</span>
            </div>
          </div>
          <p class="project-description">结合人工智能API的智能助手应用，提供文本生成、图像识别、语音转换等功能。应用采用前后端分离架构，前端使用Vue构建，后端使用Node.js实现API集成。</p>
          <div class="project-meta">
            <span class="meta-item"><i class="fas fa-calendar-alt"></i> 2023年</span>
            <span class="meta-item"><i class="fas fa-users"></i> 个人项目</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link primary">查看项目</a>
            <a href="#" class="project-link secondary">源代码</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.projects {
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.projects-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.project-image {
  height: 200px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  background-size: cover;
  background-position: center;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-image:hover img {
  transform: scale(1.05);
}

.project-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--text-primary) !important;
  }

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
    background-color: rgba(0, 112, 243, 0.8);
    color: white !important;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

.project-description {
    color: var(--text-secondary) !important;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    flex: 1;
  }

.project-meta {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--text-secondary) !important;
    font-size: 0.9rem;
  }

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.project-links {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.project-link {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
}

.project-link.primary {
  background-color: var(--primary-color);
  color: white;
}

.project-link.primary:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-2px);
}

.project-link.secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.project-link.secondary:hover {
  background-color: rgba(58, 134, 255, 0.1);
  transform: translateY(-2px);
}

/* 自定义CSS变量 */
:root {
  --primary-color: var(--accent-color);
  --primary-color-hover: var(--accent-color-hover);
  --border-radius: var(--border-radius);
  --transition: var(--transition);
}

@media (max-width: 768px) {
  .projects {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .project-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
