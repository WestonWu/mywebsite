// 工具通用方法集合
export function useToolUtils() {
  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} - 复制是否成功
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error("复制失败:", err)
      return false
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 文件大小（字节）
   * @returns {string} - 格式化后的文件大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * 生成随机ID
   * @param {number} length - ID长度
   * @returns {string} - 随机ID
   */
  const generateRandomId = (length = 8) => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2)
  }

  return {
    copyToClipboard,
    formatFileSize,
    generateRandomId,
  }
}
