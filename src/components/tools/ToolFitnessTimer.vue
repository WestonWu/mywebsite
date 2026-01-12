<template>
  <div class="fitness-timer-tool">
    <div class="tool-header">
      <p>健身计时工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：配置区域 -->
      <div class="config-section">
        <!-- 总时长设置 -->
        <div class="option-group">
          <label for="total-duration">总训练时长 (分钟)</label>
          <input
            type="number"
            id="total-duration"
            v-model.number="totalDuration"
            min="1"
            max="120"
            class="number-input"
            @input="updateConfig"
          />
        </div>

        <!-- 休息时间设置 -->
        <div class="option-group">
          <label for="rest-time">组间休息时间 (秒)</label>
          <input
            type="number"
            id="rest-time"
            v-model.number="restTime"
            min="10"
            max="120"
            class="number-input"
            @input="updateConfig"
          />
        </div>

        <!-- 动作配置 -->
        <div class="option-group">
          <label>健身动作配置</label>
          <div class="exercise-list">
            <div v-for="(exercise, index) in exercises" :key="index" class="exercise-item">
              <div class="exercise-inputs">
                <input
                  type="text"
                  v-model="exercise.name"
                  placeholder="动作名称"
                  class="exercise-name-input"
                  @input="updateConfig"
                />
                <input
                  type="number"
                  v-model.number="exercise.sets"
                  placeholder="组数"
                  min="1"
                  max="10"
                  class="exercise-sets-input"
                  @input="updateConfig"
                />
                <div class="exercise-reps-type">
                  <input
                    type="number"
                    v-model.number="exercise.reps"
                    :placeholder="exercise.type === 'reps' ? '次数' : '秒数'"
                    min="1"
                    max="120"
                    class="exercise-reps-input"
                    @input="updateConfig"
                  />
                  <select v-model="exercise.type" class="exercise-type-select" @change="updateConfig">
                    <option value="reps">次</option>
                    <option value="time">秒</option>
                  </select>
                </div>
              </div>
              <button class="remove-exercise-btn" @click="removeExercise(index)" :disabled="exercises.length <= 1">
                ✕
              </button>
            </div>
          </div>
          <button class="add-exercise-btn" @click="addExercise">+ 添加动作</button>
        </div>

        <!-- 预设动作模板 -->
        <div class="option-group">
          <label>预设动作模板</label>
          <div class="preset-buttons">
            <button class="preset-btn" @click="loadPreset('basic')">基础训练</button>
            <button class="preset-btn" @click="loadPreset('full-body')">全身训练</button>
            <button class="preset-btn" @click="loadPreset('core')">核心训练</button>
          </div>
        </div>
      </div>

      <!-- 右侧：显示和控制区域 -->
      <div class="display-section">
        <!-- 状态显示 -->
        <div class="status-display">
          <div class="status-indicator" :class="currentStatus"></div>
          <div class="status-text">{{ statusText }}</div>
        </div>

        <!-- 倒计时显示 -->
        <div class="countdown-display">
          <div class="countdown-time">{{ formattedCountdown }}</div>
        </div>

        <!-- 动作信息显示 -->
        <div class="exercise-info">
          <div class="current-exercise">{{ currentExerciseInfo }}</div>
          <div class="exercise-progress">
            第 {{ currentSet }} / {{ maxRounds }} 轮 · {{ currentRep }} / {{ currentExerciseReps }}
            {{ currentExercise?.type === "time" ? "秒" : "次" }}
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
          <button class="control-btn start-btn" @click="startTimer" :disabled="isRunning">开始</button>
          <button class="control-btn pause-btn" @click="pauseTimer" :disabled="!isRunning || isPaused">暂停</button>
          <button class="control-btn resume-btn" @click="resumeTimer" :disabled="!isPaused">继续</button>
          <button class="control-btn reset-btn" @click="resetTimer">重置</button>
        </div>

        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-label">训练进度</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <div class="progress-text">{{ progressPercentage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount } from "vue"

