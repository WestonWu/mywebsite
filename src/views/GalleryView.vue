<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h1>作品图库</h1>
      <p>探索我的创作与设计作品</p>
    </div>

    <!-- 筛选控件 -->
    <div class="filter-controls">
      <div class="filter-inputs">
        <input type="text" v-model="searchQuery" placeholder="搜索作品..." class="search-input" />
        <custom-select v-model="selectedCategory" :options="categories"></custom-select>
      </div>
      <div class="view-toggle">
        <button :class="['view-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">📊 网格视图</button>
        <button :class="['view-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">📋 列表视图</button>
      </div>
    </div>

    <!-- 作品网格/列表 -->
    <div :class="['gallery-grid', { 'list-view': viewMode === 'list' }]" v-if="filteredItems.length > 0">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        :class="['gallery-item', item.category]"
        @click="openModal(item)"
      >
        <div class="gallery-image-container">
          <img :src="item.imageUrl" :alt="item.title" class="gallery-image" loading="lazy" />
          <div class="gallery-overlay">
            <h3>{{ item.title }}</h3>
            <p>{{ item.categoryLabel }}</p>
          </div>
        </div>
        <div class="gallery-item-info">
          <h3>{{ item.title }}</h3>
          <p class="gallery-item-date">{{ item.date }}</p>
          <p class="gallery-item-description">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div class="empty-state" v-else>
      <p>没有找到匹配的作品</p>
      <button @click="resetFilters" class="reset-btn">重置筛选</button>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">上一页</button>
      <span class="page-info"> 第 {{ currentPage }} 页，共 {{ totalPages }} 页 </span>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
    </div>

    <!-- 模态框 -->
    <div v-if="selectedItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-image-container">
          <img :src="selectedItem.imageUrl" :alt="selectedItem.title" class="modal-image" />
        </div>
        <div class="modal-info">
          <h2>{{ selectedItem.title }}</h2>
          <p class="modal-category">{{ selectedItem.categoryLabel }}</p>
          <p class="modal-date">{{ selectedItem.date }}</p>
          <div class="modal-description">
            {{ selectedItem.description }}
          </div>
          <div class="modal-tags">
            <span v-for="tag in selectedItem.tags" :key="tag" class="tag"> #{{ tag }} </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomSelect from "../components/CustomSelect.vue"

