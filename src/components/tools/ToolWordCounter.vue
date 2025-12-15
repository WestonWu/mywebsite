<template>
  <div class="word-counter-tool">
    <div class="tool-header">
      <p>统计文本的字数、字符数、单词数等信息</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="word-counter-input">输入文本</label>
          <textarea
            id="word-counter-input"
            v-model="wordCounterInput"
            placeholder="请输入要统计的文本..."
            class="text-input"
            @input="countWords"
          ></textarea>
        </div>
      </div>

      <!-- 右侧：统计结果区域 -->
      <div class="word-count-result-section">
        <div class="count-results">
          <div class="count-item">
            <div class="count-label">字符数（含空格）</div>
            <div class="count-value">{{ wordCounterResults.charactersWithSpaces }}</div>
          </div>
          <div class="count-item">
            <div class="count-label">字符数（不含空格）</div>
            <div class="count-value">{{ wordCounterResults.charactersWithoutSpaces }}</div>
          </div>
          <div class="count-item">
            <div class="count-label">单词数</div>
            <div class="count-value">{{ wordCounterResults.words }}</div>
          </div>
          <div class="count-item">
            <div class="count-label">行数</div>
            <div class="count-value">{{ wordCounterResults.lines }}</div>
          </div>
          <div class="count-item">
            <div class="count-label">段落数</div>
            <div class="count-value">{{ wordCounterResults.paragraphs }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ToolWordCounter",
  data() {
    return {
      // 字数统计器相关配置
      wordCounterInput: "", // 输入文本
      wordCounterResults: {
        charactersWithSpaces: 0, // 字符数（含空格）
        charactersWithoutSpaces: 0, // 字符数（不含空格）
        words: 0, // 单词数
        lines: 0, // 行数
        paragraphs: 0, // 段落数
      },
    }
  },
  methods: {
    // 字数统计功能
    countWords() {
      const text = this.wordCounterInput

      // 字符数（含空格）
      const charactersWithSpaces = text.length

      // 字符数（不含空格）
      const charactersWithoutSpaces = text.replace(/\s/g, "").length

      // 单词数：按空格分割，过滤空字符串
      const words = text.trim() ? text.trim().split(/\s+/).length : 0

      // 行数：按换行符分割，过滤空行
      const lines = text ? text.split(/\r?\n/).filter((line) => line.trim() !== "").length : 0

      // 段落数：按两个或更多换行符分割，过滤空段落
      const paragraphs = text ? text.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim() !== "").length : 0

      this.wordCounterResults = {
        charactersWithSpaces,
        charactersWithoutSpaces,
        words,
        lines,
        paragraphs,
      }
    },
  },
}
</script>

<style scoped>
/* 字数统计器工具样式 */
.word-counter-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

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
  height: calc(100% - 60px);
}

/* 文本输入区域 */
.text-input-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 统计结果区域 */
.word-count-result-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 选项组 */
.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 文本输入区域 */
.text-input {
  width: 100%;
  height: 100%;
  padding: 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 统计结果 */
.count-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

/* 统计项 */
.count-item {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 15px;
  transition: all 0.3s ease;
}

.count-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 统计标签 */
.count-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

/* 统计值 */
.count-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: "Courier New", Courier, monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .text-input {
    height: 200px;
  }

  .count-results {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .count-value {
    font-size: 1.4rem;
  }
}
</style>
