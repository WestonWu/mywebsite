<template>
  <div class="tool-air-quality">
    <div class="tool-header">
      <h2>空气质量查询</h2>
      <p>查看城市空气质量指数和污染物浓度</p>
    </div>

    <div class="tool-body">
      <!-- 城市选择 -->
      <div class="air-controls">
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
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载空气质量数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchAirQualityData">重试</button>
      </div>

      <!-- 空气质量数据展示 -->
      <div v-else-if="airQualityData" class="air-display">
        <!-- 城市名称 -->
        <div class="air-location">
          <h3>{{ cityName }}</h3>
          <p>实时空气质量指数</p>
        </div>

        <!-- AQI核心数据 -->
        <div class="air-aqi-core">
          <div class="aqi-value-container">
            <div class="aqi-value" :class="getAQIClass(airQualityData.aqi)">{{ airQualityData.aqi }}</div>
            <div class="aqi-level" :class="getAQIClass(airQualityData.aqi)">{{ getAQILevel(airQualityData.aqi) }}</div>
          </div>
          <div class="aqi-description">
            <div class="description-label">空气质量描述：</div>
            <div class="description-text">{{ getAQIDescription(airQualityData.aqi) }}</div>
          </div>
        </div>

        <!-- 健康建议 -->
        <div class="health-advice">
          <div class="advice-icon">💡</div>
          <div class="advice-content">
            <div class="advice-title">健康建议</div>
            <div class="advice-text">{{ getHealthAdvice(airQualityData.aqi) }}</div>
          </div>
        </div>

        <!-- 污染物详情 -->
        <div class="pollutants">
          <h4>污染物详情</h4>
          <div class="pollutant-grid">
            <div class="pollutant-item">
              <div class="pollutant-label">PM2.5</div>
              <div class="pollutant-value">{{ airQualityData.pm25 }} μg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.pm25, 'pm25')">
                {{ getPollutantLevel(airQualityData.pm25, "pm25") }}
              </div>
            </div>
            <div class="pollutant-item">
              <div class="pollutant-label">PM10</div>
              <div class="pollutant-value">{{ airQualityData.pm10 }} μg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.pm10, 'pm10')">
                {{ getPollutantLevel(airQualityData.pm10, "pm10") }}
              </div>
            </div>
            <div class="pollutant-item">
              <div class="pollutant-label">O₃</div>
              <div class="pollutant-value">{{ airQualityData.o3 }} μg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.o3, 'o3')">
                {{ getPollutantLevel(airQualityData.o3, "o3") }}
              </div>
            </div>
            <div class="pollutant-item">
              <div class="pollutant-label">NO₂</div>
              <div class="pollutant-value">{{ airQualityData.no2 }} μg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.no2, 'no2')">
                {{ getPollutantLevel(airQualityData.no2, "no2") }}
              </div>
            </div>
            <div class="pollutant-item">
              <div class="pollutant-label">SO₂</div>
              <div class="pollutant-value">{{ airQualityData.so2 }} μg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.so2, 'so2')">
                {{ getPollutantLevel(airQualityData.so2, "so2") }}
              </div>
            </div>
            <div class="pollutant-item">
              <div class="pollutant-label">CO</div>
              <div class="pollutant-value">{{ airQualityData.co }} mg/m³</div>
              <div class="pollutant-status" :class="getPollutantStatus(airQualityData.co, 'co')">
                {{ getPollutantLevel(airQualityData.co, "co") }}
              </div>
            </div>
          </div>
        </div>

        <!-- 主要污染物 -->
        <div class="primary-pollutant" v-if="getPrimaryPollutant(airQualityData)">
          <div class="primary-label">主要污染物：</div>
          <div class="primary-value">{{ getPrimaryPollutant(airQualityData) }}</div>
        </div>
      </div>

      <!-- 未选择城市提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">💨</div>
        <p>请选择一个城市查看空气质量</p>
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
  name: "ToolAirQuality",
  components: {
    CustomSelect,
  },
  setup() {
    // 初始化API和工具
    const { getCities, getAirQuality, reverseGeocode, searchCities } = useWeatherApi()
    const { generateCacheKey, withCache } = useWeatherCache()
    const { getCurrentPosition } = useGeolocation()

    // 状态管理
    const cities = ref([])
    const selectedCity = ref("")
    const airQualityData = ref(null)
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

    // 获取空气质量数据（支持城市名称或坐标）
    const fetchAirQualityData = async (location = null) => {
      const targetLocation = location || selectedCity.value
      if (!targetLocation) return

      loading.value = true
      error.value = null

      try {
        // 使用缓存包装函数获取空气质量数据
        const cacheKey =
          typeof targetLocation === "string"
            ? generateCacheKey(targetLocation, "airQuality")
            : generateCacheKey(`lat_${targetLocation.lat}_lon_${targetLocation.lon}`, "airQuality")

        const result = await withCache(() => getAirQuality(targetLocation), cacheKey)

        if (result.success) {
          airQualityData.value = result.data
        } else {
          error.value = result.error || "获取空气质量数据失败"
        }
      } catch (err) {
        console.error("获取空气质量数据失败:", err)
        error.value = "获取空气质量数据失败，请稍后重试"
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
        await fetchAirQualityData({ lat: latitude, lon: longitude })

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
        fetchAirQualityData(currentLocationCity.value)
      } else {
        fetchAirQualityData(selectedCity.value)
      }
    }

    // 获取AQI等级
    const getAQILevel = (aqi) => {
      if (aqi <= 50) return "优"
      if (aqi <= 100) return "良"
      if (aqi <= 150) return "轻度污染"
      if (aqi <= 200) return "中度污染"
      if (aqi <= 300) return "重度污染"
      return "严重污染"
    }

    // 获取AQI描述
    const getAQIDescription = (aqi) => {
      if (aqi <= 50) return "空气质量令人满意，基本无空气污染"
      if (aqi <= 100) return "空气质量可接受，但某些污染物可能对极少数异常敏感人群健康有较弱影响"
      if (aqi <= 150) return "易感人群症状有轻度加剧，健康人群出现刺激症状"
      if (aqi <= 200) return "进一步加剧易感人群症状，可能对健康人群心脏、呼吸系统有影响"
      if (aqi <= 300) return "心脏病和肺病患者症状显著加剧，运动耐受力降低，健康人群普遍出现症状"
      return "健康人群运动耐受力降低，有明显强烈症状，提前出现某些疾病"
    }

    // 获取健康建议
    const getHealthAdvice = (aqi) => {
      if (aqi <= 50) return "各类人群可正常活动"
      if (aqi <= 100) return "极少数异常敏感人群应减少户外活动"
      if (aqi <= 150) return "儿童、老年人及心脏病、呼吸系统疾病患者应减少长时间、高强度的户外锻炼"
      if (aqi <= 200)
        return "儿童、老年人及心脏病、呼吸系统疾病患者避免长时间、高强度的户外锻炼，一般人群适量减少户外运动"
      if (aqi <= 300) return "儿童、老年人和病人应当留在室内，避免体力消耗，一般人群应避免户外活动"
      return "儿童、老年人和病人应当留在室内，避免体力消耗，一般人群应避免户外活动"
    }

    // 获取AQI样式类
    const getAQIClass = (aqi) => {
      if (aqi <= 50) return "aqi-excellent"
      if (aqi <= 100) return "aqi-good"
      if (aqi <= 150) return "aqi-moderate"
      if (aqi <= 200) return "aqi-unhealthy"
      if (aqi <= 300) return "aqi-very-unhealthy"
      return "aqi-hazardous"
    }

    // 获取污染物等级
    const getPollutantLevel = (value, type) => {
      // 简化的污染物等级判断，实际应根据国家标准
      const thresholds = {
        pm25: [35, 75, 115, 150, 250],
        pm10: [50, 150, 250, 350, 420],
        o3: [160, 200, 300, 400, 800],
        no2: [40, 80, 180, 280, 565],
        so2: [50, 150, 475, 800, 1600],
        co: [2, 4, 14, 24, 36],
      }

      const levels = ["优", "良", "轻度污染", "中度污染", "重度污染", "严重污染"]
      const threshold = thresholds[type] || []

      for (let i = 0; i < threshold.length; i++) {
        if (value <= threshold[i]) {
          return levels[i]
        }
      }
      return levels[threshold.length]
    }

    // 获取污染物状态样式
    const getPollutantStatus = (value, type) => {
      const level = getPollutantLevel(value, type)
      const statusMap = {
        优: "status-good",
        良: "status-moderate",
        轻度污染: "status-unhealthy",
        中度污染: "status-very-unhealthy",
        重度污染: "status-hazardous",
        严重污染: "status-hazardous",
      }
      return statusMap[level] || "status-moderate"
    }

    // 获取主要污染物
    const getPrimaryPollutant = (data) => {
      if (!data) return null

      // 简化的主要污染物判断，实际应根据国家标准
      const pollutants = [
        { name: "PM2.5", value: data.pm25, threshold: 75 },
        { name: "PM10", value: data.pm10, threshold: 150 },
        { name: "O₃", value: data.o3, threshold: 200 },
        { name: "NO₂", value: data.no2, threshold: 80 },
        { name: "SO₂", value: data.so2, threshold: 150 },
        { name: "CO", value: data.co, threshold: 4 },
      ]

      // 找出超标且数值最高的污染物
      const exceedingPollutants = pollutants.filter((p) => p.value > p.threshold)
      if (exceedingPollutants.length === 0) return "无"

      return exceedingPollutants.reduce((max, current) => {
        return current.value > max.value ? current : max
      }).name
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
      airQualityData,
      loading,
      error,
      locationLoading,
      locationError,
      cityName,
      fetchAirQualityData,
      handleCityChange,
      getCurrentLocation,
      searchCity,
      getAQILevel,
      getAQIDescription,
      getHealthAdvice,
      getAQIClass,
      getPollutantLevel,
      getPollutantStatus,
      getPrimaryPollutant,
    }
  },
}
</script>

