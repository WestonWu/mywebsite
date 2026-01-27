<template>
  <div class="fitness-timer-tool">
    <div class="tool-header">
      <p>健身计时工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：配置区域 -->
      <div class="config-section">
        <!-- 总时长显示 -->
        <div class="option-group">
          <label>预计总训练时长</label>
          <div class="total-time-display">
            {{ formattedTotalTime }}
          </div>
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
              <div class="exercise-header">
                <div class="exercise-name-container">
                  <label class="exercise-label">动作名称</label>
                  <input
                    type="text"
                    v-model="exercise.name"
                    placeholder="输入动作名称"
                    class="exercise-name-input"
                    @input="updateConfig"
                  />
                </div>
                <button class="remove-exercise-btn" @click="removeExercise(index)" :disabled="exercises.length <= 1">
                  ✕
                </button>
              </div>

              <div class="exercise-details">
                <div class="exercise-field">
                  <label class="exercise-label">组数</label>
                  <input
                    type="number"
                    v-model.number="exercise.sets"
                    min="1"
                    max="10"
                    class="exercise-sets-input"
                    @input="updateConfig"
                  />
                </div>

                <div class="exercise-field exercise-reps-type">
                  <label class="exercise-label">{{ exercise.type === "reps" ? "次数" : "秒数" }}</label>
                  <div class="exercise-reps-row">
                    <input
                      type="number"
                      v-model.number="exercise.reps"
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

                <div class="exercise-field">
                  <label class="exercise-label">每次用时（秒）</label>
                  <input
                    type="number"
                    v-model.number="exercise.durationPerRep"
                    min="0.1"
                    max="10"
                    step="0.1"
                    class="exercise-duration-input"
                    @input="updateConfig"
                  />
                </div>
              </div>
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
        { name: "俯卧撑", sets: 4, reps: 10, durationPerRep: 1, type: "reps" },
        { name: "深蹲", sets: 4, reps: 20, durationPerRep: 1, type: "reps" },
        { name: "高抬腿", sets: 4, reps: 40, durationPerRep: 1, type: "reps" },
        { name: "平板支撑", sets: 3, reps: 30, durationPerRep: 1, type: "time" }, // 平板支撑改为计时模式
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
      restTimer: null, // 休息定时器
      remainingRestTime: 0, // 剩余休息时间（秒）

      // 预设动作模板
      presets: {
        basic: [
          { name: "斜板俯卧撑", sets: 4, reps: 12, durationPerRep: 1, type: "reps" },
          { name: "深蹲", sets: 4, reps: 20, durationPerRep: 1, type: "reps" },
          { name: "高抬腿", sets: 4, reps: 40, durationPerRep: 1, type: "reps" },
          { name: "平板支撑", sets: 3, reps: 30, durationPerRep: 1, type: "time" },
        ],
        "full-body": [
          { name: "俯卧撑", sets: 4, reps: 10, durationPerRep: 1, type: "reps" },
          { name: "深蹲", sets: 4, reps: 20, durationPerRep: 1, type: "reps" },
          { name: "箭步蹲", sets: 4, reps: 15, durationPerRep: 1, type: "reps" },
          { name: "平板支撑", sets: 3, reps: 30, durationPerRep: 1, type: "time" },
          { name: "仰卧起坐", sets: 4, reps: 25, durationPerRep: 1, type: "reps" },
        ],
        core: [
          { name: "平板支撑", sets: 4, reps: 40, durationPerRep: 1, type: "time" },
          { name: "仰卧起坐", sets: 4, reps: 30, durationPerRep: 1, type: "reps" },
          { name: "侧平板支撑", sets: 4, reps: 25, durationPerRep: 1, type: "time" },
          { name: "俄罗斯转体", sets: 4, reps: 30, durationPerRep: 1, type: "reps" },
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
        return `休息时间：${this.remainingRestTime}秒`
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

    // 格式化总时长
    formattedTotalTime() {
      const minutes = Math.floor(this.totalTime / 60)
      const seconds = Math.round(this.totalTime % 60)
      return `${minutes}分${seconds}秒`
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
      // 计算每个动作的总训练时间
      let trainingTime = 0
      let restCount = 0

      // 计算训练时间
      for (const exercise of this.exercises) {
        trainingTime += exercise.sets * exercise.reps * exercise.durationPerRep
        restCount += exercise.sets
      }

      // 计算休息时间（每组之间休息）
      const totalRestTime = (restCount - 1) * this.restTime

      // 总时长 = 训练时间 + 休息时间
      // 不再单独计算语音播报时间，因为语音播报时间已经包含在训练和休息时间内
      // 训练时间：每个动作的次数 × 每次用时
      // 休息时间：休息次数 × 休息时长
      // 语音播报会在训练和休息时间内进行，不会额外增加总时长
      this.totalTime = trainingTime + totalRestTime
      this.remainingTime = this.totalTime
    },

    // 添加动作
    addExercise() {
      this.exercises.push({ name: "新动作", sets: 3, reps: 10, durationPerRep: 1, type: "reps" })
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
                // 为没有durationPerRep属性的动作添加默认值
                if (exercise.durationPerRep === undefined || exercise.durationPerRep === null) {
                  exercise.durationPerRep = 1
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

      // 记录训练开始时间，用于精确计算剩余时间
      this.setStartTime = Date.now()

      // 初始语音播报：包含动作名称
      this.speak(`${this.currentExercise.name}开始`)

      // 开始主定时器（立即开始，不延迟）
      this.timer = setInterval(() => {
        this.updateTimer()
      }, 1000)

      // 立即启动动作次数定时器，确保与主定时器同步
      this.startRepTimer()
    },

    // 暂停训练
    pauseTimer() {
      if (!this.isRunning || this.isPaused) return

      this.isPaused = true
      clearInterval(this.timer)
      clearInterval(this.repTimer)
      clearInterval(this.restTimer)
      this.timer = null
      this.repTimer = null
      this.restTimer = null
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
      this.remainingRestTime = 0
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
      if (this.restTimer) {
        clearInterval(this.restTimer)
        this.restTimer = null
      }
    },

    // 更新定时器
    updateTimer() {
      // 精确计算剩余时间，不受语音播报影响
      const elapsed = Math.floor((Date.now() - this.setStartTime) / 1000)
      this.remainingTime = Math.max(0, this.totalTime - elapsed)

      // 总时长仅作参考，不再自动结束训练
      // 训练结束由所有动作完成后自动触发
    },

    // 计算每次动作的时间
    calculateRepTime() {
      // 根据当前动作的durationPerRep字段计算每次动作的时间
      this.repTime = this.currentExercise.durationPerRep * 1000
    },

    // 开始动作次数定时器
    startRepTimer() {
      if (this.repTimer) {
        clearInterval(this.repTimer)
      }

      // 检查当前动作是否为时间型
      if (this.currentExercise.type === "time") {
        // 时间型动作：倒计时逻辑
        this.currentRep = this.currentExerciseReps // 初始化当前时间为设定的总秒数

        // 立即播报开始
        this.speak(`开始计时 ${this.currentRep} 秒`)

        // 记录开始时间，用于精确计算
        const startTime = Date.now()

        // 倒计时定时器
        this.repTimer = setInterval(() => {
          // 精确计算剩余时间
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          this.currentRep = Math.max(0, this.currentExerciseReps - elapsed)

          // 只播报关键时间点
          if (this.currentRep > 0 && (this.currentRep <= 5 || this.currentRep % 10 === 0)) {
            this.speak(`${this.currentRep}`)
          }

          // 检查是否结束
          if (this.currentRep <= 0) {
            clearInterval(this.repTimer)
            this.repTimer = null
            this.nextSet()
          }
        }, 1000)
      } else {
        // 次数型动作：保持原有逻辑
        const interval = this.currentExercise.durationPerRep * 1000
        this.currentRep = 1

        // 立即执行第一次动作
        this.speak(`${this.currentRep}`)
        this.currentRep++

        // 使用setTimeout递归调用
        const executeNextRep = () => {
          this.repTimer = setTimeout(() => {
            this.speak(`${this.currentRep}`)
            this.currentRep++

            if (this.currentRep > this.currentExerciseReps) {
              this.repTimer = null
              this.nextSet()
            } else {
              executeNextRep()
            }
          }, interval)
        }

        executeNextRep()
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

    // 开始休息
    startRest() {
      this.currentStatus = "resting"
      clearInterval(this.repTimer)
      this.repTimer = null

      // 初始化剩余休息时间
      this.remainingRestTime = this.restTime

      // 语音提醒：休息开始
      this.speak(`休息时间 ${this.restTime} 秒`)

      // 记录休息开始时间，用于精确计算剩余时间
      const restStartTime = Date.now()

      // 休息倒计时定时器
      this.restTimer = setInterval(() => {
        // 精确计算剩余休息时间，不受语音播报影响
        const elapsed = Math.floor((Date.now() - restStartTime) / 1000)
        this.remainingRestTime = Math.max(0, this.restTime - elapsed)

        // 只播报关键时间点，避免语音播报占用过多时间
        if (this.remainingRestTime > 0 && (this.remainingRestTime <= 5 || this.remainingRestTime % 10 === 0)) {
          this.speak(`${this.remainingRestTime}`)
        }

        // 检查休息是否结束
        if (this.remainingRestTime <= 0) {
          clearInterval(this.restTimer)
          this.restTimer = null

          // 休息结束，开始下一个动作
          this.currentStatus = "training"
          // 延迟启动动作次数定时器，确保语音播报完成后开始
          this.speak("准备开始", () => {
            // 语音播报完成后，开始下一个动作的计时
            this.currentRep = 1
            this.startRepTimer()
          })
        }
      }, 1000)
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
      if (this.restTimer) {
        clearInterval(this.restTimer)
        this.restTimer = null
      }

      // 语音提醒
      this.speak("训练完成！")
    },

    // 语音播报
    speak(text, onEndCallback = null) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "zh-CN"

        // 设置语速，确保每个数字播报时间一致
        utterance.rate = 1.5

        if (onEndCallback) {
          utterance.onend = onEndCallback
        }

        window.speechSynthesis.speak(utterance)
      } else if (onEndCallback) {
        // 如果不支持语音合成，立即调用回调
        onEndCallback()
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
  display: flex;
  position: relative;
  justify-content: center;
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
  flex: 1;
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
  flex: 1;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 0;
  align-self: flex-start;
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

/* 总时长显示样式 */
.total-time-display {
  padding: 10px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--accent-color);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

/* 每次用时输入框样式 */
.exercise-duration-input {
  width: 100%;
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  text-align: center;
}

.exercise-duration-input:focus {
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
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 15px;
  margin-bottom: 15px;
}

/* 动作头部 */
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 10px;
}

.exercise-name-container {
  flex: 1;
}

/* 动作详情 */
.exercise-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* 动作字段 */
.exercise-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* 动作标签 */
.exercise-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 3px;
}

/* 动作名称输入框 */
.exercise-name-input {
  width: 100%;
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
}

/* 组数输入框 */
.exercise-sets-input {
  width: 100%;
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  text-align: center;
}

/* 次数/秒数区域 */
.exercise-reps-type {
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.exercise-reps-row {
  display: flex;
  gap: 10px;
}

/* 次数/秒数输入框 */
.exercise-reps-input {
  flex: 1;
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  text-align: center;
}

/* 类型选择器 */
.exercise-type-select {
  flex: 0 0 80px;
  padding: 10px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
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

  .exercise-details {
    grid-template-columns: 1fr;
  }

  .exercise-name-input,
  .exercise-sets-input,
  .exercise-reps-input,
  .exercise-duration-input {
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
