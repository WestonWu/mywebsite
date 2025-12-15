<template>
  <div class="tool-weather-current">
    <div class="tool-header">
      <h2>实时天气查询</h2>
      <p>查询全球城市的实时天气数据</p>
    </div>

    <div class="tool-body">
      <!-- 城市选择和单位切换 -->
      <div class="weather-controls">
        <div class="control-group">
          <label for="city-select">选择城市：</label>
          <CustomSelect
            v-model="selectedCity"
            :options="cities"
            placeholder="请选择城市"
            @update:modelValue="handleCityChange"
          />
        </div>

        <div class="control-group">
          <label for="temperature-unit">温度单位：</label>
          <CustomSelect
            v-model="temperatureUnit"
            :options="temperatureUnits"
            placeholder="选择温度单位"
          />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载天气数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchWeatherData">重试</button>
      </div>

      <!-- 天气数据展示 -->
      <div v-else-if="weatherData" class="weather-display">
        <!-- 主要天气信息 -->
        <div class="weather-main">
          <div class="weather-location">
            <h3>{{ cityName }}</h3>
          </div>
          <div class="weather-conditions">
            <div class="weather-icon">{{ weatherData.icon }}</div>
            <div class="weather-info">
              <div class="temperature">
                {{ formattedTemperature }}
              </div>
              <div class="weather-description">
                {{ weatherData.weather }} - {{ weatherData.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- 详细天气数据 -->
        <div class="weather-details">
          <div class="weather-detail-item">
            <div class="detail-label">体感温度</div>
            <div class="detail-value">{{ formattedFeelsLike }}</div>
          </div>
          <div class="weather-detail-item">
            <div class="detail-label">湿度</div>
            <div class="detail-value">{{ weatherData.humidity }}%</div>
          </div>
          <div class="weather-detail-item">
            <div class="detail-label">风速</div>
            <div class="detail-value">{{ weatherData.windSpeed }} m/s</div>
          </div>
          <div class="weather-detail-item">
            <div class="detail-label">气压</div>
            <div class="detail-value">{{ weatherData.pressure }} hPa</div>
          </div>
          <div class="weather-detail-item">
            <div class="detail-label">能见度</div>
            <div class="detail-value">{{ weatherData.visibility / 1000 }} km</div>
          </div>
        </div>
      </div>

      <!-- 未选择城市提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">🌤️</div>
        <p>请选择一个城市查看实时天气</p>
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

export default {
  name: "ToolWeatherCurrent",
  components: {
    CustomSelect
  },
  setup() {
    // 初始化API和工具
    const { getCities, getCurrentWeather } = useWeatherApi()
    const { convertTemperature, formatTemperature, getTemperatureUnits } = useTemperatureConversion()
    const { generateCacheKey, withCache } = useWeatherCache()

    // 状态管理
    const cities = ref([])
    const selectedCity = ref("")
    const temperatureUnit = ref("celsius")
    const weatherData = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // 计算属性
    const temperatureUnits = getTemperatureUnits()

    // 格式化温度
    const formattedTemperature = computed(() => {
      if (!weatherData.value) return "--"
      return formatTemperature(
        convertTemperature(weatherData.value.temperature, "celsius", temperatureUnit.value),
        temperatureUnit.value
      )
    })

    // 格式化体感温度
    const formattedFeelsLike = computed(() => {
      if (!weatherData.value) return "--"
      return formatTemperature(
        convertTemperature(weatherData.value.feelsLike, "celsius", temperatureUnit.value),
        temperatureUnit.value
      )
    })

    // 获取城市名称
    const cityName = computed(() => {
      const city = cities.value.find(c => c.value === selectedCity.value)
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

    // 获取天气数据
    const fetchWeatherData = async () => {
      if (!selectedCity.value) return

      loading.value = true
      error.value = null

      try {
        // 使用缓存包装函数获取天气数据
        const cacheKey = generateCacheKey(selectedCity.value, "current")
        const result = await withCache(
          () => getCurrentWeather(selectedCity.value),
          cacheKey
        )

        if (result.success) {
          weatherData.value = result.data
        } else {
          error.value = result.error || "获取天气数据失败"
        }
      } catch (err) {
        console.error("获取天气数据失败:", err)
        error.value = "获取天气数据失败，请稍后重试"
      } finally {
        loading.value = false
      }
    }

    // 城市变更处理
    const handleCityChange = () => {
      fetchWeatherData()
    }

    // 组件挂载时加载城市列表
    onMounted(() => {
      loadCities()
    })

    return {
      cities,
      selectedCity,
      temperatureUnit,
      temperatureUnits,
      weatherData,
      loading,
      error,
      formattedTemperature,
      formattedFeelsLike,
      cityName,
      fetchWeatherData,
      handleCityChange
    }
  }
}
</script>

<style scoped>
.tool-weather-current {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 天气数据展示 */
.weather-display {
  background: var(--secondary-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

/* 主要天气信息 */
.weather-main {
  text-align: center;
  margin-bottom: 30px;
}

.weather-location h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.weather-conditions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.weather-icon {
  font-size: 5rem;
}

.weather-info {
  text-align: left;
}

.temperature {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 10px;
}

.weather-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

/* 详细天气数据 */
.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.weather-detail-item {
  text-align: center;
  padding: 15px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.weather-detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
  border-color: var(--accent-color);
}

.detail-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.detail-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
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

  .weather-conditions {
    flex-direction: column;
    gap: 15px;
  }

  .weather-info {
    text-align: center;
  }

  .temperature {
    font-size: 3rem;
  }

  .weather-details {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
  }

  .detail-value {
    font-size: 1.3rem;
  }
}
</style>
