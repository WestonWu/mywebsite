<template>
  <div class="blog-post-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="post" class="post-content">
      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="post-author">作者：{{ post.author }}</span>
          <span class="post-date">发布时间：{{ post.publishDate }}</span>
          <span class="post-categories">分类：{{ post.category }}</span>
        </div>
      </div>

      <div class="featured-image-container">
        <img :src="post.featuredImage" :alt="post.title" class="featured-image" />
      </div>

      <div class="post-body" v-html="renderContent(post.content)"></div>

      <div class="post-actions">
        <button class="action-btn like-btn" @click="toggleLike">
          <i class="icon-heart" :class="{ liked: isLiked }"></i>
          <span>{{ likesCount }} 点赞</span>
        </button>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3 class="comments-title">评论 ({{ comments.length }})</h3>
        
        <div class="comment-input-container">
          <textarea v-model="newComment" placeholder="写下你的评论..." class="comment-input"></textarea>
          <button @click="submitComment" class="submit-comment-btn" :disabled="!newComment.trim()">
            发表评论
          </button>
        </div>

        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-date">{{ comment.date }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
              <button class="comment-action-btn like" @click="toggleCommentLike(comment.id)">
                <i class="icon-heart" :class="{ liked: comment.liked }"></i>
                <span>{{ comment.likes }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未找到文章 -->
    <div v-else class="not-found">
      <h2>文章未找到</h2>
      <p>抱歉，您请求的文章不存在。</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'BlogPostView',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const route = useRoute();
    const postId = props.id || route.params.id;
    
    const post = ref(null);
    const loading = ref(false);
    const comments = ref([]);
    const newComment = ref('');
    const isLiked = ref(false);
    const likesCount = ref(0);
    
    // 模拟博客文章数据
    const blogPosts = [
      {
        id: 1,
        title: 'Vue 3 Composition API 实战指南',
        content: '# Vue 3 Composition API 实战指南\n\nVue 3 的 Composition API 提供了一种更灵活的方式来组织和重用组件逻辑。',
        category: '前端开发',
        publishDate: '2023-06-15',
        author: '我',
        featuredImage: 'https://picsum.photos/seed/vue3/800/400',
        comments: 89
      },
      {
        id: 2,
        title: '现代前端工程化实践指南',
        content: '# 现代前端工程化实践指南\n\n随着前端技术的快速发展，工程化已经成为大型前端项目的必备条件。',
        category: '工程化',
        publishDate: '2023-05-20',
        author: '我',
        featuredImage: 'https://picsum.photos/seed/engineering/800/400',
        comments: 67
      },
      {
        id: 6,
        title: '设计系统建设指南',
        content: '# 设计系统建设指南\n\n设计系统是一套统一的设计语言和组件库，可以帮助团队更高效地协作。',
        category: '设计',
        publishDate: '2023-01-18',
        author: '我',
        featuredImage: 'https://picsum.photos/seed/designsystem/800/400',
        comments: 37
      }
    ];

    // 模拟评论数据
    const mockComments = [
      {
        id: 1,
        author: '张三',
        text: '这篇文章写得非常好！',
        date: '2023-06-16',
        likes: 15,
        liked: false
      },
      {
        id: 2,
        author: '李四',
        text: '学习到了很多知识。',
        date: '2023-06-17',
        likes: 8,
        liked: false
      }
    ];

    // 获取文章数据
    const fetchPost = async () => {
      loading.value = true;
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 从模拟数据中查找文章
        const foundPost = blogPosts.find(p => p.id === parseInt(postId));
        
        if (foundPost) {
          post.value = foundPost;
          comments.value = [...mockComments];
          likesCount.value = foundPost.comments;
        }
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 切换点赞状态
    const toggleLike = () => {
      isLiked.value = !isLiked.value;
      likesCount.value += isLiked.value ? 1 : -1;
    };

    // 提交评论
    const submitComment = () => {
      if (!newComment.value.trim()) return;
      
      const newCommentObj = {
        id: Date.now(),
        author: '我',
        text: newComment.value.trim(),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        liked: false
      };
      
      comments.value.unshift(newCommentObj);
      newComment.value = '';
    };

    // 切换评论点赞
    const toggleCommentLike = (commentId) => {
      const commentIndex = comments.value.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        comments.value[commentIndex].liked = !comments.value[commentIndex].liked;
        comments.value[commentIndex].likes += comments.value[commentIndex].liked ? 1 : -1;
      }
    };

    // 渲染文章内容
    const renderContent = (content) => {
      let html = content
        .replace(/#\s+(.*?)$/gm, '<h1>$1</h1>')
        .replace(/^(?!<h)(.*?)$/gm, '<p>$1</p>');
      
      return html;
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchPost();
    });

    return {
      post,
      loading,
      comments,
      newComment,
      isLiked,
      likesCount,
      toggleLike,
      submitComment,
      toggleCommentLike,
      renderContent
    };
  }
};
</script>

<style scoped>
.blog-post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a6cf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.post-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  font-size: 2em;
  margin-bottom: 15px;
  color: #333333;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #666666;
}

.featured-image-container {
  margin-bottom: 25px;
  border-radius: 6px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: auto;
  display: block;
}

.post-body {
  line-height: 1.7;
  color: #333333;
  margin-bottom: 30px;
}

.post-body h1 {
  font-size: 1.5em;
  margin: 1.5em 0 0.8em;
  color: #222222;
}

.post-body p {
  margin-bottom: 1em;
}

.post-actions {
  margin-bottom: 30px;
  padding: 15px 0;
  border-top: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #dddddd;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #f8f9fa;
  border-color: #4a6cf7;
}

.comments-section {
  margin-bottom: 20px;
}

.comments-title {
  font-size: 1.3em;
  margin-bottom: 15px;
  color: #333333;
}

.comment-input-container {
  margin-bottom: 25px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.submit-comment-btn {
  margin-top: 10px;
  padding: 8px 20px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  float: right;
}

.submit-comment-btn:hover:not(:disabled) {
  background-color: #3a5ce7;
}

.submit-comment-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.comment-author {
  font-weight: 600;
  color: #333333;
}

.comment-date {
  color: #999999;
}

.comment-text {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #333333;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666666;
  font-size: 0.85em;
}

.comment-action-btn:hover {
  color: #4a6cf7;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
  color: #666666;
}

.not-found h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: #333333;
}

@media (max-width: 600px) {
  .blog-post-container {
    padding: 10px;
  }
  
  .post-content {
    padding: 20px;
  }
  
  .post-title {
    font-size: 1.6em;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>