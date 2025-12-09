<template>
  <div class="tools-container">
    <div class="tools-header">
      <h1>实用工具</h1>
      <p>提供各种实用工具，方便日常使用</p>
    </div>

    <div class="tools-grid">
      <!-- 工具卡片 -->
      <div
        v-for="tool in tools"
        :key="tool.id"
        :class="['tool-card', { active: selectedToolId === tool.id }]"
        @click="selectTool(tool.id)"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </div>
    </div>

    <!-- 工具内容区域 -->
    <div class="tool-content">
      <!-- URL 转二维码工具 -->
      <div v-if="selectedToolId === 'qr-code'" class="qr-tool">
        <div class="qr-tool-header">
          <h2>URL 转二维码</h2>
          <p>输入网址，生成可下载的二维码</p>
        </div>

        <div class="qr-tool-body">
          <div class="qr-input-section">
            <label for="url-input">输入 URL</label>
            <input
              type="url"
              id="url-input"
              v-model="urlInput"
              placeholder="https://example.com"
              class="url-input"
              @input="generateQRCode"
            />
            <div class="qr-options">
              <div class="option-group">
                <label for="qr-size">二维码大小</label>
                <input
                  type="range"
                  id="qr-size"
                  v-model.number="qrSize"
                  min="200"
                  max="500"
                  step="50"
                  @input="generateQRCode"
                />
                <span>{{ qrSize }}px</span>
              </div>
              <div class="option-group">
                <label for="error-correction">纠错级别</label>
                <custom-select
                  v-model="errorCorrection"
                  :options="errorCorrectionOptions"
                  @update:modelValue="generateQRCode"
                ></custom-select>
              </div>
            </div>
          </div>

          <div class="qr-result-section">
            <div class="qr-preview" ref="qrPreview"></div>
            <div class="qr-actions">
              <button class="download-btn" @click="downloadQRCode" :disabled="!urlInput">📥 下载二维码</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具未选择提示 -->
      <div v-else class="tool-placeholder">
        <div class="placeholder-icon">🔧</div>
        <h3>请选择一个工具</h3>
        <p>从上方选择一个工具开始使用</p>
      </div>
    </div>
  </div>
</template>

<script>
import QRCodeStyling from "qr-code-styling"
import CustomSelect from "../components/CustomSelect.vue"

export default {
  name: "ToolsView",
  components: {
    CustomSelect,
  },
  data() {
    return {
      // 工具列表
      tools: [
        {
          id: "qr-code",
          name: "URL 转二维码",
          description: "将网址转换为可下载的二维码",
          icon: "📱",
        },
      ],
      selectedToolId: "qr-code", // 默认选中URL转二维码工具
      // URL转二维码相关配置
      urlInput: "https://example.com", // 默认URL示例
      qrSize: 300,
      errorCorrection: "Q",
      errorCorrectionOptions: [
        { value: "L", label: "低 (L)" },
        { value: "M", label: "中 (M)" },
        { value: "Q", label: "较高 (Q)" },
        { value: "H", label: "高 (H)" },
      ],
      qrCode: null,
    }
  },
  methods: {
    selectTool(toolId) {
      this.selectedToolId = toolId
    },
    generateQRCode() {
      if (!this.urlInput) {
        return
      }

      // 清除之前的二维码
      const preview = this.$refs.qrPreview
      if (preview) {
        preview.innerHTML = ""
      }

      // 创建新的二维码实例
      this.qrCode = new QRCodeStyling({
        width: this.qrSize,
        height: this.qrSize,
        type: "svg",
        data: this.urlInput,
        qrOptions: {
          errorCorrectionLevel: this.errorCorrection,
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
        },
        dotsOptions: {
          color: "#000000",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
        },
      })

      // 渲染二维码
      this.qrCode.append(preview)
    },
    downloadQRCode() {
      if (this.qrCode) {
        this.qrCode.download({
          name: "qrcode",
          extension: "png",
        })
      }
    },
  },
  mounted() {
    // 初始生成二维码（使用默认URL）
    this.generateQRCode()
  },
}
</script>

<style scoped>
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tools-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tools-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.tools-header p {
  font-size: 1.2rem;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  max-width: 600px;
  margin: 0 auto;
}

/* 工具卡片网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tool-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px var(--shadow-color);
  border-color: var(--accent-color);
}

.tool-card.active {
  border-color: var(--accent-color);
  background: var(--hover-bg);
  box-shadow: 0 0 0 2px var(--accent-color), 0 8px 24px var(--shadow-color);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tool-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.tool-card p {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 工具内容区域 */
.tool-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px var(--shadow-color);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* URL 转二维码工具样式 */
.qr-tool {
  width: 100%;
  max-width: 800px;
}

.qr-tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.qr-tool-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.qr-tool-header p {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.qr-tool-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .qr-tool-body {
    flex-direction: row;
    align-items: flex-start;
  }
}

.qr-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qr-input-section label {
  font-weight: 600;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.url-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

.url-input::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.8 !important;
}

.qr-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 500;
  font-size: 0.95rem;
}

.option-group input[type="range"] {
  width: 100%;
  accent-color: var(--accent-color);
}

.option-group select {
  padding: 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  font-size: 0.95rem;
}

.option-group select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.option-group span {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  font-size: 0.9rem;
  text-align: center;
}

.qr-result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.qr-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  background: var(--hover-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.qr-actions {
  display: flex;
  gap: 1rem;
}

.download-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1 !important;
}

.download-btn:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.download-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed;
  transform: none;
}

/* 工具未选择提示 */
.tool-placeholder {
  text-align: center;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.tool-placeholder h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 1 !important;
}

.tool-placeholder p {
  font-size: 1rem;
  opacity: 0.8 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tools-container {
    padding: 1rem;
  }

  .tools-header {
    margin-bottom: 2rem;
  }

  .tools-header h1 {
    font-size: 2rem;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tool-content {
    padding: 1.5rem;
  }

  .qr-tool-body {
    flex-direction: column;
  }

  .qr-input-section {
    width: 100%;
  }

  .qr-preview {
    max-width: 100%;
  }
}
</style>