export default {
  name: "GalleryView",
  components: {
    CustomSelect,
  },
  data() {
    return {
      searchQuery: "",
      selectedCategory: "all",
      viewMode: "grid",
      currentPage: 1,
      itemsPerPage: 8,
      selectedItem: null,
      // 分类选项
      categories: [
        { value: "all", label: "全部类别" },
        { value: "design", label: "设计" },
        { value: "development", label: "开发" },
        { value: "illustration", label: "插画" },
        { value: "photography", label: "摄影" },
      ],
      galleryItems: [
        {
          id: 1,
          title: "现代品牌标识设计",
          description: "为科技初创公司设计的现代简约品牌标识和视觉系统。",
          imageUrl: "https://picsum.photos/seed/design1/600/400",
          category: "design",
          categoryLabel: "设计",
          date: "2023-06-15",
          tags: ["品牌设计", "标识", "极简"],
        },
        {
          id: 2,
          title: "响应式网站原型",
          description: "为电商平台设计的完整响应式网站原型，包含多种交互效果。",
          imageUrl: "https://picsum.photos/seed/dev1/600/400",
          category: "development",
          categoryLabel: "开发",
          date: "2023-05-22",
          tags: ["前端", "响应式", "交互设计"],
        },
        {
          id: 3,
          title: "自然风景插画集",
          description: "以自然风景为主题的数字插画集，探索色彩与形态的关系。",
          imageUrl: "https://picsum.photos/seed/illustration1/600/400",
          category: "illustration",
          categoryLabel: "插画",
          date: "2023-04-10",
          tags: ["数字艺术", "风景", "色彩理论"],
        },
        {
          id: 4,
          title: "城市建筑摄影",
          description: "城市建筑和几何形态的摄影作品集，捕捉现代都市的美感。",
          imageUrl: "https://picsum.photos/seed/photo1/600/400",
          category: "photography",
          categoryLabel: "摄影",
          date: "2023-03-05",
          tags: ["建筑", "城市", "几何"],
        },
        {
          id: 5,
          title: "移动应用界面设计",
          description: "健康管理应用的用户界面设计，注重用户体验和视觉层次感。",
          imageUrl: "https://picsum.photos/seed/design2/600/400",
          category: "design",
          categoryLabel: "设计",
          date: "2023-02-18",
          tags: ["UI/UX", "移动应用", "健康"],
        },
        {
          id: 6,
          title: "数据可视化仪表板",
          description: "交互式数据分析仪表板，展示复杂数据的直观呈现方式。",
          imageUrl: "https://picsum.photos/seed/dev2/600/400",
          category: "development",
          categoryLabel: "开发",
          date: "2023-01-30",
          tags: ["数据可视化", "仪表板", "交互"],
        },
        {
          id: 7,
          title: "人物肖像插画",
          description: "以人物为主题的插画系列，探索不同风格和表现手法。",
          imageUrl: "https://picsum.photos/seed/illustration2/600/400",
          category: "illustration",
          categoryLabel: "插画",
          date: "2022-12-12",
          tags: ["人物", "肖像", "风格化"],
        },
        {
          id: 8,
          title: "产品摄影系列",
          description: "为家居品牌拍摄的产品摄影，强调材质和光影效果。",
          imageUrl: "https://picsum.photos/seed/photo2/600/400",
          category: "photography",
          categoryLabel: "摄影",
          date: "2022-11-08",
          tags: ["产品", "商业", "光影"],
        },
        {
          id: 9,
          title: "品牌包装设计",
          description: "有机食品品牌的包装设计方案，融合环保理念和视觉吸引力。",
          imageUrl: "https://picsum.photos/seed/design3/600/400",
          category: "design",
          categoryLabel: "设计",
          date: "2022-10-25",
          tags: ["包装", "环保", "品牌"],
        },
        {
          id: 10,
          title: "电子商务平台",
          description: "完整的电子商务网站开发项目，包含前后端功能实现。",
          imageUrl: "https://picsum.photos/seed/dev3/600/400",
          category: "development",
          categoryLabel: "开发",
          date: "2022-09-15",
          tags: ["电商", "全栈", "支付集成"],
        },
        {
          id: 11,
          title: "概念艺术作品",
          description: "科幻主题的概念艺术作品，创造独特的视觉世界。",
          imageUrl: "https://picsum.photos/seed/illustration3/600/400",
          category: "illustration",
          categoryLabel: "插画",
          date: "2022-08-20",
          tags: ["概念艺术", "科幻", "世界观"],
        },
        {
          id: 12,
          title: "旅行摄影集",
          description: "记录世界各地文化和风景的旅行摄影作品集。",
          imageUrl: "https://picsum.photos/seed/photo3/600/400",
          category: "photography",
          categoryLabel: "摄影",
          date: "2022-07-05",
          tags: ["旅行", "文化", "风景"],
        },
      ],
    }
  },
  computed: {
    // 筛选后的作品列表
    filteredItems() {
      let filtered = this.galleryItems

      // 类别筛选
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((item) => item.category === this.selectedCategory)
      }

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      // 分页
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage

      return filtered.slice(startIndex, endIndex)
    },

    // 总页数
    totalPages() {
      let filtered = this.galleryItems

      // 应用类别和搜索筛选以计算总页数
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((item) => item.category === this.selectedCategory)
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      return Math.ceil(filtered.length / this.itemsPerPage)
    },
  },
  methods: {
    // 打开模态框
    openModal(item) {
      this.selectedItem = item
      document.body.style.overflow = "hidden"
    },

    // 关闭模态框
    closeModal() {
      this.selectedItem = null
      document.body.style.overflow = ""
    },

    // 重置筛选
    resetFilters() {
      this.searchQuery = ""
      this.selectedCategory = "all"
      this.currentPage = 1
    },
  },
  watch: {
    // 当筛选条件改变时，重置到第一页
    searchQuery() {
      this.currentPage = 1
    },
    selectedCategory() {
      this.currentPage = 1
    },
  },
  mounted() {
    // 添加键盘事件监听，按ESC键关闭模态框
    document.addEventListener("keydown", this.handleKeydown)
  },
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener("keydown", this.handleKeydown)
    // 确保页面滚动恢复
    document.body.style.overflow = ""
  },
  // 键盘事件处理
  handleKeydown(event) {
    if (event.key === "Escape" && this.selectedItem) {
      this.closeModal()
    }
  },
}
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  /* 移除背景色设置，使用全局背景 */
}

