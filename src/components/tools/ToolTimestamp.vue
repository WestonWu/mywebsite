<template>
  <div class="timestamp-tool">
    <div class="tool-header">
      <p>时间戳转换工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="timestamp-input">输入时间戳或日期时间</label>
          <textarea
            id="timestamp-input"
            v-model="timestampInput"
            placeholder="请输入时间戳或日期时间..."
            class="text-input"
            @input="processTimestamp"
          ></textarea>
        </div>

        <div class="option-group">
          <label>操作类型</label>
          <div class="conversion-options">
            <label class="radio-label">
              <input type="radio" v-model="timestampOperation" value="timestamp-to-date" @change="processTimestamp" />
              <span>时间戳转日期</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="timestampOperation" value="date-to-timestamp" @change="processTimestamp" />
              <span>日期转时间戳</span>
            </label>
          </div>
        </div>

        <div class="option-group" v-if="timestampOperation === 'timestamp-to-date'">
          <label>时间戳格式</label>
          <div class="radio-options">
            <label class="radio-label">
              <input type="radio" v-model="timestampFormat" value="seconds" @change="processTimestamp" />
              <span>秒 (10位)</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="timestampFormat" value="milliseconds" @change="processTimestamp" />
              <span>毫秒 (13位)</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label>日期格式</label>
          <div class="format-options">
            <custom-select
              v-model="dateFormat"
              :options="dateFormatOptions"
              @update:modelValue="processTimestamp"
            ></custom-select>
            <button class="current-time-btn" @click="getCurrentTimestamp">获取当前时间戳</button>
          </div>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="text-output-section">
        <div class="option-group">
          <div class="output-header">
            <label>输出结果</label>
            <button class="copy-btn" @click="copyTimestampOutput" :disabled="!timestampOutput">复制</button>
          </div>
          <textarea
            v-model="timestampOutput"
            placeholder="处理结果将显示在这里..."
            class="text-output"
            readonly
          ></textarea>
        </div>

        <div class="option-group" v-if="timestampOperation === 'timestamp-to-date' && timestampOutput && isValidDate">
          <label>详细日期信息</label>
          <div class="date-details">
            <div class="detail-item">
              <span class="detail-label">年份:</span>
              <span class="detail-value">{{ dateDetails.year }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">月份:</span>
              <span class="detail-value">{{ dateDetails.month }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">日期:</span>
              <span class="detail-value">{{ dateDetails.day }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">星期:</span>
              <span class="detail-value">{{ dateDetails.weekday }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">小时:</span>
              <span class="detail-value">{{ dateDetails.hours }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">分钟:</span>
              <span class="detail-value">{{ dateDetails.minutes }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">秒:</span>
              <span class="detail-value">{{ dateDetails.seconds }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">毫秒:</span>
              <span class="detail-value">{{ dateDetails.milliseconds }}</span>
            </div>
          </div>
        </div>

        <div class="option-group" v-if="timestampOutput">
          <button class="download-btn" @click="downloadResult">下载结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from '../../composables/useToolUtils'
import CustomSelect from '../CustomSelect.vue'

export default {
  name: "ToolTimestamp",
  components: {
    CustomSelect
  },
  setup() {
    const { 
      copyToClipboard,
      generateRandomId 
    } = useToolUtils()
    
    return {
      copyToClipboard,
      generateRandomId
    }
  },
  data() {
    return {
      // 时间戳转换相关配置
      timestampInput: "", // 输入文本
      timestampOutput: "", // 输出文本
      timestampOperation: "timestamp-to-date", // 操作类型：timestamp-to-date, date-to-timestamp
      timestampFormat: "seconds", // 时间戳格式：seconds, milliseconds
      dateFormat: "YYYY-MM-DD HH:mm:ss", // 日期格式
      isValidDate: false, // 是否为有效的日期
      dateDetails: {}, // 详细日期信息
      
      // 日期格式选项
      dateFormatOptions: [
        { value: "YYYY-MM-DD HH:mm:ss", label: "YYYY-MM-DD HH:mm:ss" },
        { value: "YYYY/MM/DD HH:mm:ss", label: "YYYY/MM/DD HH:mm:ss" },
        { value: "MM-DD-YYYY HH:mm:ss", label: "MM-DD-YYYY HH:mm:ss" },
        { value: "DD/MM/YYYY HH:mm:ss", label: "DD/MM/YYYY HH:mm:ss" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
        { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
        { value: "MM-DD-YYYY", label: "MM-DD-YYYY" },
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "HH:mm:ss", label: "HH:mm:ss" },
        { value: "YYYY-MM-DD HH:mm:ss.SSS", label: "YYYY-MM-DD HH:mm:ss.SSS" }
      ]
    }
  },
  methods: {
    // 处理时间戳转换
    processTimestamp() {
      if (!this.timestampInput) {
        this.timestampOutput = ""
        this.isValidDate = false
        this.dateDetails = {}
        return
      }

      try {
        if (this.timestampOperation === "timestamp-to-date") {
          // 时间戳转日期
          this.timestampOutput = this.timestampToDate(this.timestampInput, this.timestampFormat, this.dateFormat)
        } else {
          // 日期转时间戳
          this.timestampOutput = this.dateToTimestamp(this.timestampInput, this.timestampFormat)
        }
        this.isValidDate = true
      } catch (error) {
        this.timestampOutput = `处理失败: ${error.message}`
        this.isValidDate = false
        this.dateDetails = {}
      }
    },
    
    // 时间戳转日期
    timestampToDate(timestamp, format, dateFormat) {
      // 移除所有非数字字符
      const cleanTimestamp = timestamp.replace(/[^0-9]/g, "")
      
      // 检查时间戳长度，自动判断格式
      let timestampMs
      if (cleanTimestamp.length === 10) {
        // 秒级时间戳
        timestampMs = parseInt(cleanTimestamp) * 1000
      } else if (cleanTimestamp.length === 13) {
        // 毫秒级时间戳
        timestampMs = parseInt(cleanTimestamp)
      } else {
        throw new Error("无效的时间戳格式，请输入10位（秒）或13位（毫秒）时间戳")
      }
      
      // 创建日期对象
      const date = new Date(timestampMs)
      
      // 更新详细日期信息
      this.updateDateDetails(date)
      
      // 格式化日期
      return this.formatDate(date, dateFormat)
    },
    
    // 日期转时间戳
    dateToTimestamp(dateStr, format) {
      // 尝试解析日期
      const date = new Date(dateStr)
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        throw new Error("无效的日期格式，请输入正确的日期时间")
      }
      
      // 更新详细日期信息
      this.updateDateDetails(date)
      
      // 转换为时间戳
      if (format === "seconds") {
        return Math.floor(date.getTime() / 1000).toString()
      } else {
        return date.getTime().toString()
      }
    },
    
    // 更新详细日期信息
    updateDateDetails(date) {
      const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
      
      this.dateDetails = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        weekday: weekdays[date.getDay()],
        hours: date.getHours().toString().padStart(2, "0"),
        minutes: date.getMinutes().toString().padStart(2, "0"),
        seconds: date.getSeconds().toString().padStart(2, "0"),
        milliseconds: date.getMilliseconds().toString().padStart(3, "0")
      }
    },
    
    // 格式化日期
    formatDate(date, format) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const seconds = date.getSeconds().toString().padStart(2, "0")
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0")
      
      // 替换格式字符串中的占位符
      return format
        .replace("YYYY", year)
        .replace("MM", month)
        .replace("DD", day)
        .replace("HH", hours)
        .replace("mm", minutes)
        .replace("ss", seconds)
        .replace("SSS", milliseconds)
    },
    
    // 获取当前时间戳
    getCurrentTimestamp() {
      const now = Date.now()
      let timestamp
      
      if (this.timestampFormat === "seconds") {
        timestamp = Math.floor(now / 1000).toString()
      } else {
        timestamp = now.toString()
      }
      
      this.timestampInput = timestamp
      this.processTimestamp()
    },
    
    // 复制结果
    copyTimestampOutput() {
      this.copyToClipboard(this.timestampOutput)
        .then(success => {
          if (success) {
            console.log("时间戳转换结果已复制到剪贴板")
            // 可以添加复制成功的提示
          }
        })
    },
    
    // 下载结果
    downloadResult() {
      if (!this.timestampOutput) return
      
      const filename = `timestamp_conversion_${this.generateRandomId(8)}.txt`
      const blob = new Blob([this.timestampOutput], { type: 'text/plain' })
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  },
}
</script>

<style scoped>
/* 时间戳转换工具样式 */
.timestamp-tool {
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
  gap: 20px;
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
  height: 150px;
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
.conversion-options,
.radio-options {
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

/* 格式选项 */
.format-options {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 当前时间按钮 */
.current-time-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.current-time-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 复制按钮 */
.copy-btn,
.download-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover:not(:disabled),
.download-btn:hover {
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

/* 日期详细信息 */
.date-details {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 详细信息项 */
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 详细信息标签 */
.detail-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 详细信息值 */
.detail-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
  font-family: 'Courier New', Courier, monospace;
}

/* 输出头部 */
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 下载按钮 */
.download-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .text-input,
  .text-output {
    height: 120px;
  }
  
  .conversion-options,
  .radio-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .format-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .date-details {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>