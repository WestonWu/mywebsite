<template>
  <div class="about">
    <h1>关于我</h1>
    <div class="about-content">
      <div class="about-grid">
        <div class="about-text">
          <p>你好，我是巧克力，一名具有丰富经验的售后技术支持工程师，同时也是一名自学成才的开发者。</p>
          <p>
            本人性格内外结合，适应能力强，为人诚实，有良好的人际交往能力，具备相关的专业知识，拥有认真、细心和耐心的工作态度及良好的职业道德。相信团体精神的我对工作认真负责，希望能把事情做得更好。
          </p>
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
          <li>前端开发 (Vue, JavaScript)</li>
          <li>后端开发 (Nodejs)</li>
          <li>微信小程序开发</li>
          <li>Delphi 编程</li>
          <li>办公软件 (Office, Word, Excel, PPT)</li>
          <li>英文</li>
          <li>粤语</li>
        </ul>
      </div>

      <!-- 经历时间线 -->
      <div class="timeline">
        <h2>工作经历</h2>
        <div class="timeline-items">
          <div class="timeline-item">
            <div class="timeline-date">2012/10 — 至今</div>
            <div class="timeline-content">
              <h3>售后技术支持</h3>
              <p class="company">拔萃软件有限公司（澳门）</p>
              <p>
                根据客户提出的需求，整理归档，并交由研发部门开发；接受客户系统数据接口技术文档，根据自家系统需求对客户数据接口进行分析，列出需要的数据接口，然后进行相应的补充说明，之后提交给开发部门。
              </p>
              <p>
                就研发部门在研发过程中提出的相关问题与客户进行沟通和磋商，并将问题的结论交给研发部门；在系统更新或者研发出来后，直接参与系统的测试，包括制作或者更新系统测试文档，确保系统的所有模块都包含在测试过程中。
              </p>
              <p>
                客户在使用系统过程中有任何的问题，直接与我联系。帮助客户解决一些操作异常导致的问题，并数据库异常做一些基础维护。如果是系统出现了异常，负责收集客户数据资料，整理分析系统异常出现的大致原因，并交由研发部门做进一步处理。
              </p>
              <p>
                自学 Delphi
                编写了一个方便为客户提供接口文件的小程序；自学了微信小程序开发，做过一个点餐小程序和场地预约小程序；自学了
                Vue 前端开发和 Nodejs 后端开发，配合点餐小程序，做了对应的 web 后台管理和后端服务器。
              </p>
              <p>PS：由于客户大都是用英文交流，有较好的英文基础。</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2012/6 — 2012/8</div>
            <div class="timeline-content">
              <h3>C 语言开发</h3>
              <p class="company">浙江网新富士科技有限公司（杭州）</p>
              <p>
                给日本水电站项目开发管理系统，主要负责数据计算代码编写和使用；参与整个项目系统测试，并对数据计算速度进行优化。
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="education">
        <h2>教育背景</h2>
        <div class="education-items">
          <div class="education-item">
            <div class="education-date">2008/9 — 2012/6</div>
            <div class="education-content">
              <h3>计算机科学与技术</h3>
              <p class="degree">学士学位</p>
              <p class="university">湖南大学</p>
              <p>主修计算机科学与技术专业，系统学习了计算机相关理论知识和实践技能。</p>
            </div>
          </div>
          <div class="education-item">
            <div class="education-date">2007/9 — 2008/6</div>
            <div class="education-content">
              <h3>高中</h3>
              <p class="degree">普通高中</p>
              <p class="university">柳州市第一高中</p>
            </div>
          </div>
          <div class="education-item">
            <div class="education-date">2004/9 — 2007/6</div>
            <div class="education-content">
              <h3>高中</h3>
              <p class="degree">普通高中</p>
              <p class="university">柳州市高级中学</p>
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
  color: var(--text-secondary);
}

.image-placeholder {
  background: var(--gradient-primary);
  height: 100%;
  min-height: 200px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(58, 134, 255, 0.2);
}

.skills h2 {
  margin: 2rem 0 1rem;
  position: relative;
  display: inline-block;
  color: var(--text-primary);
}

.skills h2::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--gradient-primary);
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
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: var(--gradient-primary);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.timeline-date {
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.timeline-content {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px var(--shadow-color);
  position: relative;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.timeline-content h3 {
  color: var(--text-primary) !important;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.timeline-content p {
  color: var(--text-secondary) !important;
  margin-bottom: 0.8rem;
  line-height: 1.7;
}

.timeline-content::before {
  content: "";
  position: absolute;
  top: 1rem;
  left: -1.5rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 3px solid var(--accent-color);
  box-shadow: 0 0 0 2px var(--card-bg);
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
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.education-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.education-item h3 {
  color: var(--text-primary) !important;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.education-item p {
  color: var(--text-secondary) !important;
  margin-bottom: 0.8rem;
  line-height: 1.7;
}

.education-date {
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
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
</style>