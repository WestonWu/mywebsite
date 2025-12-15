<template>
  <div class="tool-feels-like">
    <div class="tool-header">
      <h2>体感温度计算</h2>
      <p>根据温度、湿度、风速计算体感温度</p>
    </div>

    <div class="tool-body">
      <div class="feels-like-content">
        <!-- 输入区域 -->
        <div class="input-section">
          <h3>输入参数</h3>
          <div class="input-grid">
            <!-- 温度输入 -->
            <div class="input-group">
              <label for="temperature">温度：</label>
              <div class="input-with-unit">
                <input
                  type="number"
                  id="temperature"
                  v-model="temperature"
                  placeholder="请输入温度"
                  min="-50"
                  max="50"
                  step="0.1"
                  @input="calculateFeelsLike"
                />
                <CustomSelect
                  v-model="temperatureUnit"
                  :options="temperatureUnits"
                  placeholder="单位"
                  @update:modelValue="calculateFeelsLike"
                />
              </div>
            </div>

            <!-- 湿度输入 -->
            <div class="input-group">
              <label for="humidity">相对湿度：</label>
              <div class="input-with-unit">
                <input
                  type="number"
                  id="humidity"
                  v-model="humidity"
                  placeholder="请输入湿度"
                  min="0"
                  max="100"
                  step="1"
                  @input="calculateFeelsLike"
                />
                <span class="fixed-unit">%</span>
              </div>
            </div>

            <!-- 风速输入 -->
            <div class="input-group">
              <label for="windSpeed">风速：</label>
              <div class="input-with-unit">
                <input
                  type="number"
                  id="windSpeed"
                  v-model="windSpeed"
                  placeholder="请输入风速"
                  min="0"
                  max="50"
                  step="0.1"
                  @input="calculateFeelsLike"
                />
                <CustomSelect
                  v-model="windSpeedUnit"
                  :options="windSpeedUnits"
                  placeholder="单位"
                  @update:modelValue="calculateFeelsLike"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 结果展示 -->
        <div class="result-section">
          <h3>计算结果</h3>
          <div class="result-content">
            <div v-if="isValidInput" class="result-main">
              <div class="feels-like-value">{{ formattedFeelsLike }}</div>
              <div class="comfort-level" :class="getComfortClass(feelsLike)">
                {{ getComfortLevel(feelsLike) }}
              </div>
            </div>
            <div v-else class="result-prompt">
              <div class="prompt-icon">ℹ️</div>
              <div class="prompt-text">请输入有效的温度、湿度和风速值</div>
            </div>
          </div>

          <!-- 舒适度建议 -->
          <div v-if="isValidInput" class="comfort-advice">
            <h4>舒适度建议</h4>
            <div class="advice-text">{{ getComfortAdvice(feelsLike) }}</div>
          </div>

          <!-- 计算公式说明 -->
          <div class="formula-section">
            <h4>计算公式</h4>
            <div class="formula-content">
              <p>体感温度 = 1.07 * T + 0.2 * RH * 0.1345 * T - 0.65 * V * 0.1345 * T - 4.25</p>
              <p class="formula-note">
                其中：T为温度(°C)，RH为相对湿度(%)，V为风速(m/s)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue"
import CustomSelect from "../CustomSelect.vue"
import { useTemperatureConversion } from "../../composables/useTemperatureConversion"