/* 增强所有标题元素的可见性 */
h1,
h2,
h3 {
  color: var(--text-primary) !important;
  opacity: 1 !important;
  font-weight: 700 !important;
}

/* 解决全局样式冲突 - 确保所有文本元素可见 */
.gallery-container p,
.gallery-container span,
.gallery-container div {
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
}

.gallery-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.gallery-header p {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.2rem;
  color: var(--text-primary) !important;
  opacity: 0.95 !important;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  position: relative; /* 添加position: relative */
  z-index: 100; /* 添加z-index确保筛选控件显示在作品图库之上 */
}

.filter-inputs {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
  position: relative; /* 添加position: relative */
  z-index: 200; /* 添加z-index确保筛选输入控件显示在作品图库之上 */
}

/* 增强input元素的可见性 */
.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

.search-input::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.8 !important;
}

/* 自定义下拉列表组件样式由组件内部处理 */

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  opacity: 1;
}

.view-btn:hover {
  border-color: var(--accent-color);
  background: var(--hover-bg);
}

.view-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.gallery-grid.list-view {
  grid-template-columns: 1fr;
}

.gallery-item {
  border-radius: 12px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  opacity: 1;
}

.gallery-grid.list-view .gallery-item {
  flex-direction: row;
  align-items: center;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px var(--shadow-color);
}

.gallery-image-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 200px;
}

.gallery-grid.list-view .gallery-image-container {
  width: 250px;
  height: 150px;
  flex-shrink: 0;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  opacity: 1;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  transform: translateY(0);
}

.gallery-overlay h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: white !important;
  opacity: 1 !important;
}

.gallery-overlay p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  color: white;
}

.gallery-item-info {
  padding: 1.5rem;
}

.gallery-item-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.gallery-item-date {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.gallery-item-description {
  margin: 0;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-state p {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-btn:hover {
  background: var(--accent-color-hover);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-secondary);
}

.page-info {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-primary) !important;
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--accent-color);
}

.modal-image-container {
  width: 100%;
  max-height: 50vh;
  overflow: hidden;
  background: var(--secondary-bg);
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modal-info {
  padding: 2rem;
}

.modal-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.modal-category {
  margin: 0 0 0.5rem 0;
  padding: 0.25rem 0.75rem;
  background: var(--accent-color);
  color: white;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.9rem;
}

.modal-date {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  font-size: 1rem;
}

.modal-description {
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--hover-bg);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color);
  opacity: 1 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gallery-container {
    padding: 1rem;
  }

  .gallery-header {
    margin-bottom: 2rem;
  }

  /* 完全移除这些行，保持与ProjectsView一致 */
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-inputs {
    flex-direction: column;
    min-width: auto;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid.list-view .gallery-item {
    flex-direction: column;
  }

  .gallery-grid.list-view .gallery-image-container {
    width: 100%;
    height: 200px;
  }

  .modal-content {
    margin: 1rem;
  }

  .modal-info {
    padding: 1.5rem;
  }

  .modal-info h2 {
    font-size: 1.5rem;
  }
}
</style>

<!-- 组件特定样式，只影响GalleryView组件 -->
<style scoped>
/* 确保所有内容元素都有合适的z-index */
.gallery-header,
.gallery-grid,
.empty-state,
.pagination,
.modal-overlay {
  position: relative;
  z-index: 10;
  /* 为内容元素设置合适的z-index，确保它们显示在背景之上 */
}

/* 确保筛选控件的z-index足够高，不会被其他元素覆盖 */
.filter-controls {
  position: relative;
  z-index: 1000;
}
</style>
