<template>
  <div class="countdown-tool">
    <div class="tool-header">
      <p>倒计时生成器工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="countdown-date">选择目标日期和时间</label>
          <div class="datetime-inputs">
            <input
              type="date"
              id="countdown-date"
              v-model="countdownDate"
              @change="updateCountdown"
              class="date-input"
            />
            <input
              type="time"
              id="countdown-time"
              v-model="countdownTime"
              @change="updateCountdown"
              class="time-input"
            />
          </div>
        </div>

        <div class="option-group">
          <label>倒计时标题</label>
          <input
            type="text"
            v-model="countdownTitle"
            placeholder="请输入倒计时标题..."
            class="text-input"
            @input="updateCountdown"
          />
        </div>

        <div class="option-group">
          <label>显示选项</label>
          <div class="checkbox-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showDays" @change="updateCountdown" />
              <span>显示天</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showHours" @change="updateCountdown" />
              <span>显示小时</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showMinutes" @change="updateCountdown" />
              <span>显示分钟</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showSeconds" @change="updateCountdown" />
              <span>显示秒</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label>倒计时样式</label>
          <custom-select
            v-model="countdownStyle"
            :options="styleOptions"
            @update:modelValue="updateCountdown"
          ></custom-select>
        </div>

        <div class="option-group">
          <label>预设日期</label>
          <div class="preset-buttons">
            <button class="preset-btn" @click="setPresetDate('tomorrow')">明天</button>
            <button class="preset-btn" @click="setPresetDate('next-week')">下周</button>
            <button class="preset-btn" @click="setPresetDate('next-month')">下月</button>
            <button class="preset-btn" @click="setPresetDate('next-year')">明年</button>
          </div>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="text-output-section">
        <div class="option-group">
          <div class="output-header">
            <label>倒计时预览</label>
            <button class="copy-btn" @click="copyCountdown" :disabled="!countdownText">复制</button>
          </div>
          <div class="countdown-preview">
            <div class="countdown-container" :class="countdownStyle">
              <h3 class="countdown-title" v-if="countdownTitle">{{ countdownTitle }}</h3>
              <div class="countdown-display">
                <div class="countdown-item" v-if="showDays">
                  <div class="countdown-value">{{ countdownDays }}</div>
                  <div class="countdown-label">天</div>
                </div>
                <div class="countdown-separator" v-if="showDays && (showHours || showMinutes || showSeconds)">:</div>
                <div class="countdown-item" v-if="showHours">
                  <div class="countdown-value">{{ countdownHours }}</div>
                  <div class="countdown-label">时</div>
                </div>
                <div class="countdown-separator" v-if="showHours && (showMinutes || showSeconds)">:</div>
                <div class="countdown-item" v-if="showMinutes">
                  <div class="countdown-value">{{ countdownMinutes }}</div>
                  <div class="countdown-label">分</div>
                </div>
                <div class="countdown-separator" v-if="showMinutes && showSeconds">:</div>
                <div class="countdown-item" v-if="showSeconds">
                  <div class="countdown-value">{{ countdownSeconds }}</div>
                  <div class="countdown-label">秒</div>
                </div>
              </div>
              <div class="countdown-text" v-if="countdownText">{{ countdownText }}</div>
            </div>
          </div>
        </div>

        <div class="option-group" v-if="countdownText">
          <label>倒计时文本</label>
          <textarea
            v-model="countdownText"
            placeholder="倒计时文本将显示在这里..."
            class="text-output"
            readonly
          ></textarea>
        </div>

        <div class="option-group">
          <button class="download-btn" @click="downloadCountdown">下载倒计时图片</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useToolUtils } from '../../composables/useToolUtils'
import CustomSelect from '../CustomSelect.vue'

