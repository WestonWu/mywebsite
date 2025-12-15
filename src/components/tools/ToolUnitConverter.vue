<template>
  <div class="unit-converter-tool">
    <div class="tool-header">
      <p>单位转换工具</p>
    </div>

    <div class="tool-body">
      <!-- 单位类型选择 -->
      <div class="unit-type-section">
        <label>选择单位类型</label>
        <CustomSelect v-model="selectedUnitType" :options="unitTypes" @update:modelValue="resetConverter" />
      </div>

      <!-- 转换区域 -->
      <div class="conversion-section">
        <!-- 左侧：输入单位 -->
        <div class="unit-input-group">
          <h3>输入值</h3>
          <div class="input-wrapper">
            <input
              type="number"
              v-model.number="inputValue"
              @input="convertUnits"
              placeholder="请输入数值"
              class="value-input"
              step="any"
            />
            <CustomSelect v-model="fromUnit" :options="formattedInputUnits" @update:modelValue="convertUnits" />
          </div>
        </div>

        <!-- 转换按钮 -->
        <div class="swap-section">
          <button class="swap-btn" @click="swapUnits" title="交换单位">↔</button>
        </div>

        <!-- 右侧：输出单位 -->
        <div class="unit-output-group">
          <h3>转换结果</h3>
          <div class="output-wrapper">
            <input
              type="number"
              v-model.number="outputValue"
              readonly
              placeholder="转换结果"
              class="value-output"
              step="any"
            />
            <CustomSelect v-model="toUnit" :options="formattedOutputUnits" @update:modelValue="convertUnits" />
          </div>
        </div>
      </div>

      <!-- 转换历史 -->
      <div class="history-section" v-if="conversionHistory.length > 0">
        <div class="history-header">
          <h3>转换历史</h3>
          <button class="clear-history-btn" @click="clearHistory" title="清除历史">✕</button>
        </div>
        <div class="history-list">
          <div v-for="(history, index) in conversionHistory" :key="index" class="history-item">
            <span class="history-text">
              {{ history.inputValue }} {{ history.fromUnitSymbol }} = {{ history.outputValue }}
              {{ history.toUnitSymbol }}
            </span>
            <span class="history-type">{{ history.typeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 常用转换快捷方式 -->
      <div class="quick-conversions-section">
        <h3>常用转换</h3>
        <div class="quick-conversions-grid">
          <button
            v-for="quick in currentQuickConversions"
            :key="quick.id"
            class="quick-conversion-btn"
            @click="applyQuickConversion(quick)"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomSelect from "../CustomSelect.vue"

export default {
  name: "ToolUnitConverter",
  components: {
    CustomSelect,
  },
  data() {
    return {
      // 单位类型列表
      unitTypes: [
        {
          value: "length",
          label: "长度",
          baseUnit: "meter",
          units: [
            { value: "meter", label: "米", symbol: "m", factor: 1 },
            { value: "kilometer", label: "千米", symbol: "km", factor: 1000 },
            { value: "centimeter", label: "厘米", symbol: "cm", factor: 0.01 },
            { value: "millimeter", label: "毫米", symbol: "mm", factor: 0.001 },
            { value: "inch", label: "英寸", symbol: "in", factor: 0.0254 },
            { value: "foot", label: "英尺", symbol: "ft", factor: 0.3048 },
            { value: "yard", label: "码", symbol: "yd", factor: 0.9144 },
            { value: "mile", label: "英里", symbol: "mi", factor: 1609.34 },
          ],
        },
        {
          value: "weight",
          label: "重量",
          baseUnit: "kilogram",
          units: [
            { value: "kilogram", label: "千克", symbol: "kg", factor: 1 },
            { value: "gram", label: "克", symbol: "g", factor: 0.001 },
            { value: "milligram", label: "毫克", symbol: "mg", factor: 0.000001 },
            { value: "ton", label: "吨", symbol: "t", factor: 1000 },
            { value: "pound", label: "磅", symbol: "lb", factor: 0.453592 },
            { value: "ounce", label: "盎司", symbol: "oz", factor: 0.0283495 },
          ],
        },
        {
          value: "temperature",
          label: "温度",
          baseUnit: "celsius",
          units: [
            { value: "celsius", label: "摄氏度", symbol: "°C" },
            { value: "fahrenheit", label: "华氏度", symbol: "°F" },
            { value: "kelvin", label: "开尔文", symbol: "K" },
          ],
        },
        {
          value: "area",
          label: "面积",
          baseUnit: "squareMeter",
          units: [
            { value: "squareMeter", label: "平方米", symbol: "m²", factor: 1 },
            { value: "squareKilometer", label: "平方千米", symbol: "km²", factor: 1000000 },
            { value: "squareCentimeter", label: "平方厘米", symbol: "cm²", factor: 0.0001 },
            { value: "squareMillimeter", label: "平方毫米", symbol: "mm²", factor: 0.000001 },
            { value: "squareInch", label: "平方英寸", symbol: "in²", factor: 0.00064516 },
            { value: "squareFoot", label: "平方英尺", symbol: "ft²", factor: 0.092903 },
            { value: "squareYard", label: "平方码", symbol: "yd²", factor: 0.836127 },
            { value: "acre", label: "英亩", symbol: "ac", factor: 4046.86 },
            { value: "hectare", label: "公顷", symbol: "ha", factor: 10000 },
          ],
        },
        {
          value: "volume",
          label: "体积",
          baseUnit: "liter",
          units: [
            { value: "liter", label: "升", symbol: "L", factor: 1 },
            { value: "milliliter", label: "毫升", symbol: "mL", factor: 0.001 },
            { value: "cubicMeter", label: "立方米", symbol: "m³", factor: 1000 },
            { value: "cubicCentimeter", label: "立方厘米", symbol: "cm³", factor: 0.001 },
            { value: "cubicInch", label: "立方英寸", symbol: "in³", factor: 0.0163871 },
            { value: "cubicFoot", label: "立方英尺", symbol: "ft³", factor: 28.3168 },
            { value: "gallon", label: "加仑", symbol: "gal", factor: 3.78541 },
            { value: "quart", label: "夸脱", symbol: "qt", factor: 0.946353 },
            { value: "pint", label: "品脱", symbol: "pt", factor: 0.473176 },
            { value: "cup", label: "杯", symbol: "cup", factor: 0.236588 },
          ],
        },
      ],

      // 选中的单位类型
      selectedUnitType: "length",

      // 输入值
      inputValue: 1,

      // 输出值
      outputValue: 1,

      // 输入单位
      fromUnit: "meter",

      // 输出单位
      toUnit: "kilometer",

      // 转换历史
      conversionHistory: [],

      // 最大历史记录数
      maxHistoryLength: 10,

      // 常用转换快捷方式
      quickConversions: {
        length: [
          { id: "1", label: "1米 = 100厘米", from: 1, fromUnit: "meter", toUnit: "centimeter" },
          { id: "2", label: "1千米 = 1000米", from: 1, fromUnit: "kilometer", toUnit: "meter" },
          { id: "3", label: "1英尺 = 12英寸", from: 1, fromUnit: "foot", toUnit: "inch" },
          { id: "4", label: "1英里 = 1.609千米", from: 1, fromUnit: "mile", toUnit: "kilometer" },
        ],
        weight: [
          { id: "1", label: "1千克 = 1000克", from: 1, fromUnit: "kilogram", toUnit: "gram" },
          { id: "2", label: "1磅 = 16盎司", from: 1, fromUnit: "pound", toUnit: "ounce" },
          { id: "3", label: "1千克 = 2.205磅", from: 1, fromUnit: "kilogram", toUnit: "pound" },
          { id: "4", label: "1吨 = 1000千克", from: 1, fromUnit: "ton", toUnit: "kilogram" },
        ],
        temperature: [
          { id: "1", label: "0°C = 32°F", from: 0, fromUnit: "celsius", toUnit: "fahrenheit" },
          { id: "2", label: "100°C = 212°F", from: 100, fromUnit: "celsius", toUnit: "fahrenheit" },
          { id: "3", label: "0°C = 273.15K", from: 0, fromUnit: "celsius", toUnit: "kelvin" },
          { id: "4", label: "25°C = 77°F", from: 25, fromUnit: "celsius", toUnit: "fahrenheit" },
        ],
        area: [
          { id: "1", label: "1平方米 = 10000平方厘米", from: 1, fromUnit: "squareMeter", toUnit: "squareCentimeter" },
          { id: "2", label: "1公顷 = 10000平方米", from: 1, fromUnit: "hectare", toUnit: "squareMeter" },
          { id: "3", label: "1英亩 = 4046.86平方米", from: 1, fromUnit: "acre", toUnit: "squareMeter" },
          { id: "4", label: "1平方千米 = 100公顷", from: 1, fromUnit: "squareKilometer", toUnit: "hectare" },
        ],
        volume: [
          { id: "1", label: "1升 = 1000毫升", from: 1, fromUnit: "liter", toUnit: "milliliter" },
          { id: "2", label: "1加仑 = 3.785升", from: 1, fromUnit: "gallon", toUnit: "liter" },
          { id: "3", label: "1立方米 = 1000升", from: 1, fromUnit: "cubicMeter", toUnit: "liter" },
          { id: "4", label: "1杯 = 236.588毫升", from: 1, fromUnit: "cup", toUnit: "milliliter" },
        ],
      },
    }
  },
  computed: {
    // 当前选中的单位类型配置
    currentUnitType() {
      return this.unitTypes.find((type) => type.value === this.selectedUnitType) || this.unitTypes[0]
    },

    // 当前单位类型的常用转换
    currentQuickConversions() {
      return this.quickConversions[this.selectedUnitType] || []
    },

    // 格式化输入单位选项
    formattedInputUnits() {
      return this.currentUnitType.units.map((unit) => ({
        value: unit.value,
        label: `${unit.label} (${unit.symbol})`,
      }))
    },

    // 格式化输出单位选项
    formattedOutputUnits() {
      return this.currentUnitType.units.map((unit) => ({
        value: unit.value,
        label: `${unit.label} (${unit.symbol})`,
      }))
    },
  },
  mounted() {
    // 初始化转换
    this.convertUnits()
  },
  methods: {
    // 重置转换器
    resetConverter() {
      // 重置输入值
      this.inputValue = 1

      // 重置单位选择
      this.fromUnit = this.currentUnitType.units[0].value
      this.toUnit = this.currentUnitType.units[1].value || this.currentUnitType.units[0].value

      // 执行转换
      this.convertUnits()
    },

    // 转换单位
    convertUnits() {
      if (this.inputValue === null || this.inputValue === undefined || isNaN(this.inputValue)) {
        this.outputValue = ""
        return
      }

      let result

      // 温度转换（特殊处理）
      if (this.selectedUnitType === "temperature") {
        result = this.convertTemperature(this.inputValue, this.fromUnit, this.toUnit)
      } else {
        // 其他单位转换（基于因子）
        result = this.convertByFactor(this.inputValue, this.fromUnit, this.toUnit)
      }

      // 保留合适的小数位数
      this.outputValue = this.roundResult(result)

      // 添加到历史记录
      this.addToHistory()
    },

    // 基于因子的转换
    convertByFactor(value, fromUnit, toUnit) {
      // 获取输入单位的因子
      const fromFactor = this.currentUnitType.units.find((unit) => unit.value === fromUnit)?.factor || 1
      // 获取输出单位的因子
      const toFactor = this.currentUnitType.units.find((unit) => unit.value === toUnit)?.factor || 1

      // 转换公式：value * fromFactor / toFactor
      return (value * fromFactor) / toFactor
    },

    // 温度转换
    convertTemperature(value, fromUnit, toUnit) {
      let celsius

      // 先转换为摄氏度
      switch (fromUnit) {
        case "celsius":
          celsius = value
          break
        case "fahrenheit":
          celsius = ((value - 32) * 5) / 9
          break
        case "kelvin":
          celsius = value - 273.15
          break
        default:
          celsius = value
      }

      // 再从摄氏度转换为目标单位
      let result
      switch (toUnit) {
        case "celsius":
          result = celsius
          break
        case "fahrenheit":
          result = (celsius * 9) / 5 + 32
          break
        case "kelvin":
          result = celsius + 273.15
          break
        default:
          result = celsius
      }

      return result
    },

    // 交换单位
    swapUnits() {
      const tempUnit = this.fromUnit
      this.fromUnit = this.toUnit
      this.toUnit = tempUnit

      // 交换输入输出值
      const tempValue = this.inputValue
      this.inputValue = this.outputValue
      this.outputValue = tempValue

      // 执行转换
      this.convertUnits()
    },

    // 应用常用转换
    applyQuickConversion(quick) {
      this.inputValue = quick.from
      this.fromUnit = quick.fromUnit
      this.toUnit = quick.toUnit
      this.convertUnits()
    },

    // 四舍五入结果
    roundResult(value) {
      // 根据数值大小选择合适的小数位数
      if (Math.abs(value) >= 1000) {
        return Math.round(value)
      } else if (Math.abs(value) >= 1) {
        return parseFloat(value.toFixed(4))
      } else {
        return parseFloat(value.toFixed(6))
      }
    },

    // 添加到转换历史
    addToHistory() {
      if (this.inputValue === null || this.inputValue === undefined || isNaN(this.inputValue)) {
        return
      }

      const fromUnitSymbol = this.currentUnitType.units.find((unit) => unit.value === this.fromUnit)?.symbol || ""
      const toUnitSymbol = this.currentUnitType.units.find((unit) => unit.value === this.toUnit)?.symbol || ""

      const historyItem = {
        inputValue: this.inputValue,
        fromUnitSymbol: fromUnitSymbol,
        outputValue: this.outputValue,
        toUnitSymbol: toUnitSymbol,
        typeLabel: this.currentUnitType.label,
        timestamp: new Date().toISOString(),
      }

      // 添加到历史记录开头
      this.conversionHistory.unshift(historyItem)

      // 限制历史记录数量
      if (this.conversionHistory.length > this.maxHistoryLength) {
        this.conversionHistory = this.conversionHistory.slice(0, this.maxHistoryLength)
      }
    },

    // 清除转换历史
    clearHistory() {
      this.conversionHistory = []
    },
  },
}
</script>

<style scoped>
/* 单位转换工具样式 */
.unit-converter-tool {
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

/* 单位类型选择区域 */
.unit-type-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unit-type-section label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.unit-type-select {
  padding: 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.unit-type-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 转换区域 */
.conversion-section {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 30px;
}

/* 单位输入组 */
.unit-input-group,
.unit-output-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.unit-input-group h3,
.unit-output-group h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-align: center;
}

/* 输入输出包装器 */
.input-wrapper,
.output-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 值输入框 */
.value-input,
.value-output {
  padding: 15px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1.2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.value-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.value-output {
  background: var(--secondary-bg);
  cursor: default;
}

/* 自定义下拉列表样式覆盖 */
:deep(.custom-select-container) {
  width: 100%;
  max-width: none;
}

:deep(.custom-select-header) {
  padding: 12px;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

:deep(.custom-select-options) {
  border-radius: var(--border-radius);
}

/* 交换按钮区域 */
.swap-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 交换按钮 */
.swap-btn {
  width: 50px;
  height: 50px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn:hover {
  background: var(--accent-color-hover);
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 历史记录区域 */
.history-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

/* 清除历史按钮 */
.clear-history-btn {
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

.clear-history-btn:hover {
  background: var(--error-color-hover);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* 历史记录列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

/* 历史记录项 */
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
}

.history-text {
  color: var(--text-primary);
  font-family: "Courier New", Courier, monospace;
}

.history-type {
  color: var(--text-secondary);
  font-size: 0.8rem;
  background: var(--card-bg);
  padding: 4px 8px;
  border-radius: var(--border-radius);
}

/* 常用转换区域 */
.quick-conversions-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
}

.quick-conversions-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-align: center;
}

/* 常用转换网格 */
.quick-conversions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

/* 常用转换按钮 */
.quick-conversion-btn {
  padding: 12px 15px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-conversion-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 转换区域 */
  .conversion-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 20px;
    padding: 20px;
  }

  /* 交换按钮 */
  .swap-section {
    order: 2;
  }

  .unit-input-group {
    order: 1;
  }

  .unit-output-group {
    order: 3;
  }

  /* 常用转换网格 */
  .quick-conversions-grid {
    grid-template-columns: 1fr;
  }

  /* 历史记录列表 */
  .history-list {
    max-height: 150px;
  }
}
</style>
