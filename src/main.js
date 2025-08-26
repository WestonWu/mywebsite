import { createApp } from 'vue'
import App from "./App.vue"
import router from "./router"

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 简单的访问统计功能
function trackPageView() {
  const currentPath = window.location.pathname
  const timestamp = new Date().toISOString()
  const userAgent = navigator.userAgent
  const screenSize = `${window.innerWidth}x${window.innerHeight}`
  
  // 在实际应用中，这里会发送数据到统计服务器
  console.log(`[访问统计] 页面: ${currentPath}, 时间: ${timestamp}, 设备: ${userAgent}, 屏幕: ${screenSize}`)
  
  // 模拟数据存储
  try {
    const stats = JSON.parse(localStorage.getItem('pageStats') || '{}')
    const pageKey = currentPath.replace('/', '_').slice(1) || 'home'
    
    if (!stats[pageKey]) {
      stats[pageKey] = { views: 0, lastView: '' }
    }
    
    stats[pageKey].views += 1
    stats[pageKey].lastView = timestamp
    
    localStorage.setItem('pageStats', JSON.stringify(stats))
  } catch (e) {
    console.error('访问统计数据存储失败:', e)
  }
}

// 监听路由变化，记录页面访问
router.afterEach(() => {
  trackPageView()
})

// 挂载应用
app.mount("#app")
