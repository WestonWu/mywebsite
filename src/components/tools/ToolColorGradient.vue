<template>
  <div class="color-gradient-tool">
    <div class="tool-header">
      <p>颜色渐变生成工具</p>
    </div>

    <div class="tool-body">
      <!-- 渐变预览 -->
      <div class="gradient-preview-section">
        <div class="gradient-preview" :style="{ background: generatedGradient }"></div>
        <div class="gradient-info">
          <div class="gradient-type">
            <span class="label">渐变类型:</span>
            <span class="value">{{ gradientType === "linear" ? "线性渐变" : "径向渐变" }}</span>
          </div>
          <div class="gradient-stops">
            <span class="label">颜色数量:</span>
            <span class="value">{{ gradientStops.length }}</span>
          </div>
        </div>
      </div>

      <!-- 渐变配置 -->
      <div class="config-section">
        <!-- 左侧：渐变设置 -->
        <div class="settings-panel">
          <!-- 渐变类型选择 -->
          <div class="setting-group">
            <label>渐变类型</label>
            <div class="gradient-type-options">
              <label class="radio-label">
                <input type="radio" v-model="gradientType" value="linear" @change="updateGradient" />
                <span>线性渐变</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="gradientType" value="radial" @change="updateGradient" />
                <span>径向渐变</span>
              </label>
            </div>
          </div>

          <!-- 线性渐变设置 -->
          <div v-if="gradientType === 'linear'" class="setting-group">
            <label>渐变方向</label>
            <div class="direction-options">
              <div class="direction-buttons">
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to top' }"
                  @click="setLinearDirection('to top')"
                  title="向上"
                >
                  ↑
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to top right' }"
                  @click="setLinearDirection('to top right')"
                  title="向右上"
                >
                  ↗
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to right' }"
                  @click="setLinearDirection('to right')"
                  title="向右"
                >
                  →
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to bottom right' }"
                  @click="setLinearDirection('to bottom right')"
                  title="向右下"
                >
                  ↘
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to bottom' }"
                  @click="setLinearDirection('to bottom')"
                  title="向下"
                >
                  ↓
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to bottom left' }"
                  @click="setLinearDirection('to bottom left')"
                  title="向左下"
                >
                  ↙
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to left' }"
                  @click="setLinearDirection('to left')"
                  title="向左"
                >
                  ←
                </button>
                <button
                  class="direction-btn"
                  :class="{ active: linearDirection === 'to top left' }"
                  @click="setLinearDirection('to top left')"
                  title="向左上"
                >
                  ↖
                </button>
              </div>
              <div class="angle-input">
                <label for="angle">自定义角度 ({{ linearAngle }}°)</label>
                <input
                  type="range"
                  id="angle"
                  v-model.number="linearAngle"
                  min="0"
                  max="360"
                  @input="updateGradient"
                  class="angle-slider"
                />
                <input
                  type="number"
                  v-model.number="linearAngle"
                  min="0"
                  max="360"
                  @input="updateGradient"
                  class="angle-number"
                  placeholder="角度"
                />
              </div>
            </div>
          </div>

          <!-- 径向渐变设置 -->
          <div v-if="gradientType === 'radial'" class="setting-group">
            <label>径向渐变形状</label>
            <div class="radial-shape-options">
              <label class="radio-label">
                <input type="radio" v-model="radialShape" value="ellipse" @change="updateGradient" />
                <span>椭圆形</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="radialShape" value="circle" @change="updateGradient" />
                <span>圆形</span>
              </label>
            </div>
            <div class="radial-position">
              <label>渐变位置</label>
              <CustomSelect
                v-model="radialPosition"
                :options="radialPositionOptions"
                @update:modelValue="updateGradient"
              />
            </div>
          </div>

          <!-- 颜色停止点 -->
          <div class="setting-group">
            <div class="setting-header">
              <label>颜色停止点</label>
              <button class="add-stop-btn" @click="addColorStop">添加颜色</button>
            </div>
            <div class="color-stops-list">
              <div v-for="(stop, index) in gradientStops" :key="index" class="color-stop-item">
                <div class="stop-controls">
                  <div class="color-input-group">
                    <label :for="`color-${index}`">颜色 {{ index + 1 }}</label>
                    <div class="color-input-wrapper">
                      <input
                        type="color"
                        :id="`color-${index}`"
                        v-model="stop.color"
                        @input="updateGradient"
                        class="color-input"
                      />
                      <input
                        type="text"
                        v-model="stop.color"
                        @input="updateGradient"
                        placeholder="#FF0000"
                        class="color-text-input"
                      />
                    </div>
                  </div>
                  <div class="position-input-group">
                    <label :for="`position-${index}`">位置</label>
                    <div class="position-input-wrapper">
                      <input
                        type="range"
                        :id="`position-${index}`"
                        v-model.number="stop.position"
                        min="0"
                        max="100"
                        @input="updateGradient"
                        class="position-slider"
                      />
                      <input
                        type="number"
                        v-model.number="stop.position"
                        min="0"
                        max="100"
                        @input="updateGradient"
                        class="position-number"
                        placeholder="%"
                      />
                      <span class="position-unit">%</span>
                    </div>
                  </div>
                </div>
                <button
                  class="remove-stop-btn"
                  @click="removeColorStop(index)"
                  :disabled="gradientStops.length <= 2"
                  title="删除颜色"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：代码输出 -->
        <div class="output-panel">
          <div class="output-header">
            <h3>生成代码</h3>
            <div class="output-type-tabs">
              <button
                v-for="type in outputTypes"
                :key="type.value"
                :class="['output-type-tab', { active: selectedOutputType === type.value }]"
                @click="selectedOutputType = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
          <div class="output-content">
            <pre class="output-code">{{ generatedCode }}</pre>
          </div>
          <div class="output-actions">
            <button class="copy-btn" @click="copyGeneratedCode">复制代码</button>
          </div>
        </div>
      </div>

      <!-- 预设渐变 -->
      <div class="presets-section">
        <h3>渐变预设</h3>
        <div class="gradient-presets">
          <div
            v-for="(preset, index) in gradientPresets"
            :key="index"
            class="gradient-preset"
            @click="applyPreset(preset)"
            :title="preset.name"
          >
            <div class="preset-preview" :style="{ background: preset.gradient }"></div>
            <span class="preset-name">{{ preset.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from "../../composables/useToolUtils"
import CustomSelect from "../CustomSelect.vue"

export default {
  name: "ToolColorGradient",
  components: {
    CustomSelect,
  },
  setup() {
    const { copyToClipboard } = useToolUtils()

    return {
      copyToClipboard,
    }
  },
  data() {
    return {
      // 渐变类型：linear, radial
      gradientType: "linear",

      // 线性渐变设置
      linearDirection: "to right",
      linearAngle: 90,

      // 径向渐变设置
      radialShape: "ellipse",
      radialPosition: "center",

      // 径向渐变位置选项
      radialPositionOptions: [
        { value: "center", label: "中心" },
        { value: "top", label: "顶部" },
        { value: "bottom", label: "底部" },
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
        { value: "top left", label: "左上角" },
        { value: "top right", label: "右上角" },
        { value: "bottom left", label: "左下角" },
        { value: "bottom right", label: "右下角" },
      ],

      // 颜色停止点
      gradientStops: [
        { color: "#FF0000", position: 0 },
        { color: "#00FF00", position: 50 },
        { color: "#0000FF", position: 100 },
      ],

      // 输出类型
      selectedOutputType: "css",
      outputTypes: [
        { value: "css", label: "CSS" },
        { value: "svg", label: "SVG" },
      ],

      // 渐变预设
      gradientPresets: [
        {
          name: "彩虹渐变",
          gradient: "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8B00FF)",
        },
        { name: "日落渐变", gradient: "linear-gradient(180deg, #FF512F, #F09819)" },
        { name: "海洋渐变", gradient: "linear-gradient(180deg, #1A2980, #26D0CE)" },
        { name: "森林渐变", gradient: "linear-gradient(180deg, #2ECC71, #27AE60)" },
        { name: "紫色渐变", gradient: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)" },
        { name: "粉色渐变", gradient: "linear-gradient(180deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)" },
        { name: "蓝色渐变", gradient: "linear-gradient(to top, #30cfd0 0%, #330867 100%)" },
        { name: "径向渐变", gradient: "radial-gradient(circle, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)" },
      ],
    }
  },
  computed: {
    // 生成的渐变CSS
    generatedGradient() {
      if (this.gradientType === "linear") {
        return this.generateLinearGradient()
      } else {
        return this.generateRadialGradient()
      }
    },

    // 生成的代码
    generatedCode() {
      if (this.selectedOutputType === "css") {
        return this.generatedGradient
      } else {
        return this.generateSvgCode()
      }
    },
  },
  methods: {
    // 设置线性渐变方向
    setLinearDirection(direction) {
      this.linearDirection = direction

      // 根据方向重置linearAngle
      const directionToAngle = {
        "to top": 0,
        "to top right": 45,
        "to right": 90,
        "to bottom right": 135,
        "to bottom": 180,
        "to bottom left": 225,
        "to left": 270,
        "to top left": 315,
      }

      this.linearAngle = directionToAngle[direction] || 90
      this.updateGradient()
    },

    // 添加颜色停止点
    addColorStop() {
      // 计算新停止点的位置
      const positions = this.gradientStops.map((stop) => stop.position).sort((a, b) => a - b)
      let newPosition = 50

      if (positions.length >= 2) {
        // 找到最大的位置间隔
        let maxGap = 0
        let bestPosition = 50

        for (let i = 0; i < positions.length - 1; i++) {
          const gap = positions[i + 1] - positions[i]
          if (gap > maxGap) {
            maxGap = gap
            bestPosition = (positions[i] + positions[i + 1]) / 2
          }
        }

        newPosition = Math.round(bestPosition)
      }

      this.gradientStops.push({
        color: this.generateRandomColor(),
        position: newPosition,
      })

      this.updateGradient()
    },

    // 移除颜色停止点
    removeColorStop(index) {
      if (this.gradientStops.length > 2) {
        this.gradientStops.splice(index, 1)
        this.updateGradient()
      }
    },

    // 生成随机颜色
    generateRandomColor() {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
          .toUpperCase()
      )
    },

    // 生成线性渐变
    generateLinearGradient() {
      // 排序停止点
      const sortedStops = [...this.gradientStops].sort((a, b) => a.position - b.position)

      // 构建停止点字符串
      const stops = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")

      // 如果角度是0-360之间的标准方向，使用方向关键字，否则使用角度
      let direction = this.linearDirection
      // 方向到角度的映射
      const directionToAngle = {
        "to top": 0,
        "to top right": 45,
        "to right": 90,
        "to bottom right": 135,
        "to bottom": 180,
        "to bottom left": 225,
        "to left": 270,
        "to top left": 315,
      }

      // 如果当前角度与方向对应的标准角度一致，使用方向关键字，否则使用角度
      if (directionToAngle[this.linearDirection] !== this.linearAngle) {
        direction = `${this.linearAngle}deg`
      }

      return `linear-gradient(${direction}, ${stops})`
    },

    // 生成径向渐变
    generateRadialGradient() {
      // 排序停止点
      const sortedStops = [...this.gradientStops].sort((a, b) => a.position - b.position)

      // 构建停止点字符串
      const stops = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ")

      // 构建径向渐变参数
      const shape = this.radialShape
      const position = this.radialPosition

      return `radial-gradient(${shape} at ${position}, ${stops})`
    },

    // 生成SVG代码
    generateSvgCode() {
      const gradientId = "generatedGradient"
      const sortedStops = [...this.gradientStops].sort((a, b) => a.position - b.position)

      let gradientElement = ""

      if (this.gradientType === "linear") {
        const x1 = this.linearDirection.includes("left")
          ? "100%"
          : this.linearDirection.includes("right")
          ? "0%"
          : "50%"
        const y1 = this.linearDirection.includes("top")
          ? "100%"
          : this.linearDirection.includes("bottom")
          ? "0%"
          : "50%"
        const x2 = this.linearDirection.includes("right")
          ? "100%"
          : this.linearDirection.includes("left")
          ? "0%"
          : "50%"
        const y2 = this.linearDirection.includes("bottom")
          ? "100%"
          : this.linearDirection.includes("top")
          ? "0%"
          : "50%"

        gradientElement = `<linearGradient id="${gradientId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`
      } else {
        // 简化径向渐变的SVG生成
        gradientElement = `<radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">`
      }

      // 添加停止点
      sortedStops.forEach((stop) => {
        gradientElement += `<stop offset="${stop.position}%" stop-color="${stop.color}" />`
      })

      gradientElement += `</${this.gradientType}Gradient>`

      // 完整的SVG代码
      return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradientElement}
  </defs>
  <rect width="100%" height="100%" fill="url(#${gradientId})" />
</svg>`
    },

    // 更新渐变
    updateGradient() {
      // 触发计算属性更新
      this.$forceUpdate()
    },

    // 应用预设
    applyPreset(preset) {
      // 解析预设渐变
      const presetGradient = preset.gradient

      // 解析渐变类型
      if (presetGradient.includes("radial-gradient")) {
        this.gradientType = "radial"
        this.gradientStops = this.parseGradientColors(presetGradient)
        this.updateGradient()
      } else if (presetGradient.includes("linear-gradient")) {
        this.gradientType = "linear"
        this.gradientStops = this.parseGradientColors(presetGradient)

        // 解析渐变方向
        const directionMatch = presetGradient.match(/linear-gradient\(([^,]+),/)
        if (directionMatch) {
          const direction = directionMatch[1].trim()
          // 检查是否是角度值
          if (direction.match(/^\d+deg$/)) {
            this.linearAngle = parseInt(direction)
            // 更新方向关键字（根据角度映射）
            const angleToDirection = {
              0: "to top",
              45: "to top right",
              90: "to right",
              135: "to bottom right",
              180: "to bottom",
              225: "to bottom left",
              270: "to left",
              315: "to top left",
            }
            this.linearDirection = angleToDirection[this.linearAngle] || "to right"
          } else {
            // 直接使用方向关键字
            this.linearDirection = direction
            // 更新角度（根据方向映射）
            const directionToAngle = {
              "to top": 0,
              "to top right": 45,
              "to right": 90,
              "to bottom right": 135,
              "to bottom": 180,
              "to bottom left": 225,
              "to left": 270,
              "to top left": 315,
            }
            this.linearAngle = directionToAngle[direction] || 90
          }
        }

        this.updateGradient()
      }
    },

    // 解析渐变颜色停止点
    parseGradientColors(gradient) {
      // 提取颜色部分
      const colorsMatch = gradient.match(/gradient\([^)]+\(([^)]+)\)/) || gradient.match(/gradient\(([^)]+)\)/)

      if (colorsMatch) {
        // 移除渐变类型和方向，只保留颜色部分
        let colorsPart = colorsMatch[1]
        // 如果包含括号（如radial-gradient(circle at center, ...)），则提取逗号后的部分
        if (colorsPart.includes(",")) {
          colorsPart = colorsPart.split(",").slice(1).join(",")
        }

        // 分割颜色停止点
        const colorStops = colorsPart
          .split(",")
          .map((stop) => {
            stop = stop.trim()
            // 匹配颜色和位置
            const match = stop.match(/^(#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})|rgb\([^)]+\)|rgba\([^)]+\))(?:\s+(\d+)%?)?/)
            if (match) {
              const color = match[1]
              const position = match[3] ? parseInt(match[3]) : null
              return { color, position }
            }
            return null
          })
          .filter((stop) => stop !== null)

        // 如果没有解析到位置，自动分配位置
        if (colorStops.length > 0) {
          const step = 100 / (colorStops.length - 1)
          colorStops.forEach((stop, index) => {
            if (stop.position === null) {
              stop.position = Math.round(index * step)
            }
          })
        }

        return colorStops
      }

      // 默认返回三原色渐变
      return [
        { color: "#FF0000", position: 0 },
        { color: "#00FF00", position: 50 },
        { color: "#0000FF", position: 100 },
      ]
    },

    // 复制生成的代码
    copyGeneratedCode() {
      this.copyToClipboard(this.generatedCode).then((success) => {
        if (success) {
          console.log(`${this.selectedOutputType.toUpperCase()}代码已复制到剪贴板`)
        }
      })
    },
  },
}
</script>

<style scoped>
/* 颜色渐变工具样式 */
.color-gradient-tool {
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

/* 渐变预览区域 */
.gradient-preview-section {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
}

.gradient-preview {
  width: 300px;
  height: 200px;
  border: 3px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
}

.gradient-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gradient-type,
.gradient-stops {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gradient-type .label,
.gradient-stops .label {
  font-weight: 600;
  color: var(--text-primary);
  width: 80px;
}

.gradient-type .value,
.gradient-stops .value {
  color: var(--text-secondary);
  background: var(--secondary-bg);
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

/* 配置区域 */
.config-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 设置面板 */
.settings-panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 设置组 */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
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

/* 渐变类型选项 */
.gradient-type-options {
  display: flex;
  gap: 20px;
}

/* 方向按钮 */
.direction-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.direction-btn {
  width: 40px;
  height: 40px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.direction-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
}

.direction-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* 角度输入 */
.angle-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.angle-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--secondary-bg);
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;
}

.angle-slider::-webkit-slider-thumb {
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

.angle-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.angle-number {
  padding: 8px 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 80px;
  transition: all 0.3s ease;
}

.angle-number:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 径向渐变设置 */
.radial-shape-options {
  display: flex;
  gap: 20px;
}

.radial-position {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

:deep(.custom-select-container) {
  width: 100%;
  max-width: none;
}

:deep(.custom-select-header) {
  padding: 10px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

:deep(.custom-select-options) {
  border-radius: var(--border-radius);
}

/* 移除旧的position-select样式，因为不再使用 */

/* 添加停止点按钮 */
.add-stop-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-stop-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 颜色停止点列表 */
.color-stops-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

/* 颜色停止点项 */
.color-stop-item {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.stop-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 颜色输入组 */
.color-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.color-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-input:hover {
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.color-text-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: "Courier New", Courier, monospace;
  transition: all 0.3s ease;
}

.color-text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 位置输入组 */
.position-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-input-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.position-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.position-slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--secondary-bg);
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;
}

.position-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--accent-color);
  border: 2px solid var(--card-bg);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

.position-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.position-number {
  width: 60px;
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.3s ease;
}

.position-number:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.position-unit {
  font-size: 0.9rem;
  color: var(--text-secondary);
  width: 20px;
}

/* 删除停止点按钮 */
.remove-stop-btn {
  width: 30px;
  height: 30px;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-stop-btn:hover:not(:disabled) {
  background: var(--error-color-hover);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.remove-stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 输出面板 */
.output-panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.output-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.output-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

/* 输出类型标签页 */
.output-type-tabs {
  display: flex;
  gap: 10px;
}

.output-type-tab {
  padding: 8px 16px;
  background: var(--secondary-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.output-type-tab:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.output-type-tab.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* 输出内容 */
.output-content {
  flex: 1;
  margin-bottom: 15px;
}

.output-code {
  width: 100%;
  height: 200px;
  padding: 15px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 输出操作 */
.output-actions {
  display: flex;
  justify-content: flex-end;
}

/* 复制按钮 */
.copy-btn {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 预设渐变区域 */
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

/* 渐变预设列表 */
.gradient-presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

/* 渐变预设项 */
.gradient-preset {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.preset-preview {
  width: 100%;
  height: 80px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

.gradient-preset:hover .preset-preview {
  transform: scale(1.05);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.preset-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.gradient-preset:hover .preset-name {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 渐变预览区域 */
  .gradient-preview-section {
    flex-direction: column;
    text-align: center;
  }

  .gradient-preview {
    width: 180px;
    height: 120px;
  }

  /* 配置区域 */
  .config-section {
    grid-template-columns: 1fr;
  }

  /* 颜色停止点项 */
  .color-stop-item {
    flex-direction: column;
    align-items: stretch;
  }

  /* 渐变预设列表 */
  .gradient-presets {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  /* 预设预览 */
  .preset-preview {
    height: 60px;
  }
}
</style>
