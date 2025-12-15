// 工具收藏和使用记录管理

// 本地存储键名
const FAVORITES_STORAGE_KEY = 'tool_favorites'
const RECENT_USAGE_STORAGE_KEY = 'tool_recent_usage'

// 最大最近使用记录数
const MAX_RECENT_ITEMS = 10

export function useToolFavorites() {
  /**
   * 获取收藏的工具列表
   * @returns {Array} 收藏的工具ID数组
   */
  const getFavorites = () => {
    try {
      const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY)
      return favorites ? JSON.parse(favorites) : []
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      return []
    }
  }

  /**
   * 添加工具到收藏
   * @param {string} toolId - 工具ID
   */
  const addFavorite = (toolId) => {
    try {
      const favorites = getFavorites()
      if (!favorites.includes(toolId)) {
        favorites.push(toolId)
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      }
    } catch (error) {
      console.error('添加收藏失败:', error)
    }
  }

  /**
   * 从收藏中移除工具
   * @param {string} toolId - 工具ID
   */
  const removeFavorite = (toolId) => {
    try {
      let favorites = getFavorites()
      favorites = favorites.filter(id => id !== toolId)
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('移除收藏失败:', error)
    }
  }

  /**
   * 切换工具收藏状态
   * @param {string} toolId - 工具ID
   * @returns {boolean} 切换后的收藏状态
   */
  const toggleFavorite = (toolId) => {
    try {
      const favorites = getFavorites()
      const isFavorite = favorites.includes(toolId)
      
      if (isFavorite) {
        removeFavorite(toolId)
        return false
      } else {
        addFavorite(toolId)
        return true
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      return false
    }
  }

  /**
   * 检查工具是否被收藏
   * @param {string} toolId - 工具ID
   * @returns {boolean} 是否被收藏
   */
  const isFavorite = (toolId) => {
    try {
      const favorites = getFavorites()
      return favorites.includes(toolId)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }

  /**
   * 获取最近使用的工具
   * @returns {Array} 最近使用的工具ID数组，按使用时间倒序排列
   */
  const getRecentUsage = () => {
    try {
      const recentUsage = localStorage.getItem(RECENT_USAGE_STORAGE_KEY)
      return recentUsage ? JSON.parse(recentUsage) : []
    } catch (error) {
      console.error('获取最近使用记录失败:', error)
      return []
    }
  }

  /**
   * 添加工具到最近使用记录
   * @param {string} toolId - 工具ID
   */
  const addToRecent = (toolId) => {
    try {
      let recentUsage = getRecentUsage()
      
      // 移除已存在的相同工具ID
      recentUsage = recentUsage.filter(id => id !== toolId)
      
      // 添加到开头
      recentUsage.unshift(toolId)
      
      // 限制记录数量
      if (recentUsage.length > MAX_RECENT_ITEMS) {
        recentUsage = recentUsage.slice(0, MAX_RECENT_ITEMS)
      }
      
      localStorage.setItem(RECENT_USAGE_STORAGE_KEY, JSON.stringify(recentUsage))
    } catch (error) {
      console.error('添加最近使用记录失败:', error)
    }
  }

  /**
   * 清除最近使用记录
   */
  const clearRecentUsage = () => {
    try {
      localStorage.removeItem(RECENT_USAGE_STORAGE_KEY)
    } catch (error) {
      console.error('清除最近使用记录失败:', error)
    }
  }

  /**
   * 清除所有收藏记录
   */
  const clearFavorites = () => {
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY)
    } catch (error) {
      console.error('清除收藏记录失败:', error)
    }
  }

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getRecentUsage,
    addToRecent,
    clearRecentUsage,
    clearFavorites
  }
}