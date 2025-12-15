// 地理位置获取逻辑封装

export function useGeolocation() {
  /**
   * 获取用户当前地理位置
   * @param {Object} options 地理位置选项
   * @param {number} options.enableHighAccuracy 是否启用高精度定位
   * @param {number} options.timeout 超时时间（毫秒）
   * @param {number} options.maximumAge 位置信息的最大缓存时间（毫秒）
   * @returns {Promise<Object>} 地理位置数据或错误信息
   */
  const getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      // 检查浏览器是否支持地理位置API
      if (!navigator.geolocation) {
        reject({
          success: false,
          error: "您的浏览器不支持地理位置服务"
        })
        return
      }

      // 默认选项
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      // 合并选项
      const geolocationOptions = { ...defaultOptions, ...options }

      // 获取地理位置
      navigator.geolocation.getCurrentPosition(
        // 成功回调
        (position) => {
          resolve({
            success: true,
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp
            }
          })
        },
        // 错误回调
        (error) => {
          let errorMessage = "获取地理位置失败"
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "您拒绝了地理位置访问请求"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "地理位置信息不可用"
              break
            case error.TIMEOUT:
              errorMessage = "获取地理位置超时"
              break
            case error.UNKNOWN_ERROR:
              errorMessage = "发生未知错误"
              break
          }
          
          reject({
            success: false,
            error: errorMessage,
            code: error.code
          })
        },
        // 选项
        geolocationOptions
      )
    })
  }

  /**
   * 监听地理位置变化
   * @param {Function} callback 位置变化时的回调函数
   * @param {Object} options 地理位置选项
   * @returns {Function} 取消监听的函数
   */
  const watchPosition = (callback, options = {}) => {
    // 默认选项
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    // 合并选项
    const geolocationOptions = { ...defaultOptions, ...options }

    // 检查浏览器是否支持地理位置API
    if (!navigator.geolocation) {
      callback({
        success: false,
        error: "您的浏览器不支持地理位置服务"
      })
      return () => {}
    }

    // 监听位置变化
    const watchId = navigator.geolocation.watchPosition(
      // 成功回调
      (position) => {
        callback({
          success: true,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          }
        })
      },
      // 错误回调
      (error) => {
        let errorMessage = "获取地理位置失败"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "您拒绝了地理位置访问请求"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "地理位置信息不可用"
            break
          case error.TIMEOUT:
            errorMessage = "获取地理位置超时"
            break
          case error.UNKNOWN_ERROR:
            errorMessage = "发生未知错误"
            break
        }
        
        callback({
          success: false,
          error: errorMessage,
          code: error.code
        })
      },
      // 选项
      geolocationOptions
    )

    // 返回取消监听的函数
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  /**
   * 检查地理位置权限状态
   * @returns {Promise<string>} 权限状态
   */
  const checkPermission = async () => {
    // 检查浏览器是否支持地理位置API
    if (!navigator.geolocation) {
      return "unsupported"
    }

    // 检查是否支持权限API
    if (!navigator.permissions) {
      return "unknown"
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: "geolocation" })
      return permissionStatus.state
    } catch (error) {
      console.error("检查地理位置权限失败:", error)
      return "unknown"
    }
  }

  /**
   * 格式化坐标为可读字符串
   * @param {number} latitude 纬度
   * @param {number} longitude 经度
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的坐标字符串
   */
  const formatCoordinates = (latitude, longitude, decimals = 6) => {
    const latDirection = latitude >= 0 ? "N" : "S"
    const lonDirection = longitude >= 0 ? "E" : "W"
    
    return `${Math.abs(latitude).toFixed(decimals)}°${latDirection}, ${Math.abs(longitude).toFixed(decimals)}°${lonDirection}`
  }

  return {
    getCurrentPosition,
    watchPosition,
    checkPermission,
    formatCoordinates
  }
}
