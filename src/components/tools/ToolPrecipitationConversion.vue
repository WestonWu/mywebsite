<template>
  <div class="tool-precipitation-conversion">
    <div class="tool-header">
      <h2>降水量转换</h2>
      <p>毫米与英寸降水量单位转换</p>
    </div>

    <div class="tool-body">
      <div class="conversion-content">
        <!-- 转换输入和结果 -->
        <div class="conversion-section">
          <h3>转换计算</h3>
          <div class="conversion-grid">
            <!-- 输入区域 -->
            <div class="input-conversion">
              <div class="conversion-label">输入：</div>
              <div class="conversion-input-group">
                <input
                  type="number"
                  v-model="inputValue"
                  placeholder="请输入降水量"
                  min="0"
                  max="1000"
                  step="0.1"
                  @input="convertPrecipitation"
                />
                <CustomSelect
                  v-model="inputUnit"
                  :options="precipitationUnits"
                  placeholder="选择单位"
                  @update:modelValue="convertPrecipitation"
                />
              </div>
            </div>

            <!-- 转换箭头 -->
            <div class="conversion-arrow">
              <button class="swap-btn" @click="swapUnits">🔄</button>
            </div>

            <!-- 结果区域 -->
            <div class="result-conversion">
              <div class="conversion-label">结果：</div>
              <div class="conversion-result-group">
                <div class="conversion-result">{{ formattedResult }}</div>
                <CustomSelect
                  v-model="outputUnit"
                  :options="precipitationUnits"
                  placeholder="选择单位"
                  @update:modelValue="convertPrecipitation"
                />
              </div>
            </div>
          </div>

          <!-- 降水量等级 -->
          <div v-if="isValidInput" class="precipitation-level">
            <h4>降水量等级</h4>
            <div class="level-info">
              <div class="level-value" :class="getLevelClass(inputValue, inputUnit)">
                {{ getPrecipitationLevel(inputValue, inputUnit) }}
              </div>
              <div class="level-description">
                {{ getLevelDescription(getPrecipitationLevel(inputValue, inputUnit)) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 降水量等级参考 -->
        <div class="reference-section">
          <h3>降水量等级参考</h3>
          <div class="reference-table">
            <div class="table-header">
              <div class="table-cell">等级</div>
              <div class="table-cell">毫米 (mm)</div>
              <div class="table-cell">英寸 (in)</div>
              <div class="table-cell">描述</div>
            </div>
            <div
              v-for="level in precipitationLevels"
              :key="level.name"
              class="table-row"
              :class="getLevelClass(level.min_mm, 'mm')"
            >
              <div class="table-cell">{{ level.name }}</div>
              <div class="table-cell">{{ level.min_mm }} - {{ level.max_mm }} mm</div>
              <div class="table-cell">{{ (level.min_mm * 0.03937).toFixed(2) }} - {{ (level.max_mm * 0.03937).toFixed(2) }} in</div>
              <div class="table-cell">{{ level.description }}</div>
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

export default {
  name: "ToolPrecipitationConversion",
  components: {
    CustomSelect
  },
  setup() {
    // 状态管理
    const inputValue = ref("")
    const inputUnit = ref("mm")
    const outputUnit = ref("in")
    const result = ref(null)

    // 降水量单位选项
    const precipitationUnits = [
      { value: "mm", label: "毫米 (mm)" },
      { value: "in", label: "英寸 (in)" }
    ]

    // 降水量等级定义
    const precipitationLevels = [
      {
        name: "小雨",
        min_mm: 0.1,
        max_mm: 9.9,
        description: "雨滴小而稀疏，地面很快湿润但无积水"
      },
      {
        name: "中雨",
        min_mm: 10.0,
        max_mm: 24.9,
        description: "雨滴较大且密集，地面有积水，雨声明显"
      },
      {
        name: "大雨",
        min_mm: 25.0,
        max_mm: 49.9,
        description: "雨势猛烈，短时内造成地面积水，雨声大"
      },
      {
        name: "暴雨",
        min_mm: 50.0,
        max_mm: 99.9,
        description: "雨势特大，可能引发洪水，地面积水迅速"
      },
      {
        name: "大暴雨",
        min_mm: 100.0,
        max_mm: 249.9,
        description: "雨势极其猛烈，极易引发洪水和地质灾害"
      },
      {
        name: "特大暴雨",
        min_mm: 250.0,
        max_mm: 1000.0,
        description: "降雨量极大，可能造成严重灾害"
      }
    ]

    // 计算属性
    // 检查输入是否有效
    const isValidInput = computed(() => {
      return !isNaN(parseFloat(inputValue.value)) && parseFloat(inputValue.value) > 0
    })

    // 格式化结果
    const formattedResult = computed(() => {
      if (!result.value) return "--"
      return result.value.toFixed(2)
    })

    // 转换降水量
    const convertPrecipitation = () => {
      if (!isValidInput.value) {
        result.value = null
        return
      }

      const value = parseFloat(inputValue.value)
      let mmValue

      // 先转换为毫米
      if (inputUnit.value === "mm") {
        mmValue = value
      } else {
        mmValue = value * 25.4 // 英寸转毫米
      }

      // 再转换为目标单位
      if (outputUnit.value === "mm") {
        result.value = mmValue
      } else {
        result.value = mmValue * 0.03937 // 毫米转英寸
      }
    }

    // 交换输入和输出单位
    const swapUnits = () => {
      const tempUnit = inputUnit.value
      inputUnit.value = outputUnit.value
      outputUnit.value = tempUnit
      convertPrecipitation()
    }

    // 获取降水量等级
    const getPrecipitationLevel = (value, unit) => {
      const mmValue = unit === "mm" ? value : value * 25.4
      
      for (const level of precipitationLevels) {
        if (mmValue >= level.min_mm && mmValue <= level.max_mm) {
          return level.name
        }
      }
      
      return "微量"
    }

    // 获取降水量等级描述
    const getLevelDescription = (levelName) => {
      const level = precipitationLevels.find(l => l.name === levelName)
      return level ? level.description : "降水量极少"
    }

    // 获取等级样式类
    const getLevelClass = (value, unit) => {
      const mmValue = unit === "mm" ? value : value * 25.4
      
      if (mmValue < 10) return "level-light"
      if (mmValue < 25) return "level-moderate"
      if (mmValue < 50) return "level-heavy"
      if (mmValue < 100) return "level-severe"
      return "level-extreme"
    }

    return {
      inputValue,
      inputUnit,
      outputUnit,
      result,
      precipitationUnits,
      isValidInput,
      formattedResult,
      precipitationLevels,
      convertPrecipitation,
      swapUnits,
      getPrecipitationLevel,
      getLevelDescription,
      getLevelClass
    }
  }
}
</script>

<style scoped>
.tool-precipitation-conversion {
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
.conversion-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

/* 转换部分 */
.conversion-section {
  background: var(--secondary-bg);
  padding: 25px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.conversion-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 25px;
}

/* 转换网格 */
.conversion-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
}

/* 转换输入和结果 */
.input-conversion,
.result-conversion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conversion-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

/* 输入组 */
.conversion-input-group,
.conversion-result-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.conversion-input-group input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.conversion-input-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

/* 转换结果 */
.conversion-result {
  flex: 1;
  padding: 12px 15px;
  background: var(--card-bg);
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: bold;
  text-align: left;
}

/* 转换箭头 */
.conversion-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 交换按钮 */
.swap-btn {
  width: 50px;
  height: 50px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: rotate(180deg);
}

/* 降水量等级 */
.precipitation-level {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.precipitation-level h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

/* 等级信息 */
.level-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-value {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.level-description {
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

/* 等级样式类 */
.level-light {
  color: #00e400;
}

.level-moderate {
  color: #ffff00;
}

.level-heavy {
  color: #ff7e00;
}

.level-severe {
  color: #ff0000;
}

.level-extreme {
  color: #99004c;
}

/* 参考部分 */
.reference-section {
  background: var(--secondary-bg);
  padding: 25px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.reference-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 25px;
}

/* 参考表格 */
.reference-table {
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

/* 表格头部 */
.table-header {
  display: grid;
  grid-template-columns: 100px 150px 150px 1fr;
  gap: 10px;
  padding: 15px;
  background: var(--secondary-bg);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

/* 表格行 */
.table-row {
  display: grid;
  grid-template-columns: 100px 150px 150px 1fr;
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--hover-bg);
}

/* 表格单元格 */
.table-cell {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversion-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .conversion-arrow {
    order: -1;
    justify-content: flex-end;
  }

  .conversion-input-group,
  .conversion-result-group {
    flex-direction: column;
    align-items: stretch;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .table-cell {
    padding: 5px 0;
    border-bottom: 1px dashed var(--border-color);
  }

  .table-row .table-cell:last-child {
    border-bottom: none;
  }

  .table-header {
    display: none;
  }

  .table-row {
    padding: 20px;
  }
}
</style>
