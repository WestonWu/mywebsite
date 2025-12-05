<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1>博客文章</h1>
      <p>分享我的想法、经验和技术见解</p>
    </div>

    <!-- 筛选和搜索控件 -->
    <div class="filter-controls">
      <div class="search-section">
        <input type="text" v-model="searchQuery" placeholder="搜索文章标题或内容..." class="search-input" />
        <custom-select v-model="selectedCategory" :options="categories"></custom-select>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="blog-list" v-if="paginatedPosts.length > 0">
      <article v-for="post in paginatedPosts" :key="post.id" class="blog-post-card">
        <div class="post-image-container">
          <img :src="post.featuredImage" :alt="post.title" class="post-image" loading="lazy" />
        </div>
        <div class="post-content">
          <div class="post-meta">
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ post.publishDate }}</span>
          </div>
          <h2 class="post-title">
            <router-link :to="{ name: 'blogPost', params: { id: post.id } }">
              {{ post.title }}
            </router-link>
          </h2>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <div class="post-footer">
            <div class="post-stats">
              <span class="post-views">{{ post.views }} 阅读</span>
              <span class="post-comments">{{ post.comments }} 评论</span>
            </div>
            <router-link :to="{ name: 'blogPost', params: { id: post.id } }" class="read-more-btn">
              阅读更多 →
            </router-link>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <p>没有找到匹配的文章</p>
      <button @click="resetFilters" class="reset-btn">重置筛选</button>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">上一页</button>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
    </div>
  </div>
</template>

<script>
import CustomSelect from "../components/CustomSelect.vue"

export default {
  name: "BlogView",
  components: {
    CustomSelect,
  },
  data() {
    return {
      searchQuery: "",
      selectedCategory: "all",
      currentPage: 1,
      postsPerPage: 5,
      // 分类选项
      categories: [
        { value: "all", label: "全部分类" },
        { value: "技术", label: "技术" },
        { value: "设计", label: "设计" },
        { value: "经验分享", label: "经验分享" },
        { value: "行业动态", label: "行业动态" },
      ],
      blogPosts: [
        {
          id: 1,
          title: "Vue 3 Composition API 完全指南",
          excerpt: "深入探索 Vue 3 Composition API 的核心概念、使用方法以及与 Options API 的对比分析。",
          category: "技术",
          publishDate: "2023-06-15",
          views: 1245,
          comments: 89,
          featuredImage: "https://picsum.photos/seed/vue3/800/400",
        },
        {
          id: 2,
          title: "TypeScript 进阶技巧与最佳实践",
          excerpt: "分享 TypeScript 高级特性、类型系统和在大型项目中的应用实践。",
          category: "技术",
          publishDate: "2023-05-20",
          views: 987,
          comments: 67,
          featuredImage: "https://picsum.photos/seed/typescript/800/400",
        },
        {
          id: 6,
          title: "设计系统建设指南：从规划到落地",
          excerpt: "详细介绍如何规划、设计和实现一个成功的设计系统，提升团队协作效率和产品一致性。",
          category: "设计",
          publishDate: "2023-01-18",
          views: 932,
          comments: 37,
          featuredImage: "https://picsum.photos/seed/designsystem/800/400",
        },
        {
          id: 5,
          title: "2023年前端开发趋势预测",
          excerpt: "分析当前前端技术发展趋势，预测2023年可能流行的前端技术和工具。",
          category: "行业动态",
          publishDate: "2023-02-05",
          views: 1123,
          comments: 45,
          featuredImage: "https://picsum.photos/seed/trends/800/400",
        },
      ],
    }
  },
  computed: {
    // 筛选后的文章列表
    filteredPosts() {
      let filtered = [...this.blogPosts]

      // 按分类筛选
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((post) => post.category === this.selectedCategory)
      }

      // 按搜索关键词筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (post) => post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query)
        )
      }

      // 按日期排序（最新的在前）
      filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))

      return filtered
    },

    // 分页后的文章
    paginatedPosts() {
      const startIndex = (this.currentPage - 1) * this.postsPerPage
      const endIndex = startIndex + this.postsPerPage
      return this.filteredPosts.slice(startIndex, endIndex)
    },

    // 总页数
    totalPages() {
      return Math.ceil(this.filteredPosts.length / this.postsPerPage)
    },
  },
  methods: {
    // 重置筛选条件
    resetFilters() {
      this.searchQuery = ""
      this.selectedCategory = "all"
      this.currentPage = 1
    },
  },
}
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.blog-header {
  text-align: center;
  margin-bottom: 3rem;
}

