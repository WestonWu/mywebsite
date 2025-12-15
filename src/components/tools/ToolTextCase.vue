<template>
  <div class="text-case-tool">
    <div class="tool-header">
      <p>将文本转换为大写、小写或首字母大写</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="text-case-input">输入文本</label>
          <textarea
            id="text-case-input"
            v-model="textCaseInput"
            placeholder="请输入要转换的文本..."
            class="text-input"
            @input="convertTextCase"
          ></textarea>
        </div>

        <div class="option-group">
          <label>转换选项</label>
          <div class="conversion-options">
            <label class="radio-label">
              <input type="radio" v-model="textCaseOption" value="uppercase" @change="convertTextCase" />
              <span>大写</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="textCaseOption" value="lowercase" @change="convertTextCase" />
              <span>小写</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="textCaseOption" value="capitalize" @change="convertTextCase" />
              <span>首字母大写</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="text-output-section">
        <div class="option-group">
          <div class="output-header">
            <label>转换结果</label>
            <button class="copy-btn" @click="copyTextCaseOutput" :disabled="!textCaseOutput">复制</button>
          </div>
          <textarea
            v-model="textCaseOutput"
            placeholder="转换结果将显示在这里..."
            class="text-output"
            readonly
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from "../../composables/useToolUtils"

export default {
  name: "ToolTextCase",
  setup() {
    const { copyToClipboard } = useToolUtils()

    return {
      copyToClipboard,
    }
  },
  data() {
    return {
      // 文本转大小写相关配置
      textCaseInput: "", // 输入文本
      textCaseOutput: "", // 输出文本
      textCaseOption: "uppercase", // 转换选项：uppercase, lowercase, capitalize
    }
  },
  methods: {
    // 文本转大小写功能
    convertTextCase() {
      if (!this.textCaseInput) {
        this.textCaseOutput = ""
        return
      }

      switch (this.textCaseOption) {
        case "uppercase":
          this.textCaseOutput = this.textCaseInput.toUpperCase()
          break
        case "lowercase":
          this.textCaseOutput = this.textCaseInput.toLowerCase()
          break
        case "capitalize":
          this.textCaseOutput = this.textCaseInput
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
          break
        default:
          this.textCaseOutput = this.textCaseInput
      }
    },
    // 复制转换后的文本
    copyTextCaseOutput() {
      this.copyToClipboard(this.textCaseOutput).then((success) => {
        if (success) {
          console.log("文本已复制到剪贴板")
          // 可以添加复制成功的提示
        }
      })
    },
  },
}
</script>

<style scoped>
/* 文本转大小写工具样式 */
.text-case-tool {
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
  gap: 20px;
}

/* 文本输出区域 */
.text-output-section {
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
.text-input,
.text-output {
  width: 100%;
  height: 200px;
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

.text-output {
  background: var(--secondary-bg);
  cursor: default;
}

/* 转换选项 */
.conversion-options {
  display: flex;
  gap: 20px;
}

/* 单选按钮标签 */
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.radio-label:hover {
  color: var(--accent-color);
}

/* 输出头部 */
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 复制按钮 */
.copy-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .text-input,
  .text-output {
    height: 150px;
  }

  .conversion-options {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