export default {
  name: "ToolFitnessTimer",
  setup() {
    return {}
  },
  data() {
    return {
      // 配置参数
      totalDuration: 30, // 总训练时长（分钟）
      restTime: 60, // 组间休息时间（秒）
      exercises: [
        { name: "俯卧撑", sets: 4, reps: 10, type: "reps" },
        { name: "深蹲", sets: 4, reps: 20, type: "reps" },
        { name: "高抬腿", sets: 4, reps: 40, type: "reps" },
        { name: "平板支撑", sets: 3, reps: 30, type: "time" }, // 平板支撑改为计时模式
      ],

      // 训练状态
      isRunning: false, // 是否正在运行
      isPaused: false, // 是否暂停
      currentStatus: "idle", // 状态：idle, training, resting
      totalTime: 0, // 总时间（秒）
      remainingTime: 0, // 剩余时间（秒）
      currentExerciseIndex: 0, // 当前动作索引
      currentSet: 1, // 当前组数
      currentRep: 1, // 当前次数
      repTime: 0, // 每次动作的时间（毫秒）
      setStartTime: 0, // 当前组开始时间
      timer: null, // 主定时器
      repTimer: null, // 动作次数定时器

      // 预设动作模板
      presets: {
        basic: [
          { name: "斜板俯卧撑", sets: 4, reps: 12, type: "reps" },
          { name: "深蹲", sets: 4, reps: 20, type: "reps" },
          { name: "高抬腿", sets: 4, reps: 40, type: "reps" },
          { name: "平板支撑", sets: 3, reps: 30, type: "time" },
        ],
        "full-body": [
          { name: "俯卧撑", sets: 4, reps: 10, type: "reps" },
          { name: "深蹲", sets: 4, reps: 20, type: "reps" },
          { name: "箭步蹲", sets: 4, reps: 15, type: "reps" },
          { name: "平板支撑", sets: 3, reps: 30, type: "time" },
          { name: "仰卧起坐", sets: 4, reps: 25, type: "reps" },
        ],
        core: [
          { name: "平板支撑", sets: 4, reps: 40, type: "time" },
          { name: "仰卧起坐", sets: 4, reps: 30, type: "reps" },
          { name: "侧平板支撑", sets: 4, reps: 25, type: "time" },
          { name: "俄罗斯转体", sets: 4, reps: 30, type: "reps" },
        ],
      },
    }
  },
  computed: {
    // 总组数
    totalSets() {
      return this.exercises.reduce((total, exercise) => total + exercise.sets, 0)
    },

    // 最大轮次数
    maxRounds() {
      return Math.max(...this.exercises.map((exercise) => exercise.sets))
    },

    // 当前动作
    currentExercise() {
      return this.exercises[this.currentExerciseIndex]
    },

    // 当前动作的次数
    currentExerciseReps() {
      return this.currentExercise?.reps || 0
    },

    // 当前动作信息
    currentExerciseInfo() {
      if (this.currentStatus === "resting") {
        return "休息时间"
      }
      return this.currentExercise?.name || "准备开始"
    },

    // 状态文本
    statusText() {
      switch (this.currentStatus) {
        case "training":
          return "训练中"
        case "resting":
          return "休息中"
        default:
          return "准备开始"
      }
    },

    // 格式化倒计时
    formattedCountdown() {
      const minutes = Math.floor(this.remainingTime / 60)
      const seconds = this.remainingTime % 60
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    },

    // 进度百分比
    progressPercentage() {
      if (this.totalTime === 0) return 0
      const elapsed = this.totalTime - this.remainingTime
      return Math.round((elapsed / this.totalTime) * 100)
    },
  },
  methods: {
    // 更新配置
    updateConfig() {
      this.calculateTotalTime()
      this.saveConfig() // 保存配置
    },

    // 计算总时间
    calculateTotalTime() {
      this.totalTime = this.totalDuration * 60
      this.remainingTime = this.totalTime
    },

    // 添加动作
    addExercise() {
      this.exercises.push({ name: "新动作", sets: 3, reps: 10, type: "reps" })
      this.updateConfig()
    },

    // 移除动作
    removeExercise(index) {
      if (this.exercises.length > 1) {
        this.exercises.splice(index, 1)
        this.updateConfig()
      }
    },

    // 加载预设动作
    loadPreset(presetName) {
      this.exercises = JSON.parse(JSON.stringify(this.presets[presetName]))
      this.updateConfig()
    },

    // 加载配置
    loadConfig() {
      try {
        const savedConfig = localStorage.getItem("fitness-timer-config")
        if (savedConfig) {
          const config = JSON.parse(savedConfig)
          // 验证数据格式并加载
          if (typeof config.totalDuration === "number") this.totalDuration = config.totalDuration
          if (typeof config.restTime === "number") this.restTime = config.restTime
          if (Array.isArray(config.exercises)) {
            // 验证每个动作的数据格式
            const validExercises = config.exercises
              .filter((exercise) => {
                return (
                  exercise &&
                  typeof exercise.name === "string" &&
                  typeof exercise.sets === "number" &&
                  typeof exercise.reps === "number"
                )
              })
              .map((exercise) => {
                // 为没有type属性的动作添加默认值
                if (!exercise.type) {
                  // 平板支撑默认设置为计时模式
                  if (exercise.name.includes("平板支撑") || exercise.name.includes("侧平板支撑")) {
                    exercise.type = "time"
                  } else {
                    exercise.type = "reps"
                  }
                }
                return exercise
              })
            if (validExercises.length > 0) {
              this.exercises = validExercises
            }
          }
        }
      } catch (error) {
        console.error("加载配置失败:", error)
      }
    },

    // 保存配置
    saveConfig() {
      try {
        const config = {
          totalDuration: this.totalDuration,
          restTime: this.restTime,
          exercises: this.exercises,
        }
        localStorage.setItem("fitness-timer-config", JSON.stringify(config))
      } catch (error) {
        console.error("保存配置失败:", error)
      }
    },

    // 开始训练
    startTimer() {
      if (this.isRunning) return

      this.isRunning = true
      this.isPaused = false
      this.currentStatus = "training"
      this.calculateTotalTime()
      this.calculateRepTime()
      this.setStartTime = Date.now()

      // 初始语音播报：包含动作名称
      this.speak(`${this.currentExercise.name}开始`)

      // 延迟启动定时器，确保语音播报完成后才正式开始计时
      setTimeout(() => {
        // 开始主定时器
        this.timer = setInterval(() => {
          this.updateTimer()
        }, 1000)

        // 开始动作次数定时器
        this.startRepTimer()
      }, 1000) // 延迟1秒，确保语音播报完成后开始计时
    },

    // 暂停训练
    pauseTimer() {
      if (!this.isRunning || this.isPaused) return

      this.isPaused = true
      clearInterval(this.timer)
      clearInterval(this.repTimer)
      this.timer = null
      this.repTimer = null
    },

    // 继续训练
    resumeTimer() {
      if (!this.isPaused) return

      this.isPaused = false
      this.setStartTime = Date.now() - (this.totalTime - this.remainingTime) * 1000

      // 重新开始定时器
      this.timer = setInterval(() => {
        this.updateTimer()
      }, 1000)

      this.startRepTimer()

      // 语音提醒：简化为"继续"
      this.speak("继续")
    },

    // 重置训练
    resetTimer() {
      this.isRunning = false
      this.isPaused = false
      this.currentStatus = "idle"
      this.currentExerciseIndex = 0
      this.currentSet = 1
      this.currentRep = 1
      this.calculateTotalTime()

      // 清除定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.repTimer) {
        clearInterval(this.repTimer)
        this.repTimer = null
      }
    },

    // 更新定时器
    updateTimer() {
      this.remainingTime--

      // 检查训练是否结束
      if (this.remainingTime <= 0) {
        this.finishTraining()
        return
      }
    },

    // 计算每次动作的时间
    calculateRepTime() {
      const totalExercises = this.exercises.reduce((total, exercise) => total + exercise.sets * exercise.reps, 0)
      const totalRestTime = (this.totalSets - this.exercises.length) * this.restTime
      const totalTrainingTime = this.totalDuration * 60 - totalRestTime
      this.repTime = (totalTrainingTime * 1000) / totalExercises
    },

    // 开始动作次数定时器
    startRepTimer() {
      if (this.repTimer) {
        clearInterval(this.repTimer)
      }

      // 根据动作类型设置不同的播报间隔
      const interval = this.currentExercise.type === "time" ? 1000 : this.repTime
      this.repTimer = setInterval(() => {
        this.nextRep()
      }, interval)
    },

    // 下一次动作
    nextRep() {
      // 仅播报数字，不包含动作名称
      this.speak(`${this.currentRep}`)

      this.currentRep++

      // 检查当前组是否完成
      if (this.currentRep > this.currentExerciseReps) {
        this.nextSet()
      }
    },

    // 下一组
    nextSet() {
      this.currentRep = 1
      this.currentExerciseIndex++

      // 检查是否需要进入下一轮
      if (this.currentExerciseIndex >= this.exercises.length) {
        // 一轮结束，递增组数
        this.currentSet++
        // 回到第一个动作
        this.currentExerciseIndex = 0

        // 检查是否所有动作都完成了所有组数
        let allExercisesCompleted = true
        for (const exercise of this.exercises) {
          if (this.currentSet <= exercise.sets) {
            allExercisesCompleted = false
            break
          }
        }

        if (allExercisesCompleted) {
          // 所有动作都完成了所有组数，结束训练
          this.finishTraining()
          return
        }

        // 找到下一轮第一个需要做的动作
        while (this.currentExerciseIndex < this.exercises.length) {
          if (this.currentSet <= this.exercises[this.currentExerciseIndex].sets) {
            break
          }
          this.currentExerciseIndex++
        }

        // 检查是否还有需要做的动作
        if (this.currentExerciseIndex >= this.exercises.length) {
          this.finishTraining()
          return
        }
      } else {
        // 检查下一个动作是否需要做
        while (this.currentExerciseIndex < this.exercises.length) {
          if (this.currentSet <= this.exercises[this.currentExerciseIndex].sets) {
            break
          }
          this.currentExerciseIndex++
        }

        // 检查是否还有需要做的动作
        if (this.currentExerciseIndex >= this.exercises.length) {
          // 本轮结束，递增组数
          this.currentSet++
          this.currentExerciseIndex = 0

          // 找到下一轮第一个需要做的动作
          while (this.currentExerciseIndex < this.exercises.length) {
            if (this.currentSet <= this.exercises[this.currentExerciseIndex].sets) {
              break
            }
            this.currentExerciseIndex++
          }

          // 检查是否还有需要做的动作
          if (this.currentExerciseIndex >= this.exercises.length) {
            this.finishTraining()
            return
          }
        }
      }

      // 动作间休息
      this.startRest()
    },

    // 下一个动作
    nextExercise() {
      // 这个方法现在不再被直接调用，逻辑已合并到 nextSet 中
      this.finishTraining()
    },

    // 开始休息
    startRest() {
      this.currentStatus = "resting"
      clearInterval(this.repTimer)
      this.repTimer = null

      // 语音提醒
      this.speak(`休息时间 ${this.restTime} 秒`)

      // 休息定时器
      setTimeout(() => {
        this.currentStatus = "training"
        // 延迟启动动作次数定时器，确保语音播报完成后开始
        this.speak("1")
        this.currentRep = 2
        this.startRepTimer()
      }, this.restTime * 1000)
    },

    // 完成训练
    finishTraining() {
      this.isRunning = false
      this.currentStatus = "idle"
      this.remainingTime = 0

      // 清除定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.repTimer) {
        clearInterval(this.repTimer)
        this.repTimer = null
      }

      // 语音提醒
      this.speak("训练完成！")
    },

    // 语音播报
    speak(text) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "zh-CN"
        window.speechSynthesis.speak(utterance)
      }
    },
  },
  mounted() {
    this.loadConfig() // 加载保存的配置
    this.calculateTotalTime()
  },
  beforeUnmount() {
    this.saveConfig() // 保存配置
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.repTimer) {
      clearInterval(this.repTimer)
    }
  },
}
</script>

