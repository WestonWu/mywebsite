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
          <!-- 左侧：配置选项 -->
          <div class="qr-config-section">
            <!-- 主选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('main')">
                <h3>主选项</h3>
                <span class="toggle-icon">{{ groups.main ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.main" class="group-content">
                <div class="option-group">
                  <label for="url-input">输入 URL</label>
                  <input
                    type="url"
                    id="url-input"
                    v-model="urlInput"
                    placeholder="https://example.com"
                    class="url-input"
                    @input="generateQRCode"
                  />
                </div>
                <div class="option-row">
                  <div class="option-group">
                    <label for="qr-width">宽度</label>
                    <input
                      type="number"
                      id="qr-width"
                      v-model.number="qrConfig.width"
                      min="100"
                      max="1000"
                      step="50"
                      @input="generateQRCode"
                    />
                    <span>px</span>
                  </div>
                  <div class="option-group">
                    <label for="qr-height">高度</label>
                    <input
                      type="number"
                      id="qr-height"
                      v-model.number="qrConfig.height"
                      min="100"
                      max="1000"
                      step="50"
                      @input="generateQRCode"
                    />
                    <span>px</span>
                  </div>
                </div>
                <div class="option-group">
                  <label for="qr-margin">边距</label>
                  <input
                    type="number"
                    id="qr-margin"
                    v-model.number="qrConfig.margin"
                    min="0"
                    max="100"
                    step="1"
                    @input="generateQRCode"
                  />
                  <span>px</span>
                </div>
                <div class="option-group">
                  <label for="image-upload">图片文件</label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="image-upload"
                  />
                  <button v-if="selectedImage" @click="clearImage" class="clear-btn">清除</button>
                </div>
              </div>
            </div>

            <!-- 点选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('dots')">
                <h3>点选项</h3>
                <span class="toggle-icon">{{ groups.dots ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.dots" class="group-content">
                <div class="option-group">
                  <label for="dots-style">点样式</label>
                  <custom-select
                    v-model="qrConfig.dotsOptions.type"
                    :options="styleOptions"
                    @update:modelValue="generateQRCode"
                  ></custom-select>
                </div>
                <div class="option-group">
                  <label>颜色类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.dotsOptions.colorType"
                        value="single"
                        @change="generateQRCode"
                      />
                      <span>单色</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.dotsOptions.colorType"
                        value="gradient"
                        @change="generateQRCode"
                      />
                      <span>渐变</span>
                    </label>
                  </div>
                </div>
                <div class="option-group">
                  <label for="dots-color">点颜色</label>
                  <input
                    type="color"
                    id="dots-color"
                    v-model="qrConfig.dotsOptions.color"
                    @input="generateQRCode"
                    class="color-input"
                  />
                </div>
              </div>
            </div>

            <!-- 角方块选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('cornersSquare')">
                <h3>角方块选项</h3>
                <span class="toggle-icon">{{ groups.cornersSquare ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.cornersSquare" class="group-content">
                <div class="option-group">
                  <label for="corners-square-style">角方块样式</label>
                  <custom-select
                    v-model="qrConfig.cornersSquareOptions.type"
                    :options="styleOptions"
                    @update:modelValue="generateQRCode"
                  ></custom-select>
                </div>
                <div class="option-group">
                  <label>颜色类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersSquareOptions.colorType"
                        value="single"
                        @change="generateQRCode"
                      />
                      <span>单色</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersSquareOptions.colorType"
                        value="gradient"
                        @change="generateQRCode"
                      />
                      <span>渐变</span>
                    </label>
                  </div>
                </div>
                <div class="option-group">
                  <label for="corners-square-color">角方块颜色</label>
                  <input
                    type="color"
                    id="corners-square-color"
                    v-model="qrConfig.cornersSquareOptions.color"
                    @input="generateQRCode"
                    class="color-input"
                  />
                </div>
              </div>
            </div>

            <!-- 角点选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('cornersDot')">
                <h3>角点选项</h3>
                <span class="toggle-icon">{{ groups.cornersDot ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.cornersDot" class="group-content">
                <div class="option-group">
                  <label for="corners-dot-style">角点样式</label>
                  <custom-select
                    v-model="qrConfig.cornersDotOptions.type"
                    :options="cornerDotStyleOptions"
                    @update:modelValue="generateQRCode"
                  ></custom-select>
                </div>
                <div class="option-group">
                  <label>颜色类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersDotOptions.colorType"
                        value="single"
                        @change="generateQRCode"
                      />
                      <span>单色</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersDotOptions.colorType"
                        value="gradient"
                        @change="generateQRCode"
                      />
                      <span>渐变</span>
                    </label>
                  </div>
                </div>
                <div class="option-group">
                  <label for="corners-dot-color">角点颜色</label>
                  <input
                    type="color"
                    id="corners-dot-color"
                    v-model="qrConfig.cornersDotOptions.color"
                    @input="generateQRCode"
                    class="color-input"
                  />
                </div>
              </div>
            </div>

            <!-- 背景选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('background')">
                <h3>背景选项</h3>
                <span class="toggle-icon">{{ groups.background ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.background" class="group-content">
                <div class="option-group">
                  <label>颜色类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.backgroundOptions.colorType"
                        value="single"
                        @change="generateQRCode"
                      />
                      <span>单色</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.backgroundOptions.colorType"
                        value="gradient"
                        @change="generateQRCode"
                      />
                      <span>渐变</span>
                    </label>
                  </div>
                </div>
                <div class="option-group">
                  <label for="background-color">背景颜色</label>
                  <input
                    type="color"
                    id="background-color"
                    v-model="qrConfig.backgroundOptions.color"
                    @input="generateQRCode"
                    class="color-input"
                  />
                </div>
              </div>
            </div>

            <!-- 图片选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('image')">
                <h3>图片选项</h3>
                <span class="toggle-icon">{{ groups.image ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.image" class="group-content">
                <div class="option-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model="qrConfig.imageOptions.hideBackgroundDots"
                      @change="generateQRCode"
                    />
                    <span>隐藏背景点</span>
                  </label>
                </div>
                <div class="option-row">
                  <div class="option-group">
                    <label for="image-size">图片大小</label>
                    <input
                      type="range"
                      id="image-size"
                      v-model.number="qrConfig.imageOptions.imageSize"
                      min="0.1"
                      max="0.8"
                      step="0.1"
                      @input="generateQRCode"
                    />
                    <span>{{ qrConfig.imageOptions.imageSize.toFixed(1) }}</span>
                  </div>
                  <div class="option-group">
                    <label for="image-margin">图片边距</label>
                    <input
                      type="number"
                      id="image-margin"
                      v-model.number="qrConfig.imageOptions.margin"
                      min="0"
                      max="20"
                      step="1"
                      @input="generateQRCode"
                    />
                    <span>px</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- QR选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('qr')">
                <h3>QR选项</h3>
                <span class="toggle-icon">{{ groups.qr ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.qr" class="group-content">
                <div class="option-row">
                  <div class="option-group">
                    <label for="type-number">类型编号</label>
                    <input
                      type="number"
                      id="type-number"
                      v-model.number="qrConfig.qrOptions.typeNumber"
                      min="0"
                      max="40"
                      step="1"
                      @input="generateQRCode"
                    />
                  </div>
                  <div class="option-group">
                    <label for="qr-mode">模式</label>
                    <custom-select
                      v-model="qrConfig.qrOptions.mode"
                      :options="qrModeOptions"
                      @update:modelValue="generateQRCode"
                    ></custom-select>
                  </div>
                </div>
                <div class="option-group">
                  <label for="error-correction">纠错级别</label>
                  <custom-select
                    v-model="qrConfig.qrOptions.errorCorrectionLevel"
                    :options="errorCorrectionOptions"
                    @update:modelValue="generateQRCode"
                  ></custom-select>
                </div>
              </div>
            </div>

            <!-- 导出选项 -->
            <div class="qr-options-group">
              <div class="group-header" @click="toggleGroup('export')">
                <h3>导出选项</h3>
                <span class="toggle-icon">{{ groups.export ? "▼" : "▶" }}</span>
              </div>
              <div v-if="groups.export" class="group-content">
                <div class="option-group">
                  <label for="download-format">下载格式</label>
                  <custom-select v-model="downloadFormat" :options="downloadFormatOptions"></custom-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：预览和操作 -->
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
      // 选项组折叠状态
      groups: {
        main: true,
        dots: true,
        cornersSquare: true,
        cornersDot: true,
        background: true,
        image: true,
        qr: true,
        export: true,
      },
      // 下载格式选项
      downloadFormatOptions: [
        { value: "png", label: "PNG" },
        { value: "jpeg", label: "JPEG" },
      ],
      // 样式选项
      styleOptions: [
        { value: "rounded", label: "圆角" },
        { value: "dots", label: "圆点" },
        { value: "classy", label: "优雅" },
        { value: "classy-rounded", label: "优雅圆角" },
        { value: "square", label: "方形" },
        { value: "extra-rounded", label: "超圆角" },
      ],
      // 角点样式选项（包含none选项）
      cornerDotStyleOptions: [
        { value: "none", label: "无" },
        { value: "dot", label: "圆点" },
        { value: "square", label: "方形" },
        { value: "rounded", label: "圆角" },
        { value: "classy", label: "优雅" },
        { value: "classy-rounded", label: "优雅圆角" },
        { value: "extra-rounded", label: "超圆角" },
      ],
      // QR模式选项
      qrModeOptions: [
        { value: "Numeric", label: "数字" },
        { value: "Alphanumeric", label: "字母数字" },
        { value: "Byte", label: "字节" },
        { value: "Kanji", label: "汉字" },
      ],
      // URL转二维码相关配置
      urlInput: "https://example.com", // 默认URL示例
      selectedImage: null,
      downloadFormat: "png",
      // 完整的二维码配置
      qrConfig: {
        width: 300,
        height: 300,
        margin: 0,
        // 点选项
        dotsOptions: {
          color: "#000000",
          type: "extra-rounded",
          colorType: "single", // single or gradient
        },
        // 角方块选项
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
          colorType: "single",
        },
        // 角点选项
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
          colorType: "single",
        },
        // 背景选项
        backgroundOptions: {
          color: "#ffffff",
          colorType: "single",
        },
        // 图片选项
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
        },
        // QR选项
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q",
        },
      },
      qrCode: null,
    }
  },
  methods: {
    selectTool(toolId) {
      this.selectedToolId = toolId
    },
    // 切换选项组折叠状态
    toggleGroup(groupName) {
      this.groups[groupName] = !this.groups[groupName]
    },
    // 处理图片上传
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImage = e.target.result
          this.generateQRCode()
        }
        reader.readAsDataURL(file)
      }
    },
    // 清除上传的图片
    clearImage() {
      this.selectedImage = null
      this.generateQRCode()
    },
    // 生成二维码
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
        width: this.qrConfig.width,
        height: this.qrConfig.height,
        type: "svg",
        data: this.urlInput,
        image: this.selectedImage,
        margin: this.qrConfig.margin,
        qrOptions: this.qrConfig.qrOptions,
        imageOptions: this.qrConfig.imageOptions,
        dotsOptions: {
          color: this.qrConfig.dotsOptions.color,
          type: this.qrConfig.dotsOptions.type,
        },
        backgroundOptions: {
          color: this.qrConfig.backgroundOptions.color,
        },
        cornersSquareOptions: {
          color: this.qrConfig.cornersSquareOptions.color,
          type: this.qrConfig.cornersSquareOptions.type,
        },
        cornersDotOptions: {
          color: this.qrConfig.cornersDotOptions.color,
          type: this.qrConfig.cornersDotOptions.type,
        },
      })

      // 渲染二维码
      this.qrCode.append(preview)
    },
    // 下载二维码
    downloadQRCode() {
      if (this.qrCode) {
        this.qrCode.download({
          name: "qrcode",
          extension: this.downloadFormat,
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

/* 配置选项部分 */
.qr-config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 1rem;
}

/* 选项组 */
.qr-options-group {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 分组标题 */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--hover-bg);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.group-header:hover {
  background: var(--accent-color-hover);
}

.group-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.toggle-icon {
  font-size: 0.8rem;
  color: var(--text-secondary) !important;
  opacity: 0.8 !important;
  transition: transform 0.3s ease;
}

/* 分组内容 */
.group-content {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* 选项组内的选项 */
.option-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-row .option-group {
  flex: 1;
  margin-bottom: 0;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-group label {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 输入框样式 */
.url-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
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

/* 数字输入框 */
.option-group input[type="number"] {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.option-group input[type="number"]:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

/* 滑块样式 */
.option-group input[type="range"] {
  width: 100%;
  accent-color: var(--accent-color);
}

/* 颜色选择器 */
.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

/* 单选按钮样式 */
.color-type-options {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400 !important;
}

.radio-label input[type="radio"] {
  accent-color: var(--accent-color);
}

.radio-label span {
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 复选框样式 */
.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400 !important;
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--accent-color);
}

.checkbox-label span {
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 图片上传 */
.image-upload {
  padding: 0.75rem 1rem;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.image-upload:hover {
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

/* 清除按钮 */
.clear-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1 !important;
}

.clear-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 滚动条样式 */
.qr-config-section::-webkit-scrollbar {
  width: 6px;
}

.qr-config-section::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 3px;
}

.qr-config-section::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

.qr-config-section::-webkit-scrollbar-thumb:hover {
  background: var(--text-primary);
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
