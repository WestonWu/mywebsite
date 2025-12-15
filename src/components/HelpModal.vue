<template>
  <div v-if="visible" class="help-modal-overlay" @click="close">
    <div class="help-modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="close" title="关闭">
          ✕
        </button>
      </div>
      
      <!-- 模态框内容 -->
      <div class="modal-body">
        <!-- 工具介绍 -->
        <div class="help-section">
          <h3>工具介绍</h3>
          <p>{{ description }}</p>
        </div>
        
        <!-- 使用方法 -->
        <div class="help-section">
          <h3>使用方法</h3>
          <ul class="usage-steps">
            <li v-for="(step, index) in usageSteps" :key="index">
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-content">{{ step }}</span>
            </li>
          </ul>
        </div>
        
        <!-- 快捷键 -->
        <div class="help-section" v-if="shortcuts && shortcuts.length > 0">
          <h3>快捷键</h3>
          <div class="shortcuts-grid">
            <div 
              v-for="(shortcut, index) in shortcuts" 
              :key="index" 
              class="shortcut-item"
            >
              <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
              <span class="shortcut-description">{{ shortcut.description }}</span>
            </div>
          </div>
        </div>
        
        <!-- 提示和技巧 -->
        <div class="help-section" v-if="tips && tips.length > 0">
          <h3>提示和技巧</h3>
          <ul class="tips-list">
            <li v-for="(tip, index) in tips" :key="index">
              <span class="tip-icon">💡</span>
              <span class="tip-content">{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 模态框底部 -->
      <div class="modal-footer">
        <button class="close-btn-primary" @click="close">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelpModal",
  props: {
    // 是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 工具标题
    title: {
      type: String,
      default: "工具帮助"
    },
    // 工具描述
    description: {
      type: String,
      default: ""
    },
    // 使用步骤
    usageSteps: {
      type: Array,
      default: () => []
    },
    // 快捷键
    shortcuts: {
      type: Array,
      default: () => []
    },
    // 提示和技巧
    tips: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 关闭模态框
    close() {
      this.$emit("update:visible", false)
    }
  }
}
</script>

<style scoped>
/* 帮助模态框覆盖层 */
.help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  overflow-y: auto;
  padding: 20px;
}

/* 帮助模态框内容 */
.help-modal-content {
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px var(--shadow-color);
  display: flex;
  flex-direction: column;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: var(--secondary-bg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

/* 模态框主体 */
.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

/* 帮助部分 */
.help-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.help-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.help-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.help-section p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 使用步骤列表 */
.usage-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.usage-steps li {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.step-number {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 2px;
}

.step-content {
  flex: 1;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 快捷键网格 */
.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--secondary-bg);
  padding: 12px;
  border-radius: var(--border-radius);
}

.shortcut-key {
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.shortcut-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 提示列表 */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tips-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--secondary-bg);
  padding: 12px;
  border-radius: var(--border-radius);
}

.tip-icon {
  flex-shrink: 0;
  font-size: 1.2rem;
  margin-top: 2px;
}

.tip-content {
  flex: 1;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 30px;
  border-top: 1px solid var(--border-color);
  background: var(--secondary-bg);
}

/* 底部关闭按钮 */
.close-btn-primary {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn-primary:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-modal-overlay {
    padding: 10px;
  }
  
  .help-modal-content {
    margin: 0;
    max-height: calc(100vh - 20px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  /* 快捷键网格在移动端改为单列 */
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
  
  /* 使用步骤间距调整 */
  .usage-steps {
    gap: 12px;
  }
  
  .usage-steps li {
    gap: 12px;
  }
}
</style>