// 天气API请求逻辑封装

export function useWeatherApi() {
  // Open-Meteo API配置（无需API密钥）
  const WEATHER_API_BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL || "https://api.open-meteo.com/v1/forecast"
  const AIR_QUALITY_API_BASE_URL =
    import.meta.env.VITE_AIR_QUALITY_API_BASE_URL || "https://air-quality-api.open-meteo.com/v1/air-quality"
  const GEO_API_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"

  // 固定城市列表（可扩展为动态搜索）
  const defaultCities = [
    { value: "beijing", label: "北京", lat: 39.9042, lon: 116.4074 },
    { value: "shanghai", label: "上海", lat: 31.2304, lon: 121.4737 },
    { value: "guangzhou", label: "广州", lat: 23.1291, lon: 113.2644 },
    { value: "shenzhen", label: "深圳", lat: 22.5431, lon: 114.0579 },
    { value: "hangzhou", label: "杭州", lat: 30.2741, lon: 120.1551 },
    { value: "chengdu", label: "成都", lat: 30.5728, lon: 104.0668 },
    { value: "wuhan", label: "武汉", lat: 30.5928, lon: 114.3055 },
    { value: "xian", label: "西安", lat: 34.3416, lon: 108.9398 },
    { value: "nanjing", label: "南京", lat: 32.0603, lon: 118.7969 },
    { value: "tianjin", label: "天津", lat: 39.3434, lon: 117.3616 },
  ]

  // 城市搜索API
  const searchCities = async (query, limit = 10) => {
    if (!query.trim()) {
      return defaultCities
    }

    try {
      const url = `${GEO_API_BASE_URL}?name=${encodeURIComponent(query)}&count=${limit}&language=zh&format=json`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // 转换数据格式为 { value, label, lat, lon } 格式
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((city) => ({
          value: city.name.toLowerCase().replace(/\s+/g, "-"),
          label: `${city.name}${city.admin1 ? `, ${city.admin1}` : ""}${city.country ? `, ${city.country}` : ""}`,
          lat: city.latitude,
          lon: city.longitude,
        }))
      }

      return []
    } catch (error) {
      console.error("城市搜索失败:", error)
      return defaultCities
    }
  }

  /**
   * 根据WMO天气代码获取天气图标
   * @param {number} weatherCode WMO天气代码
   * @returns {string} 天气图标
   */
  const getWeatherIcon = (weatherCode) => {
    if (weatherCode === 0) return "☀️" // 晴天
    if (weatherCode >= 1 && weatherCode <= 3) return "⛅" // 多云
    if (weatherCode >= 45 && weatherCode <= 48) return "🌫️" // 雾
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99)) return "🌧️" // 雨
    if (weatherCode >= 71 && weatherCode <= 77) return "❄️" // 雪
    if (weatherCode >= 95 && weatherCode <= 99) return "⛈️" // 雷暴
    return "🌤️" // 默认
  }

  /**
   * 根据WMO天气代码获取天气描述
   * @param {number} weatherCode WMO天气代码
   * @returns {string} 天气描述
   */
  const getWeatherDescription = (weatherCode) => {
    if (weatherCode === 0) return "晴天"
    if (weatherCode >= 1 && weatherCode <= 3) return "多云"
    if (weatherCode >= 45 && weatherCode <= 48) return "雾"
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return "雨"
    if (weatherCode >= 71 && weatherCode <= 77) return "雪"
    if (weatherCode >= 95 && weatherCode <= 99) return "雷暴"
    return "未知"
  }

  /**
   * 将ISO时间字符串转换为HH:MM格式
   * @param {string} isoString ISO时间字符串
   * @returns {string} 格式化时间 HH:MM
   */
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
  }

  /**
   * 计算日照时长
   * @param {string} sunrise 日出ISO时间
   * @param {string} sunset 日落ISO时间
   * @returns {string} 日照时长
   */
  const calculateDayLength = (sunrise, sunset) => {
    const sunriseDate = new Date(sunrise)
    const sunsetDate = new Date(sunset)
    const diff = (sunsetDate - sunriseDate) / 1000 // 转换为秒
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  /**
   * 获取城市列表
   * @returns {Promise<Array>} 城市列表
   */
  const getCities = async () => {
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 300))
    return defaultCities
  }

  /**
   * 根据城市名称获取坐标
   * @param {string} city 城市名称
   * @returns {Object|null} 城市坐标 {lat, lon}
   */
  const getCityCoordinates = (city) => {
    const cityData = defaultCities.find((c) => c.value === city)
    return cityData ? { lat: cityData.lat, lon: cityData.lon } : null
  }

  /**
   * 获取坐标信息（支持城市名称或直接坐标）
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object|null>} 坐标数据 {lat, lon}
   */
  const getCoordinates = async (location) => {
    if (typeof location === "object" && location.lat && location.lon) {
      // 如果直接传入坐标对象，直接返回
      return location
    } else if (typeof location === "string") {
      // 如果传入城市名称，从默认城市列表中查找
      const cityCoords = getCityCoordinates(location)
      if (cityCoords) {
        return cityCoords
      }

      // 如果默认城市列表中没有，尝试通过城市搜索API获取
      try {
        const searchResults = await searchCities(location, 1)
        if (searchResults.length > 0) {
          return { lat: searchResults[0].lat, lon: searchResults[0].lon }
        }
      } catch (error) {
        console.error("获取城市坐标失败:", error)
      }
    }

    return null
  }

  /**
   * 通用API请求函数
   * @param {string} url API请求URL
   * @returns {Promise<Object>} API响应数据
   */
  const fetchApi = async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("API请求失败:", error.message, "URL:", url)
      throw error
    }
  }

  /**
   * 获取实时天气
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object>} 实时天气数据
   */
  const getCurrentWeather = async (location) => {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      const coords = await getCoordinates(location)
      if (!coords) {
        return {
          success: false,
          error: "未找到该城市的坐标数据",
        }
      }

      // 调用Open-Meteo实时天气API
      const url = `${WEATHER_API_BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,visibility,wind_speed_10m&timezone=Asia/Shanghai`
      const data = await fetchApi(url)

      // 转换数据格式
      const currentWeather = {
        temperature: Math.round(data.current_weather.temperature),
        feelsLike: Math.round(data.hourly.apparent_temperature[0]),
        humidity: data.hourly.relative_humidity_2m[0],
        windSpeed: data.current_weather.windspeed,
        weather: getWeatherDescription(data.current_weather.weathercode),
        description: data.current_weather.weathercode,
        icon: getWeatherIcon(data.current_weather.weathercode),
        pressure: data.hourly.pressure_msl[0],
        visibility: data.hourly.visibility[0],
      }

      return {
        success: true,
        data: currentWeather,
      }
    } catch (error) {
      console.error("获取实时天气失败:", error)
      return {
        success: false,
        error: "获取天气数据失败，请稍后重试",
      }
    }
  }

  /**
   * 获取天气预报
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object>} 天气预报数据
   */
  const getWeatherForecast = async (location) => {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      const coords = await getCoordinates(location)
      if (!coords) {
        return {
          success: false,
          error: "未找到该城市的坐标数据",
        }
      }

      // 调用Open-Meteo天气预报API
      const url = `${WEATHER_API_BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Shanghai&forecast_days=7`
      const data = await fetchApi(url)

      // 转换数据格式
      const forecast = data.daily.time.map((date, index) => ({
        date,
        temperatureMin: Math.round(data.daily.temperature_2m_min[index]),
        temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
        weather: getWeatherDescription(data.daily.weathercode[index]),
        precipitation: data.daily.precipitation_probability_max[index] || 0,
      }))

      return {
        success: true,
        data: forecast,
      }
    } catch (error) {
      console.error("获取天气预报失败:", error)
      return {
        success: false,
        error: "获取预报数据失败，请稍后重试",
      }
    }
  }

  /**
   * 获取空气质量
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object>} 空气质量数据
   */
  const getAirQuality = async (location) => {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      const coords = await getCoordinates(location)
      if (!coords) {
        return {
          success: false,
          error: "未找到该城市的坐标数据",
        }
      }

      // 调用Open-Meteo空气质量API
      // 注意：API参数名需要使用完整名称，不能使用缩写
      const url = `${AIR_QUALITY_API_BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide`
      const data = await fetchApi(url)

      // 转换数据格式
      // 保持返回的字段名不变，以便前端组件正常使用
      const airQuality = {
        aqi: Math.round(data.hourly.pm2_5[0] / 50) + 1, // 简单计算AQI
        pm25: data.hourly.pm2_5[0],
        pm10: data.hourly.pm10[0],
        o3: data.hourly.ozone[0],
        no2: data.hourly.nitrogen_dioxide[0],
        so2: data.hourly.sulphur_dioxide[0],
        co: data.hourly.carbon_monoxide[0],
      }

      return {
        success: true,
        data: airQuality,
      }
    } catch (error) {
      console.error("获取空气质量失败:", error)
      return {
        success: false,
        error: "获取空气质量数据失败，请稍后重试",
      }
    }
  }

  /**
   * 获取紫外线指数
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object>} 紫外线指数数据
   */
  const getUVIndex = async (location) => {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      const coords = await getCoordinates(location)
      if (!coords) {
        return {
          success: false,
          error: "未找到该城市的坐标数据",
        }
      }

      // 调用Open-Meteo紫外线指数API
      const url = `${WEATHER_API_BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=uv_index_max&timezone=Asia/Shanghai`
      const data = await fetchApi(url)

      // 转换数据格式
      const uvIndex = Math.round(data.daily.uv_index_max[0])

      return {
        success: true,
        data: {
          uvIndex,
          level: getUVLevel(uvIndex),
          advice: getUVAdvice(uvIndex),
        },
      }
    } catch (error) {
      console.error("获取紫外线指数失败:", error)
      return {
        success: false,
        error: "获取紫外线数据失败，请稍后重试",
      }
    }
  }

  /**
   * 获取日出日落时间
   * @param {string|Object} location 城市名称或坐标对象 {lat, lon}
   * @returns {Promise<Object>} 日出日落时间数据
   */
  const getSunriseSunset = async (location) => {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300))

      const coords = await getCoordinates(location)
      if (!coords) {
        return {
          success: false,
          error: "未找到该城市的坐标数据",
        }
      }

      // 调用Open-Meteo日出日落API
      const url = `${WEATHER_API_BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=sunrise,sunset&timezone=Asia/Shanghai`
      const data = await fetchApi(url)

      // 转换数据格式
      const sunriseSunset = {
        sunrise: formatTime(data.daily.sunrise[0]),
        sunset: formatTime(data.daily.sunset[0]),
        dayLength: calculateDayLength(data.daily.sunrise[0], data.daily.sunset[0]),
      }

      return {
        success: true,
        data: sunriseSunset,
      }
    } catch (error) {
      console.error("获取日出日落时间失败:", error)
      return {
        success: false,
        error: "获取日出日落数据失败，请稍后重试",
      }
    }
  }

  /**
   * 获取紫外线等级
   * @param {number} uvIndex 紫外线指数
   * @returns {string} 紫外线等级
   */
  const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return "低"
    if (uvIndex <= 5) return "中等"
    if (uvIndex <= 7) return "高"
    if (uvIndex <= 10) return "很高"
    return "极高"
  }

  /**
   * 获取紫外线防护建议
   * @param {number} uvIndex 紫外线指数
   * @returns {string} 防护建议
   */
  const getUVAdvice = (uvIndex) => {
    if (uvIndex <= 2) return "无需特别防护，可正常户外活动"
    if (uvIndex <= 5) return "建议涂抹SPF15以上防晒霜，戴帽子和太阳镜"
    if (uvIndex <= 7) return "建议涂抹SPF30以上防晒霜，尽量避免10-16点户外活动"
    if (uvIndex <= 10) return "必须涂抹SPF50以上防晒霜，尽量待在室内，外出时做好全面防护"
    return "极度危险，应避免一切户外活动"
  }

  return {
    getCities,
    searchCities,
    getCoordinates,
    getCurrentWeather,
    getWeatherForecast,
    getAirQuality,
    getUVIndex,
    getSunriseSunset,
  }
}