export default {
  name: "ToolCountdown",
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
      // 倒计时相关配置
      countdownDate: '', // 目标日期
      countdownTime: '00:00', // 目标时间
      countdownTitle: '', // 倒计时标题
      showDays: true, // 是否显示天
      showHours: true, // 是否显示小时
      showMinutes: true, // 是否显示分钟
      showSeconds: true, // 是否显示秒
      countdownStyle: 'style1', // 倒计时样式
      
      // 倒计时状态
      countdownDays: '00', // 天
      countdownHours: '00', // 小时
      countdownMinutes: '00', // 分钟
      countdownSeconds: '00', // 秒
      countdownText: '', // 倒计时文本
      
      // 样式选项
      styleOptions: [
        { value: 'style1', label: '样式 1' },
        { value: 'style2', label: '样式 2' },
        { value: 'style3', label: '样式 3' }
      ],
      
      // 定时器
      timer: null
    }
  },
  computed: {
    // 计算目标日期时间
    targetDatetime() {
      if (!this.countdownDate) return null
      return new Date(`${this.countdownDate}T${this.countdownTime}`)
    }
  },
  methods: {
    // 更新倒计时
    updateCountdown() {
      if (!this.targetDatetime) {
        this.resetCountdown()
        return
      }
      
      this.calculateCountdown()
    },
    
    // 计算倒计时
    calculateCountdown() {
      const now = new Date()
      const target = this.targetDatetime
      
      // 计算时间差（毫秒）
      const timeDiff = target - now
      
      if (timeDiff <= 0) {
        // 倒计时结束
        this.countdownDays = '00'
        this.countdownHours = '00'
        this.countdownMinutes = '00'
        this.countdownSeconds = '00'
        this.countdownText = this.countdownTitle ? `${this.countdownTitle}已结束！` : '倒计时已结束！'
        return
      }
      
      // 计算天、时、分、秒
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      // 更新倒计时显示
      this.countdownDays = days.toString().padStart(2, '0')
      this.countdownHours = hours.toString().padStart(2, '0')
      this.countdownMinutes = minutes.toString().padStart(2, '0')
      this.countdownSeconds = seconds.toString().padStart(2, '0')
      
      // 更新倒计时文本
      this.updateCountdownText(days, hours, minutes, seconds)
    },
    
    // 更新倒计时文本
    updateCountdownText(days, hours, minutes, seconds) {
      let text = ''
      
      if (this.countdownTitle) {
        text += `${this.countdownTitle} 还有 `
      } else {
        text += '距离目标日期还有 '
      }
      
      if (this.showDays) {
        text += `${days} 天 `
      }
      if (this.showHours) {
        text += `${hours} 小时 `
      }
      if (this.showMinutes) {
        text += `${minutes} 分钟 `
      }
      if (this.showSeconds) {
        text += `${seconds} 秒 `
      }
      
      this.countdownText = text.trim()
    },
    
    // 重置倒计时
    resetCountdown() {
      this.countdownDays = '00'
      this.countdownHours = '00'
      this.countdownMinutes = '00'
      this.countdownSeconds = '00'
      this.countdownText = ''
    },
    
    // 设置预设日期
    setPresetDate(preset) {
      const now = new Date()
      const target = new Date(now)
      
      switch (preset) {
        case 'tomorrow':
          target.setDate(now.getDate() + 1)
          break
        case 'next-week':
          target.setDate(now.getDate() + 7)
          break
        case 'next-month':
          target.setMonth(now.getMonth() + 1)
          break
        case 'next-year':
          target.setFullYear(now.getFullYear() + 1)
          break
      }
      
      // 更新日期和时间
      this.countdownDate = target.toISOString().split('T')[0]
      this.countdownTime = '00:00'
      
      // 更新倒计时
      this.updateCountdown()
    },
    
    // 复制倒计时
    copyCountdown() {
      this.copyToClipboard(this.countdownText)
        .then(success => {
          if (success) {
            console.log("倒计时文本已复制到剪贴板")
            // 可以添加复制成功的提示
          }
        })
    },
    
    // 下载倒计时图片
    downloadCountdown() {
      // 这里可以实现倒计时图片下载功能
      alert("倒计时图片下载功能将在后续版本中实现")
    },
    
    // 启动定时器
    startTimer() {
      this.timer = setInterval(() => {
        this.calculateCountdown()
      }, 1000)
    },
    
    // 停止定时器
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  },
  mounted() {
    // 设置默认日期为明天
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    this.countdownDate = tomorrow.toISOString().split('T')[0]
    
    // 更新倒计时
    this.updateCountdown()
    
    // 启动定时器
    this.startTimer()
  },
  beforeUnmount() {
    // 停止定时器
    this.stopTimer()
  }
}
</script>

<style scoped>
/* 倒计时工具样式 */
.countdown-tool {
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

/* 日期时间输入 */
.datetime-inputs {
  display: flex;
  gap: 10px;
}

.date-input,
.time-input,
.text-input {
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.date-input:focus,
.time-input:focus,
.text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.date-input,
.time-input {
  flex: 1;
}

/* 复选框选项 */
.checkbox-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* 样式选项 */
.style-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 预设按钮 */
.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.preset-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-btn:hover {
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

/* 倒计时预览 */
.countdown-preview {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 倒计时容器 */
.countdown-container {
  text-align: center;
  width: 100%;
  padding: 20px;
  border-radius: var(--border-radius);
  background: var(--primary-bg);
}

/* 倒计时标题 */
.countdown-title {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

/* 倒计时显示 */
.countdown-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 倒计时项 */
.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

/* 倒计时值 */
.countdown-value {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Courier New', Courier, monospace;
}

/* 倒计时标签 */
.countdown-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* 倒计时分隔符 */
.countdown-separator {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);
  margin: 0 5px;
}

/* 倒计时文本 */
.countdown-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 10px;
}

/* 样式 1 */
.countdown-container.style1 .countdown-value {
  color: var(--accent-color);
}

/* 样式 2 */
.countdown-container.style2 {
  background: var(--gradient-primary);
  color: white;
}

.countdown-container.style2 .countdown-title,
.countdown-container.style2 .countdown-value,
.countdown-container.style2 .countdown-label,
.countdown-container.style2 .countdown-separator,
.countdown-container.style2 .countdown-text {
  color: white;
}

.countdown-container.style2 .countdown-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: var(--border-radius);
}

/* 样式 3 */
.countdown-container.style3 .countdown-item {
  background: var(--secondary-bg);
  padding: 15px 25px;
  border-radius: var(--border-radius);
  border: 2px solid var(--accent-color);
}

.countdown-container.style3 .countdown-value {
  color: var(--accent-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .datetime-inputs {
    flex-direction: column;
  }
  
  .checkbox-options {
    grid-template-columns: 1fr;
  }
  
  .preset-buttons {
    grid-template-columns: 1fr;
  }
  
  .countdown-display {
    gap: 15px;
  }
  
  .countdown-value {
    font-size: 1.5rem;
  }
  
  .countdown-separator {
    font-size: 1.5rem;
  }
  
  .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>