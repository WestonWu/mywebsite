<template>
  <div class="tool-uv-index">
    <div class="tool-header">
      <h2>紫外线指数查询</h2>
      <p>查询实时紫外线强度和防晒建议</p>
    </div>

    <div class="tool-body">
      <!-- 城市选择 -->
      <div class="uv-controls">
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
        <p>加载紫外线数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchUVData">重试</button>
      </div>

      <!-- 紫外线数据展示 -->
      <div v-else-if="uvData" class="uv-display">
        <!-- 城市名称 -->
        <div class="uv-location">
          <h3>{{ cityName }}</h3>
          <p>实时紫外线指数</p>
        </div>

        <!-- 核心数据展示 -->
        <div class="uv-core">
          <div class="uv-value-container">
            <div class="uv-value" :class="getUVClass(uvData.uvIndex)">{{ uvData.uvIndex }}</div>
            <div class="uv-level" :class="getUVClass(uvData.uvIndex)">{{ uvData.level }}</div>
          </div>
        </div>

        <!-- 紫外线描述和建议 -->
        <div class="uv-info">
          <div class="uv-description">
            <div class="description-label">紫外线描述：</div>
            <div class="description-text">{{ uvData.advice }}</div>
          </div>

          <!-- 防晒建议 -->
          <div class="uv-protection">
            <div class="protection-icon">🛡️</div>
            <div class="protection-content">
              <div class="protection-title">防晒建议</div>
              <div class="protection-list">
                <div v-for="(tip, index) in getProtectionTips(uvData.uvIndex)" :key="index" class="protection-item">
                  <span class="tip-icon">✅</span>
                  <span class="tip-text">{{ tip }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 紫外线强度示意图 -->
        <div class="uv-illustration">
          <div class="illustration-title">紫外线强度示意图</div>
          <div class="illustration-container">
            <div class="uv-scale">
              <div class="scale-item low">
                <div class="scale-range">0-2</div>
                <div class="scale-label">低</div>
              </div>
              <div class="scale-item moderate">
                <div class="scale-range">3-5</div>
                <div class="scale-label">中等</div>
              </div>
              <div class="scale-item high">
                <div class="scale-range">6-7</div>
                <div class="scale-label">高</div>
              </div>
              <div class="scale-item very-high">
                <div class="scale-range">8-10</div>
                <div class="scale-label">很高</div>
              </div>
              <div class="scale-item extreme">
                <div class="scale-range">11+</div>
                <div class="scale-label">极高</div>
              </div>
            </div>
            <!-- 当前值指示器 -->
            <div class="current-indicator" :style="{ left: getUVPosition(uvData.uvIndex) }">
              <div class="indicator-arrow"></div>
              <div class="indicator-value">{{ uvData.uvIndex }}</div>
            </div>
          </div>
        </div>

        <!-- 紫外线指数说明 -->
        <div class="uv-explanation">
          <h4>紫外线指数说明</h4>
          <div class="explanation-text">
            紫外线指数是衡量到达地球表面的太阳紫外线辐射对人类皮肤可能造成损害的指标。
            指数越高，对皮肤造成损害的风险越大。建议根据指数等级采取相应的防护措施，保护皮肤健康。
          </div>
        </div>
      </div>

      <!-- 未选择城市提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">☀️</div>
        <p>请选择一个城市查看紫外线指数</p>
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
  name: "ToolUVIndex",
  components: {
    CustomSelect,
  },
  setup() {
    // 初始化API和工具
    const { getCities, getUVIndex, reverseGeocode } = useWeatherApi()
    const { generateCacheKey, withCache } = useWeatherCache()
    const { getCurrentPosition } = useGeolocation()

    // 状态管理
    const cities = ref([])
    const selectedCity = ref("")
    const uvData = ref(null)
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

    // 获取紫外线数据（支持城市名称或坐标）
    const fetchUVData = async (location = null) => {
      const targetLocation = location || selectedCity.value
      if (!targetLocation) return

      loading.value = true
      error.value = null

      try {
        // 使用缓存包装函数获取紫外线数据
        const cacheKey =
          typeof targetLocation === "string"
            ? generateCacheKey(targetLocation, "uvIndex")
            : generateCacheKey(`lat_${targetLocation.lat}_lon_${targetLocation.lon}`, "uvIndex")

        const result = await withCache(() => getUVIndex(targetLocation), cacheKey)

        if (result.success) {
          uvData.value = result.data
        } else {
          error.value = result.error || "获取紫外线数据失败"
        }
      } catch (err) {
        console.error("获取紫外线数据失败:", err)
        error.value = "获取紫外线数据失败，请稍后重试"
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

        // 通过逆地理编码获取具体位置名称
        const locationInfo = await reverseGeocode(latitude, longitude)
        console.log("逆地理编码结果:", locationInfo)

        // 使用坐标查询天气数据
        await fetchUVData({ lat: latitude, lon: longitude })

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

    // 城市变更处理
    const handleCityChange = () => {
      // 如果选择的是当前位置，使用坐标查询
      if (currentLocationCity.value && selectedCity.value === currentLocationCity.value.value) {
        fetchUVData(currentLocationCity.value)
      } else {
        fetchUVData(selectedCity.value)
      }
    }

    // 获取紫外线样式类
    const getUVClass = (uvIndex) => {
      if (uvIndex <= 2) return "uv-low"
      if (uvIndex <= 5) return "uv-moderate"
      if (uvIndex <= 7) return "uv-high"
      if (uvIndex <= 10) return "uv-very-high"
      return "uv-extreme"
    }

    // 获取防晒建议
    const getProtectionTips = (uvIndex) => {
      if (uvIndex <= 2) {
        return ["无需特别防护，可正常户外活动"]
      } else if (uvIndex <= 5) {
        return ["建议涂抹SPF15以上防晒霜", "戴帽子和太阳镜", "避免长时间在阳光下暴露"]
      } else if (uvIndex <= 7) {
        return ["建议涂抹SPF30以上防晒霜", "尽量避免10-16点户外活动", "穿长袖衣物和长裤", "戴宽檐帽和防紫外线太阳镜"]
      } else if (uvIndex <= 10) {
        return [
          "必须涂抹SPF50以上防晒霜，每2小时补涂一次",
          "尽量待在室内，避免户外活动",
          "外出时穿防晒服、戴宽檐帽和太阳镜",
          "使用遮阳伞或寻找阴凉处",
        ]
      } else {
        return [
          "极度危险，应避免一切户外活动",
          "必须待在室内，关闭窗户",
          "如必须外出，做好全面防护",
          "涂抹SPF50+防晒霜，每1小时补涂一次",
        ]
      }
    }

    // 获取紫外线在示意图上的位置
    const getUVPosition = (uvIndex) => {
      // 计算紫外线指数在0-11+范围内的相对位置
      const normalizedUV = Math.min(uvIndex, 11) // 最大值为11
      const position = (normalizedUV / 11) * 100
      return `${position}%`
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
      uvData,
      loading,
      error,
      locationLoading,
      locationError,
      cityName,
      fetchUVData,
      handleCityChange,
      getCurrentLocation,
      getUVClass,
      getProtectionTips,
      getUVPosition,
    }
  },
}
</script>

<style scoped>
.tool-uv-index {
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
.uv-controls {
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

/* 紫外线数据展示 */
.uv-display {
  background: var(--secondary-bg);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

/* 城市位置 */
.uv-location {
  text-align: center;
  margin-bottom: 30px;
}

.uv-location h3 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.uv-location p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* 核心数据展示 */
.uv-core {
  margin-bottom: 30px;
}

/* UV值容器 */
.uv-value-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* UV值 */
.uv-value {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 10px;
}

/* UV等级 */
.uv-level {
  font-size: 1.5rem;
  font-weight: 600;
}

/* UV样式类 */
.uv-low {
  color: #00e400;
}

.uv-moderate {
  color: #ffff00;
}

.uv-high {
  color: #ff7e00;
}

.uv-very-high {
  color: #ff0000;
}

.uv-extreme {
  color: #99004c;
}

/* 紫外线描述和建议 */
.uv-info {
  margin-bottom: 30px;
}

/* UV描述 */
.uv-description {
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

/* 防晒建议 */
.uv-protection {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 30px;
}

.protection-icon {
  font-size: 2rem;
  margin-top: 5px;
}

.protection-content {
  flex: 1;
}

.protection-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.protection-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.protection-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tip-icon {
  color: #00e400;
}

/* 紫外线强度示意图 */
.uv-illustration {
  background: var(--card-bg);
  padding: 30px 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 30px;
  position: relative;
}

.illustration-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 30px;
}

/* 示意图容器 */
.illustration-container {
  position: relative;
  height: 150px;
}

/* UV强度刻度 */
.uv-scale {
  display: flex;
  height: 60px;
  background: linear-gradient(
    to right,
    #00e400 0%,
    #00e400 18.18%,
    #ffff00 18.18%,
    #ffff00 45.45%,
    #ff7e00 45.45%,
    #ff7e00 63.64%,
    #ff0000 63.64%,
    #ff0000 90.91%,
    #99004c 90.91%,
    #99004c 100%
  );
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}

/* 刻度项 */
.scale-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.scale-range {
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.scale-label {
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 当前值指示器 */
.current-indicator {
  position: absolute;
  top: -20px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

/* 指示器箭头 */
.indicator-arrow {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 20px solid var(--accent-color);
}

/* 指示器值 */
.indicator-value {
  background: var(--accent-color);
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

/* 紫外线指数说明 */
.uv-explanation {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.uv-explanation h4 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.explanation-text {
  color: var(--text-secondary);
  line-height: 1.5;
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
  .uv-value {
    font-size: 4rem;
  }

  .uv-level {
    font-size: 1.3rem;
  }

  .uv-protection {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .protection-icon {
    margin-bottom: 15px;
  }

  .illustration-container {
    height: 180px;
  }
}
</style>
