<template>
  <div class="tool-weather-forecast">
    <div class="tool-header">
      <h2>天气预报</h2>
      <p>查看未来7天天气预报和天气趋势</p>
    </div>

    <div class="tool-body">
      <!-- 城市选择和单位切换 -->
      <div class="weather-controls">
        <div class="control-group">
          <label for="city-select">选择城市：</label>
          <CustomSelect
            v-model="selectedCity"
            :options="cities"
            placeholder="请选择或搜索城市"
            @update:modelValue="handleCityChange"
            @search="searchCity"
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

        <div class="control-group">
          <label for="temperature-unit">温度单位：</label>
          <CustomSelect v-model="temperatureUnit" :options="temperatureUnits" placeholder="选择温度单位" />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载天气预报数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchForecastData">重试</button>
      </div>

      <!-- 天气预报展示 -->
      <div v-else-if="forecastData && forecastData.length > 0" class="forecast-display">
        <!-- 城市名称 -->
        <div class="forecast-location">
          <h3>{{ cityName }}</h3>
          <p>未来7天天气预报</p>
        </div>

        <!-- 天气预报列表 -->
        <div class="forecast-list">
          <div v-for="(day, index) in forecastData" :key="index" class="forecast-day">
            <div class="day-info">
              <div class="day-name">{{ formatDayName(day.date) }}</div>
              <div class="day-date">{{ formatDate(day.date) }}</div>
            </div>
            <div class="day-weather">
              <div class="weather-icon">{{ getWeatherIcon(day.weather) }}</div>
              <div class="weather-desc">{{ day.weather }}</div>
            </div>
            <div class="day-temp">
              <div class="temp-range">
                <span class="temp-max">{{ formattedTemp(day.temperatureMax) }}</span>
                <span class="temp-divider">/</span>
                <span class="temp-min">{{ formattedTemp(day.temperatureMin) }}</span>
              </div>
            </div>
            <div class="day-precipitation">
              <div class="precipitation-icon">💧</div>
              <div class="precipitation-value">{{ day.precipitation }}%</div>
            </div>
          </div>
        </div>

        <!-- 天气趋势图表提示 -->
        <div class="chart-placeholder">
          <div class="chart-icon">📊</div>
          <p>天气趋势图表功能开发中...</p>
        </div>
      </div>

      <!-- 未选择城市提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">📅</div>
        <p>请选择一个城市查看天气预报</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import CustomSelect from "../CustomSelect.vue"
import { useWeatherApi } from "../../composables/useWeatherApi"
import { useTemperatureConversion } from "../../composables/useTemperatureConversion"
import { useWeatherCache } from "../../composables/useWeatherCache"
import { useGeolocation } from "../../composables/useGeolocation"

