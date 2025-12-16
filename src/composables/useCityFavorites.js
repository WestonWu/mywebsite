// 城市收藏功能封装

export function useCityFavorites() {
  // 收藏存储键名
  const FAVORITES_STORAGE_KEY = 'weather_city_favorites'
  
  /**
   * 获取所有收藏的城市
   * @returns {Array} 收藏的城市列表
   */
  const getFavoriteCities = () => {
    try {
      const favoritesStr = localStorage.getItem(FAVORITES_STORAGE_KEY)
      return favoritesStr ? JSON.parse(favoritesStr) : []
    } catch (error) {
      console.error('获取城市收藏失败:', error)
      return []
    }
  }
  
  /**
   * 添加城市到收藏
   * @param {Object} city 城市对象，格式：{ value, label, lat, lon }
   * @returns {boolean} 添加是否成功
   */
  const addFavoriteCity = (city) => {
    try {
      const favorites = getFavoriteCities()
      
      // 检查城市是否已经在收藏列表中
      const isAlreadyFavorite = favorites.some((favCity) => favCity.value === city.value)
      if (isAlreadyFavorite) {
        return false // 城市已经在收藏列表中
      }
      
      // 添加到收藏列表
      favorites.push(city)
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      return true
    } catch (error) {
      console.error('添加城市收藏失败:', error)
      return false
    }
  }
  
  /**
   * 从收藏中移除城市
   * @param {string} cityValue 城市的 value 属性
   * @returns {boolean} 移除是否成功
   */
  const removeFavoriteCity = (cityValue) => {
    try {
      const favorites = getFavoriteCities()
      const initialLength = favorites.length
      
      // 过滤掉要移除的城市
      const updatedFavorites = favorites.filter((city) => city.value !== cityValue)
      
      // 如果长度没有变化，说明城市不在收藏列表中
      if (updatedFavorites.length === initialLength) {
        return false
      }
      
      // 更新收藏列表
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites))
      return true
    } catch (error) {
      console.error('移除城市收藏失败:', error)
      return false
    }
  }
  
  /**
   * 检查城市是否已收藏
   * @param {string} cityValue 城市的 value 属性
   * @returns {boolean} 是否已收藏
   */
  const isCityFavorite = (cityValue) => {
    try {
      const favorites = getFavoriteCities()
      return favorites.some((city) => city.value === cityValue)
    } catch (error) {
      console.error('检查城市收藏状态失败:', error)
      return false
    }
  }
  
  /**
   * 清除所有收藏的城市
   * @returns {boolean} 清除是否成功
   */
  const clearFavoriteCities = () => {
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('清除城市收藏失败:', error)
      return false
    }
  }
  
  return {
    getFavoriteCities,
    addFavoriteCity,
    removeFavoriteCity,
    isCityFavorite,
    clearFavoriteCities
  }
}