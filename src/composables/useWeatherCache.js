// 天气数据缓存机制封装

export function useWeatherCache() {
  // 缓存存储键名前缀
  const CACHE_KEY_PREFIX = 'weather_cache_' 
  
  // 默认缓存过期时间（毫秒）
  const DEFAULT_CACHE_DURATION = 30 * 60 * 1000 // 30分钟
  
  /**
   * 设置缓存数据
   * @param {string} key 缓存键名
   * @param {any} data 要缓存的数据
   * @param {number} duration 缓存持续时间（毫秒），默认30分钟
   */
  const setCache = (key, data, duration = DEFAULT_CACHE_DURATION) => {
    try {
      // 创建缓存对象，包含数据和过期时间
      const cacheItem = {
        data,
        expiryTime: Date.now() + duration
      }
      
      // 存储到localStorage
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem))
    } catch (error) {
      console.error('设置天气缓存失败:', error)
    }
  }
  
  /**
   * 获取缓存数据
   * @param {string} key 缓存键名
   * @returns {any|null} 缓存的数据，如果缓存不存在或已过期则返回null
   */
  const getCache = (key) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`
      const cacheItemStr = localStorage.getItem(cacheKey)
      
      if (!cacheItemStr) {
        return null
      }
      
      const cacheItem = JSON.parse(cacheItemStr)
      
      // 检查缓存是否过期
      if (Date.now() > cacheItem.expiryTime) {
        // 缓存已过期，删除缓存
        removeCache(key)
        return null
      }
      
      return cacheItem.data
    } catch (error) {
      console.error('获取天气缓存失败:', error)
      return null
    }
  }
  
  /**
   * 删除指定缓存
   * @param {string} key 缓存键名
   */
  const removeCache = (key) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`
      localStorage.removeItem(cacheKey)
    } catch (error) {
      console.error('删除天气缓存失败:', error)
    }
  }
  
  /**
   * 清除所有天气相关缓存
   */
  const clearAllCache = () => {
    try {
      // 获取所有缓存键
      const allKeys = Object.keys(localStorage)
      
      // 筛选出天气缓存键并删除
      allKeys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清除所有天气缓存失败:', error)
    }
  }
  
  /**
   * 生成缓存键名
   * @param {string} city 城市名称
   * @param {string} dataType 数据类型（current, forecast, airQuality, uvIndex, sunriseSunset）
   * @returns {string} 生成的缓存键名
   */
  const generateCacheKey = (city, dataType) => {
    return `${city}_${dataType}`
  }
  
  /**
   * 获取缓存状态
   * @param {string} key 缓存键名
   * @returns {Object|null} 缓存状态信息，包含是否存在、是否过期等
   */
  const getCacheStatus = (key) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`
      const cacheItemStr = localStorage.getItem(cacheKey)
      
      if (!cacheItemStr) {
        return {
          exists: false,
          isExpired: false,
          remainingTime: 0
        }
      }
      
      const cacheItem = JSON.parse(cacheItemStr)
      const now = Date.now()
      const isExpired = now > cacheItem.expiryTime
      const remainingTime = isExpired ? 0 : cacheItem.expiryTime - now
      
      return {
        exists: true,
        isExpired,
        remainingTime
      }
    } catch (error) {
      console.error('获取缓存状态失败:', error)
      return null
    }
  }
  
  /**
   * 缓存包装函数，用于自动处理缓存逻辑
   * @param {Function} fetchFunction 获取数据的函数
   * @param {string} cacheKey 缓存键名
   * @param {number} cacheDuration 缓存持续时间（毫秒）
   * @returns {Promise<any>} 数据结果
   */
  const withCache = async (fetchFunction, cacheKey, cacheDuration = DEFAULT_CACHE_DURATION) => {
    // 尝试从缓存获取数据
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return cachedData
    }
    
    // 缓存不存在，调用获取数据的函数
    const data = await fetchFunction()
    
    // 将数据存入缓存
    if (data && data.success) {
      setCache(cacheKey, data, cacheDuration)
    }
    
    return data
  }
  
  return {
    setCache,
    getCache,
    removeCache,
    clearAllCache,
    generateCacheKey,
    getCacheStatus,
    withCache
  }
}