export default {
  name: "ToolWeatherForecast",
  components: {
    CustomSelect,
  },
  setup() {
    // 初始化API和工具
    const { getCities, getWeatherForecast, reverseGeocode, searchCities } = useWeatherApi()
    const { convertTemperature, formatTemperature, getTemperatureUnits } = useTemperatureConversion()
    const { generateCacheKey, withCache } = useWeatherCache()
    const { getCurrentPosition } = useGeolocation()

    // 状态管理
    const cities = ref([])
    const selectedCity = ref("")
    const temperatureUnit = ref("celsius")
    const forecastData = ref([])
    const loading = ref(false)
    const error = ref(null)
    const locationLoading = ref(false)
    const locationError = ref(null)
    const currentLocationCity = ref(null) // 当前位置的城市信息

    // 计算属性
    const temperatureUnits = getTemperatureUnits()

    // 获取城市名称
    const cityName = computed(() => {
      if (currentLocationCity.value) {
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

    // 获取天气预报数据（支持城市名称或坐标）
    const fetchForecastData = async (location = null) => {
      const targetLocation = location || selectedCity.value
      if (!targetLocation) return

      loading.value = true
      error.value = null

      try {
        // 使用缓存包装函数获取天气预报数据
        const cacheKey =
          typeof targetLocation === "string"
            ? generateCacheKey(targetLocation, "forecast")
            : generateCacheKey(`lat_${targetLocation.lat}_lon_${targetLocation.lon}`, "forecast")

        const result = await withCache(() => getWeatherForecast(targetLocation), cacheKey)

        if (result.success) {
          forecastData.value = result.data
        } else {
          error.value = result.error || "获取天气预报数据失败"
        }
      } catch (err) {
        console.error("获取天气预报数据失败:", err)
        error.value = "获取天气预报数据失败，请稍后重试"
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
        await fetchForecastData({ lat: latitude, lon: longitude })

        // 通过逆地理编码获取具体位置名称
        const locationInfo = await reverseGeocode(latitude, longitude)

        // 保存当前位置信息
        currentLocationCity.value = {
          value: locationInfo ? locationInfo.value : `lat_${latitude}_lon_${longitude}`,
          label: locationInfo ? locationInfo.label : "当前位置",
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

    // 城市搜索功能
    const searchCity = async (query) => {
      console.log("搜索城市:", query)

      if (!query.trim()) {
        // 如果搜索框为空，重新加载默认城市列表
        await loadCities()
        console.log("搜索框为空，加载默认城市列表:", cities.value)
        return
      }

      // 使用 searchCities API 动态搜索城市
      const searchResults = await searchCities(query)
      console.log("搜索结果:", searchResults)

      // 更新城市列表，即使搜索结果为空
      cities.value = searchResults
    }

    // 城市变更处理
    const handleCityChange = () => {
      // 如果选择的是当前位置，使用坐标查询
      if (currentLocationCity.value && selectedCity.value === currentLocationCity.value.value) {
        fetchForecastData(currentLocationCity.value)
      } else {
        fetchForecastData(selectedCity.value)
      }
    }

    // 格式化温度
    const formattedTemp = (temp) => {
      return formatTemperature(convertTemperature(temp, "celsius", temperatureUnit.value), temperatureUnit.value, 0)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
    }

    // 格式化星期名称
    const formatDayName = (dateString) => {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // 检查是否是今天或明天
      if (date.toDateString() === today.toDateString()) {
        return "今天"
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "明天"
      } else {
        return date.toLocaleDateString("zh-CN", { weekday: "short" })
      }
    }

    // 根据天气状况获取对应的图标
    const getWeatherIcon = (weather) => {
      const iconMap = {
        晴天: "☀️",
        多云: "⛅",
        阴天: "☁️",
        小雨: "🌧️",
        中雨: "🌦️",
        大雨: "⛈️",
        雪: "❄️",
        雾: "🌫️",
        雷阵雨: "⛈️",
      }
      return iconMap[weather] || "🌤️"
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
      temperatureUnit,
      temperatureUnits,
      forecastData,
      loading,
      error,
      locationLoading,
      locationError,
      cityName,
      fetchForecastData,
      handleCityChange,
      getCurrentLocation,
      searchCity,
      formattedTemp,
      formatDate,
      formatDayName,
      getWeatherIcon,
    }
  },
}
</script>

<style scoped>
.tool-weather-forecast {
  width: 100%;
  max-width: 800px;
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
.weather-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 位置按钮 */
.location-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
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

/* 天气预报展示 */
.forecast-display {
  background: var(--secondary-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

/* 城市位置 */
.forecast-location {
  text-align: center;
  margin-bottom: 30px;
}

.forecast-location h3 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.forecast-location p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* 天气预报列表 */
.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

/* 每日天气预报 */
.forecast-day {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 100px;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.forecast-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--accent-color);
}

/* 日期信息 */
.day-info {
  text-align: left;
}

.day-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.day-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 天气信息 */
.day-weather {
  display: flex;
  align-items: center;
  gap: 15px;
}

.weather-icon {
  font-size: 2.5rem;
}

.weather-desc {
  font-size: 1rem;
  color: var(--text-primary);
}

/* 温度范围 */
.day-temp {
  text-align: right;
}

.temp-range {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.temp-max {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-primary);
}

.temp-divider {
  color: var(--text-secondary);
}

.temp-min {
  font-size: 1.3rem;
  color: var(--text-secondary);
}

/* 降水量 */
.day-precipitation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(58, 134, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
}

.precipitation-icon {
  font-size: 1.2rem;
}

.precipitation-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-color);
}

/* 图表占位符 */
.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.chart-placeholder p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
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
  .weather-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    width: 100%;
  }

  .forecast-day {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 15px;
    text-align: center;
  }

  .day-info {
    text-align: center;
  }

  .day-weather {
    justify-content: center;
    order: 3;
    grid-column: 1 / -1;
  }

  .day-temp {
    text-align: center;
  }

  .temp-range {
    justify-content: center;
  }

  .day-precipitation {
    order: 4;
    grid-column: 1 / -1;
  }
}
</style>
