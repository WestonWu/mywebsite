<template>
  <div class="color-converter-tool">
    <div class="tool-header">
      <p>RGB/Hex颜色转换工具</p>
    </div>

    <div class="tool-body">
      <!-- 颜色预览 -->
      <div class="color-preview-section">
        <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
        <div class="color-info">
          <div class="color-value">
            <span class="label">RGB:</span>
            <span class="value">{{ currentRgbValue }}</span>
          </div>
          <div class="color-value">
            <span class="label">Hex:</span>
            <span class="value">{{ currentHexValue }}</span>
          </div>
        </div>
      </div>

      <!-- 转换区域 -->
      <div class="conversion-section">
        <!-- RGB 输入 -->
        <div class="input-group">
          <h3>RGB 颜色</h3>
          <div class="rgb-inputs">
            <div class="rgb-channel">
              <label for="rgb-r">R</label>
              <input type="number" id="rgb-r" v-model.number="rgb.r" min="0" max="255" @input="updateFromRgb" />
            </div>
            <div class="rgb-channel">
              <label for="rgb-g">G</label>
              <input type="number" id="rgb-g" v-model.number="rgb.g" min="0" max="255" @input="updateFromRgb" />
            </div>
            <div class="rgb-channel">
              <label for="rgb-b">B</label>
              <input type="number" id="rgb-b" v-model.number="rgb.b" min="0" max="255" @input="updateFromRgb" />
            </div>
          </div>
          <div class="rgb-slider">
            <label>RGB滑块</label>
            <input
              type="range"
              v-model="rgbSliderValue"
              min="0"
              max="16777215"
              @input="updateFromRgbSlider"
              class="rgb-range"
            />
          </div>
        </div>

        <!-- Hex 输入 -->
        <div class="input-group">
          <h3>Hex 颜色</h3>
          <div class="hex-input">
            <input type="text" v-model="hex" placeholder="#FF0000" @input="updateFromHex" class="hex-input-field" />
          </div>
        </div>
      </div>

      <!-- 常用颜色预设 -->
      <div class="presets-section">
        <h3>常用颜色预设</h3>
        <div class="color-presets">
          <div
            v-for="preset in colorPresets"
            :key="preset.hex"
            class="color-preset"
            :style="{ backgroundColor: preset.hex }"
            @click="selectPreset(preset)"
            :title="preset.name + ' - ' + preset.hex"
          ></div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button class="copy-btn" @click="copyColorValue('rgb')">复制 RGB 值</button>
        <button class="copy-btn" @click="copyColorValue('hex')">复制 Hex 值</button>
        <button class="random-btn" @click="generateRandomColor">生成随机颜色</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from "../../composables/useToolUtils"