export default {
  name: "ToolFeelsLike",
  components: {
    CustomSelect
  },
  setup() {
    // 初始化温度转换工具
    const { convertTemperature, formatTemperature, getTemperatureUnits } = useTemperatureConversion()

    // 状态管理
    const temperature = ref("")
    const humidity = ref("")
    const windSpeed = ref("")
    const temperatureUnit = ref("celsius")
    const windSpeedUnit = ref("m/s")
    const feelsLike = ref(null)

    // 单位选项
    const temperatureUnits = getTemperatureUnits()
    const windSpeedUnits = [
      { value: "m/s", label: "米/秒 (m/s)" },
      { value: "km/h", label: "千米/小时 (km/h)" },
      { value: "mph", label: "英里/小时 (mph)" }
    ]

    // 计算属性
    // 检查输入是否有效
    const isValidInput = computed(() => {
      return (
        !isNaN(parseFloat(temperature.value)) &&
        !isNaN(parseFloat(humidity.value)) &&
        !isNaN(parseFloat(windSpeed.value)) &&
        parseFloat(temperature.value) !== 0 &&
        parseFloat(humidity.value) !== 0 &&
        parseFloat(windSpeed.value) !== 0
      )
    })

    // 格式化体感温度
    const formattedFeelsLike = computed(() => {
      if (!feelsLike.value) return "--"
      return formatTemperature(feelsLike.value, temperatureUnit.value, 1)
    })

    // 转换风速单位到m/s
    const convertWindSpeedToMps = (speed, unit) => {
      switch (unit) {
        case "km/h":
          return speed / 3.6
        case "mph":
          return speed * 0.44704
        default:
          return speed
      }
    }

    // 计算体感温度
    const calculateFeelsLike = () => {
      if (!isValidInput.value) {
        feelsLike.value = null
        return
      }

      // 转换温度到摄氏度用于计算
      const tempCelsius = convertTemperature(parseFloat(temperature.value), temperatureUnit.value, "celsius")
      const relHumidity = parseFloat(humidity.value)
      const windSpeedMps = convertWindSpeedToMps(parseFloat(windSpeed.value), windSpeedUnit.value)

      // 体感温度计算公式
      // 公式参考：体感温度 = 1.07 * T + 0.2 * RH * 0.1345 * T - 0.65 * V * 0.1345 * T - 4.25
      let feelsLikeTemp

      // 基于温度、湿度和风速的综合计算
      if (tempCelsius > 25) {
        // 热天公式：考虑湿度影响
        feelsLikeTemp = tempCelsius + 0.33 * relHumidity - 0.70 * windSpeedMps - 4.00
      } else if (tempCelsius < 10) {
        // 冷天公式：考虑风寒指数
        feelsLikeTemp = 13.12 + 0.6215 * tempCelsius - 11.37 * Math.pow(windSpeedMps, 0.16) + 0.3965 * tempCelsius * Math.pow(windSpeedMps, 0.16)
      } else {
        // 温和天气公式：综合考虑
        feelsLikeTemp = 1.07 * tempCelsius + 0.2 * relHumidity * 0.1345 * tempCelsius - 0.65 * windSpeedMps * 0.1345 * tempCelsius - 4.25
      }

      // 转换回用户选择的温度单位
      feelsLike.value = convertTemperature(feelsLikeTemp, "celsius", temperatureUnit.value)
    }

    // 获取舒适度等级
    const getComfortLevel = (temp) => {
      if (temp <= 0) return "极寒"
      if (temp <= 10) return "寒冷"
      if (temp <= 18) return "凉爽"
      if (temp <= 25) return "舒适"
      if (temp <= 30) return "温暖"
      if (temp <= 35) return "炎热"
      return "酷热"
    }

    // 获取舒适度样式类
    const getComfortClass = (temp) => {
      if (temp <= 0) return "comfort-extreme-cold"
      if (temp <= 10) return "comfort-cold"
      if (temp <= 18) return "comfort-cool"
      if (temp <= 25) return "comfort-comfortable"
      if (temp <= 30) return "comfort-warm"
      if (temp <= 35) return "comfort-hot"
      return "comfort-extreme-hot"
    }

    // 获取舒适度建议
    const getComfortAdvice = (temp) => {
      if (temp <= 0) {
        return "极寒天气，应避免户外活动，外出需穿着厚重保暖衣物，注意保暖防冻伤"
      } else if (temp <= 10) {
        return "寒冷天气，建议穿着厚外套、帽子和手套，外出注意保暖"
      } else if (temp <= 18) {
        return "凉爽天气，建议穿着长袖衣物，适当增添外套"
      } else if (temp <= 25) {
        return "舒适天气，可正常户外活动，穿着轻便衣物"
      } else if (temp <= 30) {
        return "温暖天气，建议穿着轻便透气衣物，注意补充水分"
      } else if (temp <= 35) {
        return "炎热天气，尽量避免长时间户外活动，注意防晒和补水"
      } else {
        return "酷热天气，应避免户外活动，待在阴凉处，注意防暑降温"
      }
    }

    return {
      temperature,
      humidity,
      windSpeed,
      temperatureUnit,
      windSpeedUnit,
      temperatureUnits,
      windSpeedUnits,
      feelsLike,
      isValidInput,
      formattedFeelsLike,
      calculateFeelsLike,
      getComfortLevel,
      getComfortClass,
      getComfortAdvice
    }
  }
}
</script>

<style scoped>
.tool-feels-like {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.tool-body {
  background: var(--card-bg);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  border: 1px solid var(--border-color);
}

/* 内容区域 */
.feels-like-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* 输入区域 */
.input-section {
  background: var(--secondary-bg);
  padding: 25px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.input-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 25px;
}

/* 输入网格 */
.input-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

/* 带单位的输入 */
.input-with-unit {
  display: flex;
  gap: 15px;
  align-items: center;
}

.input-with-unit input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.input-with-unit input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

/* 固定单位 */
.fixed-unit {
  padding: 12px 15px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

/* 结果区域 */
.result-section {
  background: var(--secondary-bg);
  padding: 25px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.result-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 25px;
}

/* 结果内容 */
.result-content {
  margin-bottom: 30px;
}

/* 主要结果 */
.result-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

/* 体感温度值 */
.feels-like-value {
  font-size: 4rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 15px;
}

/* 舒适度等级 */
.comfort-level {
  font-size: 1.5rem;
  font-weight: 600;
}

/* 舒适度样式类 */
.comfort-extreme-cold {
  color: #0000ff;
}

.comfort-cold {
  color: #00bfff;
}

.comfort-cool {
  color: #00ff7f;
}

.comfort-comfortable {
  color: #00ff00;
}

.comfort-warm {
  color: #ffff00;
}

.comfort-hot {
  color: #ff7f00;
}

.comfort-extreme-hot {
  color: #ff0000;
}

/* 提示信息 */
.result-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 40px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.prompt-icon {
  font-size: 2rem;
}

.prompt-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
}

/* 舒适度建议 */
.comfort-advice {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.comfort-advice h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.advice-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 计算公式说明 */
.formula-section {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.formula-section h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.formula-content {
  color: var(--text-secondary);
  line-height: 1.5;
}

.formula-content p {
  margin: 0 0 10px 0;
}

.formula-note {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feels-like-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .input-section,
  .result-section {
    padding: 20px;
  }

  .feels-like-value {
    font-size: 3rem;
  }

  .comfort-level {
    font-size: 1.3rem;
  }

  .input-with-unit {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .input-with-unit input {
    width: 100%;
  }

  .fixed-unit {
    width: 100%;
    text-align: center;
  }
}
</style>
