<template>
  <div class="about">
    <h1>关于我</h1>
    <div class="about-content">
      <div class="about-grid">
        <div class="about-text">
          <p>你好，我是一名专注于创建现代化、高性能web应用的开发者。我热爱探索新技术，并将其应用到实际项目中。</p>
          <p>我相信简洁的设计和高效的代码可以创造出卓越的用户体验。</p>
          <!-- 简历下载按钮 -->
          <a 
            href="/resume_example.txt" 
            download="简历示例.txt" 
            class="resume-download-btn"
            aria-label="下载简历"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载我的简历
          </a>
        </div>
        <div class="about-image">
          <div class="image-placeholder">
            <span>开发者</span>
          </div>
        </div>
      </div>

      <div class="skills">
        <h2>技能专长</h2>
        <ul>
          <li>前端开发 (Vue, JavaScript, HTML, CSS)</li>
          <li>后端开发</li>
          <li>数据库设计</li>
          <li>响应式设计</li>
          <li>UI/UX设计</li>
          <li>性能优化</li>
        </ul>
      </div>

      <!-- 经历时间线 -->
      <div class="timeline">
        <h2>工作经历</h2>
        <div class="timeline-items">
          <div class="timeline-item">
            <div class="timeline-date">2022年至今</div>
            <div class="timeline-content">
              <h3>高级前端开发工程师</h3>
              <p class="company">云帆科技有限公司</p>
              <p>负责企业级SaaS平台的前端架构设计与开发，使用Vue 3 + TypeScript构建高性能、可扩展的用户界面。主导实施微前端架构，将大型单页应用拆分为8个子应用，提升了团队协作效率和页面加载速度。</p>
              <p>优化数据可视化模块，引入ECharts替代传统图表库，将大数据集渲染性能提升40%。建立组件库系统，减少代码重复率30%，标准化开发流程。</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2019年-2022年</div>
            <div class="timeline-content">
              <h3>前端开发工程师</h3>
              <p class="company">星辰互联网科技有限公司</p>
              <p>参与电商平台和移动应用的前端开发，使用React和Redux构建响应式跨平台界面。负责商品详情页和购物车功能的重构，提升用户转化率15%。</p>
              <p>与后端团队协作，基于RESTful API实现前后端数据交互，优化接口调用策略，减少网络请求30%。实现PWA功能，支持离线访问，提升用户体验。</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2017年-2019年</div>
            <div class="timeline-content">
              <h3>Web开发工程师</h3>
              <p class="company">新锐软件技术有限公司</p>
              <p>负责企业官网和客户管理系统的前端开发和维护，使用HTML5、CSS3和JavaScript实现响应式设计。将传统jQuery项目迁移至Vue.js框架，提升代码可维护性。</p>
              <p>优化页面加载性能，通过懒加载和CDN缓存策略，将首屏加载时间从5秒减少至1.5秒。参与敏捷开发流程，每周迭代发布新版本，及时响应用户需求。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="education">
        <h2>教育背景</h2>
        <div class="education-items">
          <div class="education-item">
            <div class="education-date">2013年-2017年</div>
            <div class="education-content">
              <h3>计算机科学与技术</h3>
              <p class="degree">学士学位</p>
              <p class="university">南京大学</p>
              <p>主修计算机科学与技术专业，辅修软件工程。GPA 3.8/4.0，连续三年获得国家奖学金。在校期间担任计算机科学社团技术部部长，组织多次技术分享会。</p>
              <p>参与省级科研项目《基于深度学习的网络流量分析系统》，负责前端可视化模块开发。获得"互联网+"大学生创新创业大赛省级一等奖。</p>
            </div>
          </div>
          <div class="education-item">
            <div class="education-date">2010年-2013年</div>
            <div class="education-content">
              <h3>理科</h3>
              <p class="degree">高中</p>
              <p class="university">南京师范大学附属中学</p>
              <p>理科强化班，重点学习数学、物理和计算机基础。担任班级学习委员，多次获得校级三好学生称号。</p>
              <p>参加全国青少年信息学奥林匹克联赛（NOIP）获得省级一等奖，在数学和物理竞赛中多次获奖。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.about-text p {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.image-placeholder {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  height: 100%;
  min-height: 200px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.skills h2 {
  margin: 2rem 0 1rem;
  position: relative;
  display: inline-block;
}

.skills h2::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

/* 简历下载按钮样式 */
.resume-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-primary);
  color: white;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  margin-top: 1.5rem;
  transition: var(--transition);
  border: none;
}

.resume-download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(58, 134, 255, 0.3);
  color: white;
}

.resume-download-btn::after {
  display: none;
}

/* 时间线样式 */
.timeline {
  margin: 3rem 0;
}

.timeline-items {
  position: relative;
  padding-left: 2rem;
}

.timeline-items::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.timeline-date {
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.timeline-content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-content h3 {
  color: var(--text-primary) !important;
  margin-bottom: 0.5rem;
}

.timeline-content p {
  color: var(--text-secondary) !important;
  margin-bottom: 0.8rem;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 1rem;
  left: -1.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--primary-color);
}

.company {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

/* 教育背景样式 */
.education {
  margin: 3rem 0;
}

.education-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.education-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.education-item h3 {
  color: var(--text-primary) !important;
  margin-bottom: 0.5rem;
}

.education-item p {
  color: var(--text-secondary) !important;
  margin-bottom: 0.8rem;
}

.education-date {
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.degree,
.university {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.university {
  font-style: italic;
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .education-items {
    grid-template-columns: 1fr;
  }
}

/* 自定义CSS变量 */
:root {
  --primary-color: var(--accent-color);
  --secondary-color: var(--accent-color-hover);
  --border-radius: var(--border-radius);
}
</style>
