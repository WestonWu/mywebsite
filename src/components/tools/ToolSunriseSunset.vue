<template>
  <div class="tool-sunrise-sunset">
    <div class="tool-header">
      <h2>日出日落时间查询</h2>
      <p>查询全球各地的日出日落和日照时长</p>
    </div>

    <div class="tool-body">
      <!-- 城市选择 -->
      <div class="sunrise-controls">
        <div class="control-group">
          <label for="city-select">选择城市：</label>
          <CustomSelect
            v-model="selectedCity"
            :options="cities"
            placeholder="请选择城市"
            @update:modelValue="handleCityChange"
          />
          <button class="location-btn" @click="getCurrentLocation" title="获取当前位置">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ locationLoading ? "定位中..." : "当前位置" }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载日出日落数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchSunriseSunsetData">重试</button>
      </div>

      <!-- 日出日落数据展示 -->
      <div v-else-if="sunriseSunsetData" class="sunrise-display">
        <!-- 城市名称 -->
        <div class="sunrise-location">
          <h3>{{ cityName }}</h3>
          <p>今日日出日落时间</p>
        </div>

        <!-- 核心数据展示 -->
        <div class="sunrise-core">
          <div class="sunrise-item">
            <div class="sunrise-icon">🌅</div>
            <div class="sunrise-info">
              <div class="sunrise-label">日出时间</div>
              <div class="sunrise-value">{{ sunriseSunsetData.sunrise }}</div>
            </div>
          </div>
          <div class="sunrise-item">
            <div class="sunrise-icon">🌇</div>
            <div class="sunrise-info">
              <div class="sunrise-label">日落时间</div>
              <div class="sunrise-value">{{ sunriseSunsetData.sunset }}</div>
            </div>
          </div>
        </div>

        <!-- 日照时长 -->
        <div class="day-length">
          <div class="day-length-icon">☀️</div>
          <div class="day-length-info">
            <div class="day-length-label">日照时长</div>
            <div class="day-length-value">{{ sunriseSunsetData.dayLength }}</div>
          </div>
        </div>

        <!-- 日出日落示意图 -->
        <div class="sunrise-illustration">
          <div class="illustration-title">今日太阳轨迹示意图</div>
          <div class="illustration-container">
            <div class="sun-path">
              <div class="sun-path-line"></div>
              <div class="sun-path-sun"></div>
            </div>
            <div class="illustration-labels">
              <div class="label sunrise">日出</div>
              <div class="label noon">正午</div>
              <div class="label sunset">日落</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择城市提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">🌅</div>
        <p>请选择一个城市查看日出日落时间</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import CustomSelect from "../CustomSelect.vue"
import { useWeatherApi } from "../../composables/useWeatherApi"
import { useWeatherCache } from "../../composables/useWeatherCache"
import { useGeolocation } from "../../composables/useGeolocation"

export default {
  name: "ToolSunriseSunset",
  components: {
    CustomSelect,
  },
  setup() {
    // 初始化API和工具
    const { getCities, getSunriseSunset } = useWeatherApi()
    const { generateCacheKey, withCache } = useWeatherCache()
    const { getCurrentPosition } = useGeolocation()

    // 状态管理
    const cities = ref([])
    const selectedCity = ref("")
    const sunriseSunsetData = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const locationLoading = ref(false)
    const locationError = ref(null)
    const currentLocationCity = ref(null) // 当前位置的城市信息

    // 计算属性
    // 获取城市名称
    const cityName = computed(() => {
      if (currentLocationCity.value && selectedCity.value === currentLocationCity.value.value) {
        return currentLocationCity.value.label
      }

      const city = cities.value.find((c) => c.value === selectedCity.value)
      return city ? city.label : ""
    })

    // 加载城市列表
    const loadCities = async () => {
      try {
        const cityList = await getCities()
        cities.value = cityList
        // 默认选择第一个城市
        if (cityList.length > 0) {
          selectedCity.value = cityList[0].value
        }
      } catch (err) {
        console.error("加载城市列表失败:", err)
        error.value = "加载城市列表失败，请稍后重试"
      }
    }

    // 获取日出日落数据（支持城市名称或坐标）
    const fetchSunriseSunsetData = async (location = null) => {
      const targetLocation = location || selectedCity.value
      if (!targetLocation) return

      loading.value = true
      error.value = null

      try {
        // 使用缓存包装函数获取日出日落数据
        const cacheKey =
          typeof targetLocation === "string"
            ? generateCacheKey(targetLocation, "sunriseSunset")
            : generateCacheKey(`lat_${targetLocation.lat}_lon_${targetLocation.lon}`, "sunriseSunset")

        const result = await withCache(() => getSunriseSunset(targetLocation), cacheKey)

        if (result.success) {
          sunriseSunsetData.value = result.data
        } else {
          error.value = result.error || "获取日出日落数据失败"
        }
      } catch (err) {
        console.error("获取日出日落数据失败:", err)
        error.value = "获取日出日落数据失败，请稍后重试"
      } finally {
        loading.value = false
      }
    }

    // 获取当前位置
    const getCurrentLocation = async () => {
      locationLoading.value = true
      locationError.value = null

      try {
        // 获取当前位置坐标
        const positionResult = await getCurrentPosition()

        if (!positionResult.success) {
          locationError.value = positionResult.error
          return
        }

        const { latitude, longitude } = positionResult.data

        // 使用坐标查询天气数据
        await fetchSunriseSunsetData({ lat: latitude, lon: longitude })

        // 保存当前位置信息
        currentLocationCity.value = {
          value: `lat_${latitude}_lon_${longitude}`,
          label: "当前位置",
          lat: latitude,
          lon: longitude,
        }

        // 将当前位置添加到城市列表顶部
        const locationCityExists = cities.value.some((city) => city.value === currentLocationCity.value.value)
        if (!locationCityExists) {
          cities.value.unshift(currentLocationCity.value)
        }

        // 选择当前位置
        selectedCity.value = currentLocationCity.value.value
      } catch (err) {
        console.error("获取当前位置失败:", err)
        locationError.value = "获取当前位置失败，请检查浏览器位置权限"
      } finally {
        locationLoading.value = false
      }
    }

    // 城市变更处理
    const handleCityChange = () => {
      // 如果选择的是当前位置，使用坐标查询
      if (currentLocationCity.value && selectedCity.value === currentLocationCity.value.value) {
        fetchSunriseSunsetData(currentLocationCity.value)
      } else {
        fetchSunriseSunsetData(selectedCity.value)
      }
    }

    // 组件挂载时加载城市列表，并尝试获取当前位置
    onMounted(async () => {
      await loadCities()
      // 自动获取当前位置
      await getCurrentLocation()
    })

    return {
      cities,
      selectedCity,
      sunriseSunsetData,
      loading,
      error,
      locationLoading,
      locationError,
      cityName,
      fetchSunriseSunsetData,
      handleCityChange,
      getCurrentLocation,
    }
  },
}
</script>