<style scoped>
/* 健身计时工具样式 */
.fitness-timer-tool {
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

/* 配置区域 */
.config-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* 显示和控制区域 */
.display-section {
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

/* 数字输入框 */
.number-input {
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
}

.number-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 动作列表 */
.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

/* 动作项 */
.exercise-item {
  display: flex;
  gap: 10px;
  align-items: center;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 10px;
}

.exercise-inputs {
  display: flex;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
}

.exercise-name-input {
  min-width: 120px;
  flex: 2;
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.exercise-sets-input {
  min-width: 60px;
  flex: 1;
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: center;
}

.exercise-reps-type {
  display: flex;
  gap: 5px;
  flex: 2;
}

.exercise-reps-input {
  min-width: 80px;
  flex: 2;
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: center;
}

.exercise-type-select {
  min-width: 60px;
  flex: 1;
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exercise-type-select:hover,
.exercise-type-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.exercise-name-input:focus,
.exercise-sets-input:focus,
.exercise-reps-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 移除动作按钮 */
.remove-exercise-btn {
  width: 30px;
  height: 30px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-exercise-btn:hover:not(:disabled) {
  background: var(--danger-color-hover);
  transform: scale(1.1);
}

.remove-exercise-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 添加动作按钮 */
.add-exercise-btn {
  padding: 10px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-exercise-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 预设按钮 */
.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.preset-btn {
  padding: 10px;
  background: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
}

/* 状态显示 */
.status-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.idle {
  background: var(--text-secondary);
}

.status-indicator.training {
  background: var(--success-color);
  animation: pulse 1s infinite;
}

.status-indicator.resting {
  background: var(--warning-color);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 倒计时显示 */
.countdown-display {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--secondary-bg);
  border-radius: var(--border-radius);
  padding: 30px;
  margin: 20px 0;
}

.countdown-time {
  font-size: 4rem;
  font-weight: 700;
  font-family: "Courier New", Courier, monospace;
  color: var(--accent-color);
}

/* 动作信息显示 */
.exercise-info {
  text-align: center;
  margin: 20px 0;
}

.current-exercise {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.exercise-progress {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* 控制面板 */
.control-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.control-btn {
  padding: 12px;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.start-btn {
  background: var(--success-color);
}

.start-btn:hover:not(:disabled) {
  background: var(--success-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.pause-btn {
  background: var(--warning-color);
}

.pause-btn:hover:not(:disabled) {
  background: var(--warning-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.resume-btn {
  background: var(--accent-color);
}

.resume-btn:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.reset-btn {
  background: var(--danger-color);
}

.reset-btn:hover:not(:disabled) {
  background: var(--danger-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 进度条 */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-bar {
  height: 10px;
  background: var(--secondary-bg);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .exercise-inputs {
    flex-direction: column;
  }

  .exercise-name-input,
  .exercise-sets-input,
  .exercise-reps-input {
    width: 100%;
  }

  .preset-buttons {
    grid-template-columns: 1fr;
  }

  .control-panel {
    grid-template-columns: 1fr 1fr;
  }

  .countdown-time {
    font-size: 3rem;
  }
}
</style>