export default {
  name: "ToolColorConverter",
  setup() {
    const { copyToClipboard } = useToolUtils()

    return {
      copyToClipboard,
    }
  },
  data() {
    return {
      // RGB 颜色值
      rgb: {
        r: 255,
        g: 0,
        b: 0,
      },
      // Hex 颜色值
      hex: "#FF0000",
      // 常用颜色预设
      colorPresets: [
        { name: "红色", hex: "#FF0000" },
        { name: "绿色", hex: "#00FF00" },
        { name: "蓝色", hex: "#0000FF" },
        { name: "黄色", hex: "#FFFF00" },
        { name: "紫色", hex: "#800080" },
        { name: "橙色", hex: "#FFA500" },
        { name: "青色", hex: "#00FFFF" },
        { name: "粉色", hex: "#FFC0CB" },
        { name: "棕色", hex: "#A52A2A" },
        { name: "灰色", hex: "#808080" },
        { name: "黑色", hex: "#000000" },
        { name: "白色", hex: "#FFFFFF" },
      ],
    }
  },
  computed: {
    // 当前颜色值（用于预览）
    currentColor() {
      return this.hex
    },
    // 当前RGB字符串值
    currentRgbValue() {
      return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
    },
    // 当前Hex字符串值
    currentHexValue() {
      return this.hex
    },
    // RGB滑块值（用于颜色选择）
    rgbSliderValue: {
      get() {
        return (this.rgb.r << 16) + (this.rgb.g << 8) + this.rgb.b
      },
      set(value) {
        this.rgb.r = (value >> 16) & 255
        this.rgb.g = (value >> 8) & 255
        this.rgb.b = value & 255
        this.updateFromRgb()
      },
    },
  },
  methods: {
    // 从RGB更新Hex
    updateFromRgb() {
      // 确保RGB值在0-255范围内
      this.rgb.r = Math.max(0, Math.min(255, this.rgb.r || 0))
      this.rgb.g = Math.max(0, Math.min(255, this.rgb.g || 0))
      this.rgb.b = Math.max(0, Math.min(255, this.rgb.b || 0))

      // 转换为Hex
      const rHex = this.rgb.r.toString(16).padStart(2, "0")
      const gHex = this.rgb.g.toString(16).padStart(2, "0")
      const bHex = this.rgb.b.toString(16).padStart(2, "0")

      this.hex = `#${rHex}${gHex}${bHex}`.toUpperCase()
    },

    // 从Hex更新RGB
    updateFromHex() {
      // 验证Hex格式
      const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      const match = this.hex.match(hexRegex)

      if (match) {
        this.rgb.r = parseInt(match[1], 16)
        this.rgb.g = parseInt(match[2], 16)
        this.rgb.b = parseInt(match[3], 16)
      }
    },

    // 从RGB滑块更新颜色
    updateFromRgbSlider() {
      const value = this.rgbSliderValue
      this.rgb.r = (value >> 16) & 255
      this.rgb.g = (value >> 8) & 255
      this.rgb.b = value & 255
      this.updateFromRgb()
    },

    // 选择预设颜色
    selectPreset(preset) {
      this.hex = preset.hex
      this.updateFromHex()
    },

    // 生成随机颜色
    generateRandomColor() {
      const randomHex =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
          .toUpperCase()
      this.hex = randomHex
      this.updateFromHex()
    },

    // 复制颜色值
    copyColorValue(type) {
      const value = type === "rgb" ? this.currentRgbValue : this.currentHexValue
      this.copyToClipboard(value).then((success) => {
        if (success) {
          console.log(`${type.toUpperCase()}颜色值已复制到剪贴板`)
        }
      })
    },
  },
}
</script>

<style scoped>
/* 颜色转换工具样式 */
.color-converter-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 工具头部 */
.tool-header {
  margin-bottom: 20px;
  text-align: center;
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* 工具主体 */
.tool-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 颜色预览区域 */
.color-preview-section {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
}

.color-preview {
  width: 150px;
  height: 150px;
  border: 3px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-value .label {
  font-weight: 600;
  color: var(--text-primary);
  width: 40px;
}

.color-value .value {
  font-family: "Courier New", Courier, monospace;
  color: var(--text-secondary);
  background: var(--secondary-bg);
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

/* 转换区域 */
.conversion-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 输入组 */
.input-group {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

/* RGB 输入 */
.rgb-inputs {
  display: flex;
  gap: 15px;
}

.rgb-channel {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.rgb-channel label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.rgb-channel input {
  padding: 8px 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.rgb-channel input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* RGB 滑块 */
.rgb-slider {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rgb-slider label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.rgb-range {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;
}

.rgb-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border: 2px solid var(--card-bg);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

.rgb-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.rgb-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border: 2px solid var(--card-bg);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

.rgb-range::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* Hex 输入 */
.hex-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hex-input-field {
  padding: 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-family: "Courier New", Courier, monospace;
  text-align: center;
  transition: all 0.3s ease;
}

.hex-input-field:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 颜色预设 */
.presets-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
}

.presets-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 10px;
}

.color-preset {
  width: 50px;
  height: 50px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.color-preset:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 操作按钮区域 */
.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.copy-btn,
.random-btn {
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

.copy-btn:hover,
.random-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 颜色预览区域 */
  .color-preview-section {
    flex-direction: column;
    text-align: center;
  }

  .color-preview {
    width: 120px;
    height: 120px;
  }

  /* 转换区域 */
  .conversion-section {
    grid-template-columns: 1fr;
  }

  /* RGB 输入 */
  .rgb-inputs {
    flex-direction: column;
  }

  /* 操作按钮区域 */
  .actions-section {
    flex-direction: column;
  }

  .copy-btn,
  .random-btn {
    width: 100%;
  }
}
</style>