<style scoped>
.tool-sunrise-sunset {
  width: 100%;
  max-width: 600px;
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

/* 控制区域 */
.sunrise-controls {
  margin-bottom: 30px;
}

.control-group {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

/* 位置按钮 */
.location-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  padding: 8px 12px;
  background: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.location-btn:hover {
  background: var(--hover-bg);
  border-color: #4a6cf7;
  transform: translateY(-2px);
}

.location-btn:active {
  transform: translateY(0);
}

.location-btn svg {
  width: 16px;
  height: 16px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
  text-align: center;
  background: rgba(255, 87, 87, 0.05);
  border: 1px solid rgba(255, 87, 87, 0.2);
  border-radius: 8px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.error-state p {
  color: var(--text-danger);
  font-size: 1.1rem;
  margin: 0;
}

.retry-btn {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.retry-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
}

/* 日出日落数据展示 */
.sunrise-display {
  background: var(--secondary-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

/* 城市位置 */
.sunrise-location {
  text-align: center;
  margin-bottom: 30px;
}

.sunrise-location h3 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.sunrise-location p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* 核心数据展示 */
.sunrise-core {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

/* 日出日落单项 */
.sunrise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.sunrise-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--accent-color);
}

.sunrise-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.sunrise-info {
  text-align: center;
}

.sunrise-label {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 500;
}

.sunrise-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

/* 日照时长 */
.day-length {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.day-length:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--accent-color);
}

.day-length-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.day-length-info {
  text-align: center;
}

.day-length-label {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 500;
}

.day-length-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
}

/* 日出日落示意图 */
.sunrise-illustration {
  text-align: center;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.illustration-title {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-weight: 500;
}

.illustration-container {
  position: relative;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 太阳轨迹 */
.sun-path {
  position: relative;
  width: 100%;
  height: 100%;
}

.sun-path-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  border-top: 3px dashed var(--accent-color);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  opacity: 0.7;
}

.sun-path-sun {
  position: absolute;
  bottom: 60%;
  left: 50%;
  transform: translate(-50%, 50%);
  font-size: 2.5rem;
  animation: sun-move 3s ease-in-out infinite alternate;
}

@keyframes sun-move {
  0% {
    transform: translate(-50%, 50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -150%) rotate(180deg);
  }
}

/* 示意图标签 */
.illustration-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
}

.label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.label.sunrise {
  color: #f59e0b;
}

.label.noon {
  color: #3b82f6;
}

.label.sunset {
  color: #ef4444;
}

/* 未选择城市提示 */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.no-selection-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-selection p {
  font-size: 1.2rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sunrise-core {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .sunrise-item,
  .day-length {
    padding: 20px 15px;
  }

  .sunrise-icon,
  .day-length-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }

  .sunrise-value {
    font-size: 2rem;
  }

  .day-length-value {
    font-size: 1.8rem;
  }
}
</style>
