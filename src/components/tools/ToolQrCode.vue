<template>
  <div class="qr-tool">
    <div class="qr-tool-header">
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
          <transition name="group-collapse">
            <div v-if="groups.main" class="group-content">
              <div class="option-group">
                <label for="url-input">Data</label>
                <input
                  type="text"
                  id="url-input"
                  v-model="urlInput"
                  placeholder="https://example.com"
                  class="url-input"
                  @input="generateQRCode"
                />
              </div>
              <div class="option-group">
                <label for="image-upload">图片文件</label>
                <div class="file-input-wrapper">
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
              <div class="option-row">
                <div class="option-group">
                  <label for="qr-width">Width</label>
                  <input
                    type="number"
                    id="qr-width"
                    v-model.number="qrConfig.width"
                    min="100"
                    max="1000"
                    step="50"
                    @input="generateQRCode"
                  />
                </div>
                <div class="option-group">
                  <label for="qr-height">Height</label>
                  <input
                    type="number"
                    id="qr-height"
                    v-model.number="qrConfig.height"
                    min="100"
                    max="1000"
                    step="50"
                    @input="generateQRCode"
                  />
                </div>
              </div>
              <div class="option-group">
                <label for="qr-margin">Margin</label>
                <input
                  type="number"
                  id="qr-margin"
                  v-model.number="qrConfig.margin"
                  min="0"
                  max="100"
                  step="1"
                  @input="generateQRCode"
                />
              </div>
            </div>
          </transition>
        </div>

        <!-- 点选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('dots')">
            <h3>点选项</h3>
            <span class="toggle-icon">{{ groups.dots ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
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

              <!-- 单色选项 -->
              <div v-if="qrConfig.dotsOptions.colorType === 'single'" class="option-group">
                <label for="dots-color">点颜色</label>
                <input
                  type="color"
                  id="dots-color"
                  v-model="qrConfig.dotsOptions.color"
                  @input="generateQRCode"
                  class="color-input"
                />
              </div>

              <!-- 渐变选项 -->
              <div v-else class="gradient-options">
                <div class="option-group">
                  <label>渐变类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.dotsOptions.gradient.type"
                        value="linear"
                        @change="generateQRCode"
                      />
                      <span>线性</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.dotsOptions.gradient.type"
                        value="radial"
                        @change="generateQRCode"
                      />
                      <span>径向</span>
                    </label>
                  </div>
                </div>

                <!-- 线性渐变旋转角度 -->
                <div v-if="qrConfig.dotsOptions.gradient.type === 'linear'" class="option-group">
                  <label for="dots-gradient-rotation">旋转角度</label>
                  <input
                    type="number"
                    id="dots-gradient-rotation"
                    v-model.number="qrConfig.dotsOptions.gradient.rotation"
                    min="0"
                    max="360"
                    step="15"
                    @input="generateQRCode"
                  />
                </div>

                <!-- 渐变颜色 -->
                <div class="option-group">
                  <label>渐变颜色</label>
                  <div class="gradient-colors">
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.dotsOptions.gradient.colorStops[0].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.dotsOptions.gradient.colorStops[1].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 角方块选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('cornersSquare')">
            <h3>角方块选项</h3>
            <span class="toggle-icon">{{ groups.cornersSquare ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
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

              <!-- 单色选项 -->
              <div v-if="qrConfig.cornersSquareOptions.colorType === 'single'" class="option-group">
                <label for="corners-square-color">角方块颜色</label>
                <input
                  type="color"
                  id="corners-square-color"
                  v-model="qrConfig.cornersSquareOptions.color"
                  @input="generateQRCode"
                  class="color-input"
                />
              </div>

              <!-- 渐变选项 -->
              <div v-else class="gradient-options">
                <div class="option-group">
                  <label>渐变类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersSquareOptions.gradient.type"
                        value="linear"
                        @change="generateQRCode"
                      />
                      <span>线性</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersSquareOptions.gradient.type"
                        value="radial"
                        @change="generateQRCode"
                      />
                      <span>径向</span>
                    </label>
                  </div>
                </div>

                <!-- 线性渐变旋转角度 -->
                <div v-if="qrConfig.cornersSquareOptions.gradient.type === 'linear'" class="option-group">
                  <label for="corners-square-gradient-rotation">旋转角度</label>
                  <input
                    type="number"
                    id="corners-square-gradient-rotation"
                    v-model.number="qrConfig.cornersSquareOptions.gradient.rotation"
                    min="0"
                    max="360"
                    step="15"
                    @input="generateQRCode"
                  />
                </div>

                <!-- 渐变颜色 -->
                <div class="option-group">
                  <label>渐变颜色</label>
                  <div class="gradient-colors">
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.cornersSquareOptions.gradient.colorStops[0].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.cornersSquareOptions.gradient.colorStops[1].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 角点选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('cornersDot')">
            <h3>角点选项</h3>
            <span class="toggle-icon">{{ groups.cornersDot ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
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

              <!-- 单色选项 -->
              <div v-if="qrConfig.cornersDotOptions.colorType === 'single'" class="option-group">
                <label for="corners-dot-color">角点颜色</label>
                <input
                  type="color"
                  id="corners-dot-color"
                  v-model="qrConfig.cornersDotOptions.color"
                  @input="generateQRCode"
                  class="color-input"
                />
              </div>

              <!-- 渐变选项 -->
              <div v-else class="gradient-options">
                <div class="option-group">
                  <label>渐变类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersDotOptions.gradient.type"
                        value="linear"
                        @change="generateQRCode"
                      />
                      <span>线性</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.cornersDotOptions.gradient.type"
                        value="radial"
                        @change="generateQRCode"
                      />
                      <span>径向</span>
                    </label>
                  </div>
                </div>

                <!-- 线性渐变旋转角度 -->
                <div v-if="qrConfig.cornersDotOptions.gradient.type === 'linear'" class="option-group">
                  <label for="corners-dot-gradient-rotation">旋转角度</label>
                  <input
                    type="number"
                    id="corners-dot-gradient-rotation"
                    v-model.number="qrConfig.cornersDotOptions.gradient.rotation"
                    min="0"
                    max="360"
                    step="15"
                    @input="generateQRCode"
                  />
                </div>

                <!-- 渐变颜色 -->
                <div class="option-group">
                  <label>渐变颜色</label>
                  <div class="gradient-colors">
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.cornersDotOptions.gradient.colorStops[0].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.cornersDotOptions.gradient.colorStops[1].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 背景选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('background')">
            <h3>背景选项</h3>
            <span class="toggle-icon">{{ groups.background ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
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

              <!-- 单色选项 -->
              <div v-if="qrConfig.backgroundOptions.colorType === 'single'" class="option-group">
                <label for="background-color">背景颜色</label>
                <input
                  type="color"
                  id="background-color"
                  v-model="qrConfig.backgroundOptions.color"
                  @input="generateQRCode"
                  class="color-input"
                />
              </div>

              <!-- 渐变选项 -->
              <div v-else class="gradient-options">
                <div class="option-group">
                  <label>渐变类型</label>
                  <div class="color-type-options">
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.backgroundOptions.gradient.type"
                        value="linear"
                        @change="generateQRCode"
                      />
                      <span>线性</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        v-model="qrConfig.backgroundOptions.gradient.type"
                        value="radial"
                        @change="generateQRCode"
                      />
                      <span>径向</span>
                    </label>
                  </div>
                </div>

                <!-- 线性渐变旋转角度 -->
                <div v-if="qrConfig.backgroundOptions.gradient.type === 'linear'" class="option-group">
                  <label for="background-gradient-rotation">旋转角度</label>
                  <input
                    type="number"
                    id="background-gradient-rotation"
                    v-model.number="qrConfig.backgroundOptions.gradient.rotation"
                    min="0"
                    max="360"
                    step="15"
                    @input="generateQRCode"
                  />
                </div>

                <!-- 渐变颜色 -->
                <div class="option-group">
                  <label>渐变颜色</label>
                  <div class="gradient-colors">
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.backgroundOptions.gradient.colorStops[0].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                    <div class="gradient-color-stop">
                      <input
                        type="color"
                        v-model="qrConfig.backgroundOptions.gradient.colorStops[1].color"
                        @input="generateQRCode"
                        class="color-input gradient-color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 图片选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('image')">
            <h3>图片选项</h3>
            <span class="toggle-icon">{{ groups.image ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
            <div v-if="groups.image" class="group-content">
              <div class="option-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="qrConfig.imageOptions.hideBackgroundDots" @change="generateQRCode" />
                  <span>隐藏背景点</span>
                </label>
              </div>
              <div class="option-row">
                <div class="option-group">
                  <label for="image-size">图片大小</label>
                  <input
                    type="number"
                    id="image-size"
                    v-model.number="qrConfig.imageOptions.imageSize"
                    min="0.1"
                    max="0.8"
                    step="0.1"
                    @input="generateQRCode"
                  />
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
          </transition>
        </div>

        <!-- QR选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('qr')">
            <h3>QR选项</h3>
            <span class="toggle-icon">{{ groups.qr ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
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
          </transition>
        </div>

        <!-- 导出选项 -->
        <div class="qr-options-group">
          <div class="group-header" @click="toggleGroup('export')">
            <h3>导出选项</h3>
            <span class="toggle-icon">{{ groups.export ? "▼" : "▶" }}</span>
          </div>
          <transition name="group-collapse">
            <div v-if="groups.export" class="group-content">
              <div class="option-group">
                <label for="download-format">下载格式</label>
                <custom-select v-model="downloadFormat" :options="downloadFormatOptions"></custom-select>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 右侧：预览和操作 -->
      <div class="qr-result-section">
        <div class="qr-preview" ref="qrPreview"></div>
        <div class="qr-actions">
          <div class="download-options">
            <label for="download-btn">Download</label>
            <button class="download-btn" @click="downloadQRCode" :disabled="!urlInput">
              {{ downloadFormat.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCodeStyling from "qr-code-styling"
import CustomSelect from "../CustomSelect.vue"

export default {
  name: "ToolQrCode",
  components: {
    CustomSelect,
  },
  data() {
    return {
      // 纠错级别选项
      errorCorrectionOptions: [
        { value: "L", label: "低 (L)" },
        { value: "M", label: "中 (M)" },
        { value: "Q", label: "较高 (Q)" },
        { value: "H", label: "高 (H)" },
      ],
      // 选项组折叠状态
      groups: {
        main: true,
        dots: false,
        cornersSquare: false,
        cornersDot: false,
        background: false,
        image: false,
        qr: false,
        export: false,
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
          gradient: {
            type: "linear", // linear or radial
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 角方块选项
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 角点选项
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 背景选项
        backgroundOptions: {
          color: "#ffffff",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#ffffff" },
              { offset: 1, color: "#f0f0f0" },
            ],
          },
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
  mounted() {
    // 组件挂载后生成二维码
    this.generateQRCode()
  },
  methods: {
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
      // 清除文件输入
      const fileInput = document.getElementById("image-upload")
      if (fileInput) {
        fileInput.value = ""
      }
      this.generateQRCode()
    },

    // 生成二维码
    generateQRCode() {
      if (!this.urlInput) {
        return
      }

      // 清除之前的二维码
      const preview = this.$refs.qrPreview
      if (!preview) {
        return
      }

      preview.innerHTML = ""

      try {
        // 构建dotsOptions配置
        const dotsOptions = {
          type: this.qrConfig.dotsOptions.type,
          // 默认单色
          color: this.qrConfig.dotsOptions.color,
        }

        if (this.qrConfig.dotsOptions.colorType === "gradient") {
          // 使用qr-code-styling 1.9.2正确的渐变配置：gradient是独立属性
          dotsOptions.gradient = {
            type: this.qrConfig.dotsOptions.gradient.type,
            rotation: this.qrConfig.dotsOptions.gradient.rotation,
            colorStops: this.qrConfig.dotsOptions.gradient.colorStops,
          }
        }

        // 构建cornersSquareOptions配置
        const cornersSquareOptions = {
          type: this.qrConfig.cornersSquareOptions.type,
          color: this.qrConfig.cornersSquareOptions.color,
        }

        if (this.qrConfig.cornersSquareOptions.colorType === "gradient") {
          cornersSquareOptions.gradient = {
            type: this.qrConfig.cornersSquareOptions.gradient.type,
            rotation: this.qrConfig.cornersSquareOptions.gradient.rotation,
            colorStops: this.qrConfig.cornersSquareOptions.gradient.colorStops,
          }
        }

        // 构建cornersDotOptions配置
        const cornersDotOptions = {
          type: this.qrConfig.cornersDotOptions.type,
          color: this.qrConfig.cornersDotOptions.color,
        }

        if (this.qrConfig.cornersDotOptions.colorType === "gradient") {
          cornersDotOptions.gradient = {
            type: this.qrConfig.cornersDotOptions.gradient.type,
            rotation: this.qrConfig.cornersDotOptions.gradient.rotation,
            colorStops: this.qrConfig.cornersDotOptions.gradient.colorStops,
          }
        }

        // 构建backgroundOptions配置
        const backgroundOptions = {
          color: this.qrConfig.backgroundOptions.color,
        }

        if (this.qrConfig.backgroundOptions.colorType === "gradient") {
          backgroundOptions.gradient = {
            type: this.qrConfig.backgroundOptions.gradient.type,
            rotation: this.qrConfig.backgroundOptions.gradient.rotation,
            colorStops: this.qrConfig.backgroundOptions.gradient.colorStops,
          }
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
          dotsOptions,
          backgroundOptions,
          cornersSquareOptions,
          cornersDotOptions,
        })

        // 渲染二维码
        this.qrCode.append(preview)
      } catch (error) {
        console.error("Error generating QR code:", error)
        // 显示错误信息给用户
        preview.innerHTML = `<p style="color: red;">生成二维码失败: ${error.message}</p>`
      }
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
}
</script>

<style scoped>
/* URL转二维码工具样式 */
.qr-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qr-tool-header {
  margin-bottom: 20px;
  text-align: center;
}

.qr-tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.qr-tool-body {
  display: flex;
  gap: 30px;
  height: calc(100% - 60px);
}

/* 左侧配置区域 */
.qr-config-section {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* 选项组样式 */
.qr-options-group {
  margin-bottom: 20px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

/* 选项组标题 */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--secondary-bg);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.group-header:hover {
  background: var(--hover-bg);
}

.group-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toggle-icon {
  color: var(--text-secondary);
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

/* 选项组内容 */
.group-content {
  padding: 20px;
}

/* 选项组展开/折叠动画 */
.group-collapse-enter-active,
.group-collapse-leave-active {
  transition: all 0.3s ease;
}

.group-collapse-enter-from,
.group-collapse-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  overflow: hidden;
}

/* 选项行 */
.option-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

/* 选项组 */
.option-group {
  margin-bottom: 15px;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-row .option-group {
  flex: 1;
  margin-bottom: 0;
}

/* 选项标签 */
.option-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 输入框样式 */
.option-group input[type="text"],
.option-group input[type="number"],
.option-group input[type="file"] {
  width: 100%;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.option-group input[type="text"]:focus,
.option-group input[type="number"]:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 文件输入包装器 */
.file-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.file-input-wrapper input[type="file"] {
  flex: 1;
  padding: 8px 12px;
  cursor: pointer;
}

/* 清除按钮 */
.clear-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
}

/* 颜色选择器 */
.color-input {
  width: 50px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 渐变颜色输入 */
.gradient-colors {
  display: flex;
  gap: 10px;
}

.gradient-color-stop {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.gradient-color-input {
  flex-shrink: 0;
}

/* 单选按钮和复选框样式 */
.color-type-options,
.checkbox-group {
  display: flex;
  gap: 20px;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.radio-label input[type="radio"],
.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.radio-label:hover,
.checkbox-label:hover {
  color: var(--accent-color);
}

/* 右侧结果区域 */
.qr-result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 0;
  height: 100%;
  overflow: auto;
}

/* 二维码预览区域 */
.qr-preview {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  margin-bottom: 20px;
}

.qr-preview svg {
  max-width: 100%;
  max-height: 100%;
}

/* 操作区域 */
.qr-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  margin-bottom: 20px;
}

/* 下载选项 */
.download-options {
  display: flex;
  align-items: center;
  gap: 20px;
}

.download-options label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 下载按钮 */
.download-btn {
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qr-tool-body {
    flex-direction: column;
  }

  .qr-config-section {
    height: 50%;
  }

  .qr-result-section {
    height: 50%;
  }

  .qr-preview {
    padding: 20px;
  }

  .color-type-options,
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }

  .download-options {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
