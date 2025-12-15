<template>
  <div class="tools-container">
    <div class="tools-header">
      <h1>实用工具</h1>
      <p>提供各种实用工具，方便日常使用</p>
    </div>

    <!-- 搜索和分类 -->
    <div class="tools-filters">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="搜索工具..." class="search-input" />
      </div>

      <!-- 分类标签页 -->
      <div class="category-tabs">
        <div
          v-for="category in categories"
          :key="category.id"
          :class="['category-tab', { active: selectedCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <div class="tools-grid">
      <!-- 工具卡片 -->
      <div
        v-for="tool in filteredTools"
        :key="tool.id"
        :class="['tool-card', { active: selectedToolId === tool.id }]"
        @click="openToolModal(tool.id)"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </div>
      <!-- 没有找到工具的提示 -->
      <div v-if="filteredTools.length === 0" class="no-tools">
        <div class="no-tools-icon">🔍</div>
        <h3>没有找到匹配的工具</h3>
        <p>请尝试调整搜索词或选择其他分类</p>
      </div>
    </div>

    <!-- 工具模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeToolModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedToolId ? tools.find((tool) => tool.id === selectedToolId)?.name : "工具" }}</h2>
          <button class="modal-close" @click="closeToolModal">✕</button>
        </div>
        <div class="modal-body">
          <!-- 动态工具组件 -->
          <component :is="currentToolComponent" v-if="currentToolComponent"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent, onMounted } from "vue"
import CustomSelect from "../components/CustomSelect.vue"

export default {
  name: "ToolsView",
  components: {
    CustomSelect,
  },
  data() {
    return {
      // 分类列表
      categories: [
        { id: "all", name: "全部", icon: "🔍" },
        { id: "text", name: "文本工具", icon: "📝" },
        { id: "encoding", name: "编码工具", icon: "🔢" },
        { id: "date", name: "日期工具", icon: "📅" },
        { id: "color", name: "颜色工具", icon: "🎨" },
        { id: "converter", name: "转换工具", icon: "🔄" },
      ],
      // 工具列表
      tools: [
        {
          id: "qr-code",
          name: "URL 转二维码",
          description: "将网址转换为可下载的二维码",
          icon: "📱",
          category: "converter",
        },
        {
          id: "text-case",
          name: "文本转大小写",
          description: "将文本转换为大写、小写或首字母大写",
          icon: "🔤",
          category: "text",
        },
        {
          id: "word-counter",
          name: "字数统计器",
          description: "统计文本的字数、字符数、单词数等信息",
          icon: "📊",
          category: "text",
        },
      ],
      selectedToolId: "qr-code", // 默认选中URL转二维码工具
      selectedCategory: "all", // 默认显示全部工具
      searchQuery: "", // 搜索查询
      showModal: false, // 模态框显示状态
      // 动态组件映射
      toolComponents: {
        "qr-code": defineAsyncComponent(() => import("../components/tools/ToolQrCode.vue")),
        "text-case": defineAsyncComponent(() => import("../components/tools/ToolTextCase.vue")),
        "word-counter": defineAsyncComponent(() => import("../components/tools/ToolWordCounter.vue")),
      },
    }
  },
  computed: {
    // 筛选后的工具列表
    filteredTools() {
      let filtered = this.tools

      // 分类筛选
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((tool) => tool.category === this.selectedCategory)
      }

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (tool) => tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query)
        )
      }

      return filtered
    },
    // 当前工具组件
    currentToolComponent() {
      return this.toolComponents[this.selectedToolId]
    },
  },
  onMounted() {
    // 检查URL参数，实现直接打开工具
    const urlParams = new URLSearchParams(window.location.search)
    const toolId = urlParams.get("tool")
    if (toolId && this.toolComponents[toolId]) {
      this.selectedToolId = toolId
      this.showModal = true
    }
  },
  methods: {
    selectTool(toolId) {
      this.selectedToolId = toolId
    },
    // 分类切换
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    // 打开工具模态框
    openToolModal(toolId) {
      this.selectedToolId = toolId
      this.showModal = true

      // 更新URL参数，实现分享功能
      this.updateUrlParams(toolId)
    },
    // 关闭工具模态框
    closeToolModal() {
      this.showModal = false

      // 移除URL参数
      this.updateUrlParams(null)
    },
    // 更新URL参数
    updateUrlParams(toolId) {
      const url = new URL(window.location)
      if (toolId) {
        url.searchParams.set("tool", toolId)
      } else {
        url.searchParams.delete("tool")
      }
      window.history.pushState({}, "", url)
    },
  },
}
</script>

<style scoped>
/* 保持原有的CSS样式不变 */
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tools-header {
  text-align: center;
  margin-bottom: 30px;
}

.tools-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.tools-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 搜索和分类 */
.tools-filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.search-bar {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--card-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-primary);
}

.category-tab:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.category-tab.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 工具卡片网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* 工具卡片 */
.tool-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.tool-card.active {
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.tool-card h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.tool-card p {
  color: var(--text-secondary);
  margin-bottom: 0;
  font-size: 0.95rem;
}

/* 没有找到工具的提示 */
.no-tools {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.no-tools-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-tools h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.no-tools p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px var(--shadow-color);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
  background: var(--secondary-bg);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  background: var(--primary-bg);
}

/* 工具通用样式 */
.tool-header {
  margin-bottom: 20px;
  text-align: center;
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.tool-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tools-header h1 {
    font-size: 2rem;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .modal-header,
  .modal-body {
    padding: 20px;
  }

  .category-tabs {
    gap: 8px;
  }

  .category-tab {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>