.blog-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.blog-header p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.filter-controls {
  margin-bottom: 2rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  transition: border-color 0.3s ease;
  background-color: var(--card-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: #4a6cf7;
}

.category-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.category-select:focus {
  outline: none;
  border-color: #4a6cf7;
}

/* 确保下拉选项在暗主题中能正确显示 */
.category-select option {
  background-color: var(--card-bg);
  color: var(--text-primary);
}

/* 针对不同浏览器的下拉列表样式修复 */
.category-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 16px;
  padding-right: 2.5rem;
}

/* 确保下拉列表在所有浏览器中都能正确显示 */
select:not([multiple]) {
  background-color: var(--card-bg) !important;
  color: var(--text-primary) !important;
}

/* 针对Chrome/Safari的下拉列表样式修复 */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  select:not([multiple]) {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }

  select:not([multiple]) option {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }
}

/* 针对Firefox的下拉列表样式修复 */
@-moz-document url-prefix() {
  select:not([multiple]) {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }

  select:not([multiple]) option {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }
}

/* 确保下拉选项在所有情况下都能正确显示 */
select option {
  background-color: var(--card-bg) !important;
  color: var(--text-primary) !important;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 确保下拉列表容器也能正确显示 */
.category-select::-ms-expand {
  background-color: var(--card-bg) !important;
  color: var(--text-primary) !important;
}

/* 修复IE浏览器的下拉列表样式 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  select:not([multiple]) {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }

  select:not([multiple]) option {
    background-color: var(--card-bg) !important;
    color: var(--text-primary) !important;
  }
}

/* 全局修复下拉列表样式，确保在暗主题中能正确显示 */
:root {
  --select-bg: var(--card-bg) !important;
  --select-color: var(--text-primary) !important;
  --select-border: var(--border-color) !important;
}

/* 使用全局选择器确保样式应用到所有下拉列表 */
* select {
  background-color: var(--select-bg) !important;
  color: var(--select-color) !important;
  border-color: var(--select-border) !important;
}

* select option {
  background-color: var(--select-bg) !important;
  color: var(--select-color) !important;
}

/* 确保下拉列表的选项在所有情况下都能正确显示 */
.category-select:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 优化下拉列表的整体样式 */
.category-select {
  transition: all 0.3s ease;
  box-sizing: border-box;
  outline: none;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.blog-post-card {
  display: flex;
  flex-wrap: wrap;
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.blog-post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px var(--shadow-color);
  border-color: rgba(255, 255, 255, 0.15);
}

.post-image-container {
  width: 30%;
  min-width: 300px;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.blog-post-card:hover .post-image {
  transform: scale(1.05);
}

.post-content {
  flex: 1;
  padding: 1.5rem;
  min-width: 300px;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.post-category {
  padding: 0.25rem 0.75rem;
  background-color: var(--hover-bg);
  color: var(--text-primary);
  border-radius: 20px;
  font-weight: 500;
}

.post-date {
  color: var(--text-secondary);
}

.post-title {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  line-height: 1.3;
  color: var(--text-primary);
}

.post-title a {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.post-title a:hover {
  color: #4a6cf7;
}

.post-excerpt {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
  /* Webkit浏览器支持的多行文本截断 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  /* 标准CSS属性 */
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-line-clamp: 3;
  -moz-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  -ms-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 固定高度作为回退方案 */
  max-height: 72px; /* 大约3行文本 */
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.read-more-btn {
  padding: 0.5rem 1rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  background-color: #3a5ce7;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-btn:hover {
  background-color: #3a5ce7;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 3rem 0;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #4a6cf7;
  color: #4a6cf7;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-container {
    padding: 1rem;
  }

  .blog-header h1 {
    font-size: 2.2rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
    min-width: auto;
  }

  .blog-post-card {
    flex-direction: column;
  }

  .post-image-container {
    width: 100%;
    height: 250px;
  }

  .post-title {
    font-size: 1.5rem;
  }
}
</style>