<style scoped>
.tool-air-quality {
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
.air-controls {
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

/* 空气质量数据展示 */
.air-display {
  background: var(--secondary-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

/* 城市位置 */
.air-location {
  text-align: center;
  margin-bottom: 30px;
}

.air-location h3 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.air-location p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* AQI核心数据 */
.air-aqi-core {
  margin-bottom: 30px;
}

/* AQI值容器 */
.aqi-value-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* AQI值 */
.aqi-value {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 10px;
}

/* AQI等级 */
.aqi-level {
  font-size: 1.5rem;
  font-weight: 600;
}

/* AQI样式类 */
.aqi-excellent {
  color: #00e400;
}

.aqi-good {
  color: #ffff00;
}

.aqi-moderate {
  color: #ff7e00;
}

.aqi-unhealthy {
  color: #ff0000;
}

.aqi-very-unhealthy {
  color: #99004c;
}

.aqi-hazardous {
  color: #7e0023;
}

/* AQI描述 */
.aqi-description {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.description-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.description-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 健康建议 */
.health-advice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.advice-icon {
  font-size: 2rem;
  margin-top: 5px;
}

.advice-content {
  flex: 1;
}

.advice-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.advice-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 污染物详情 */
.pollutants {
  margin-bottom: 30px;
}

.pollutants h4 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 20px;
}

/* 污染物网格 */
.pollutant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

/* 污染物项 */
.pollutant-item {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.pollutant-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--accent-color);
}

.pollutant-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.pollutant-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.pollutant-status {
  font-size: 1rem;
  font-weight: 500;
}

/* 污染物状态样式 */
.status-good {
  color: #00e400;
}

.status-moderate {
  color: #ff7e00;
}

.status-unhealthy {
  color: #ff0000;
}

.status-very-unhealthy {
  color: #99004c;
}

.status-hazardous {
  color: #7e0023;
}

/* 主要污染物 */
.primary-pollutant {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.primary-label {
  font-weight: 600;
  color: var(--text-primary);
}

.primary-value {
  font-size: 1.2rem;
  color: var(--accent-color);
  font-weight: bold;
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
  .aqi-value {
    font-size: 4rem;
  }

  .aqi-level {
    font-size: 1.3rem;
  }

  .pollutant-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .pollutant-item {
    padding: 15px;
  }

  .pollutant-value {
    font-size: 1.8rem;
  }

  .health-advice {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .advice-icon {
    margin-bottom: 15px;
  }
}
</style>
