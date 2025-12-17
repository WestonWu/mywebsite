<template>
  <div class="seasonal-background">
    <!-- 背景图片容器，使用动态背景和过渡效果 -->
    <div
      class="background-image"
      :style="{
        backgroundImage: `url(${currentBackgroundUrl})`,
        opacity: imageOpacity,
      }"
    ></div>
    <!-- 半透明遮罩层，确保前景内容可读 -->
    <div class="background-overlay"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from "vue"

export default {
  name: "SeasonalBackground",
  setup() {
    // 响应式数据
    // 初始化currentBackgroundUrl为一个默认图片URL，确保初始状态下背景不是空的
    const currentBackgroundUrl = ref("https://picsum.photos/1920/1080?default=true")
    const imageOpacity = ref(1) // 初始透明度为1，确保初始状态下背景可见
    let timeUpdateInterval = null

    // 季节映射
    const SEASONS = {
      SPRING: "spring",
      SUMMER: "summer",
      AUTUMN: "autumn",
      WINTER: "winter",
    }

    // 时间段映射
    const TIME_PERIODS = {
      MORNING: "morning",
      AFTERNOON: "afternoon",
      EVENING: "evening",
      NIGHT: "night",
    }

    // 根据日期获取季节
    const getSeason = (date) => {
      const month = date.getMonth() + 1 // JavaScript 月份从 0 开始

      if (month >= 3 && month <= 5) {
        return SEASONS.SPRING
      } else if (month >= 6 && month <= 8) {
        return SEASONS.SUMMER
      } else if (month >= 9 && month <= 11) {
        return SEASONS.AUTUMN
      } else {
        return SEASONS.WINTER
      }
    }

    // 根据时间获取时间段
    const getTimePeriod = (date) => {
      const hour = date.getHours()

      if (hour >= 6 && hour < 12) {
        return TIME_PERIODS.MORNING
      } else if (hour >= 12 && hour < 18) {
        return TIME_PERIODS.AFTERNOON
      } else if (hour >= 18 && hour < 22) {
        return TIME_PERIODS.EVENING
      } else {
        return TIME_PERIODS.NIGHT
      }
    }

    // 图片缓存，避免重复加载
    const imageCache = new Set()

    // 生成背景图片 URL
    const generateBackgroundUrl = (season, timePeriod) => {
      // 使用真实本地图片路径
      return `/backgrounds/${season}/${timePeriod}.jpg`
    }

    // 预加载单张图片
    const preloadImage = (url) => {
      if (imageCache.has(url)) {
        return Promise.resolve()
      }

      return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = () => {
          imageCache.add(url)
          resolve()
        }

        img.onerror = (error) => {
          // 确保返回有意义的错误信息
          reject(new Error(`Failed to load image: ${url}`))
        }

        img.src = url
      })
    }

    // 预加载当前季节的所有图片
    const preloadSeasonImages = async (season) => {
      const timePeriods = Object.values(TIME_PERIODS)
      const promises = timePeriods.map((timePeriod) => {
        const url = generateBackgroundUrl(season, timePeriod)
        return preloadImage(url)
      })

      // 直接使用 Promise.allSettled，不需要在map中处理
      const results = await Promise.allSettled(promises)

      return results
    }

    // 切换背景图片的辅助函数
    const changeBackground = (newUrl) => {
      // 确保newUrl不为空
      if (!newUrl) {
        return
      }

      // 简化过渡效果，直接更新背景图片
      // 先设置opacity为0.8，然后立即恢复到1，产生轻微的闪烁效果
      imageOpacity.value = 0.8
      currentBackgroundUrl.value = newUrl

      // 立即恢复透明度，避免背景长时间不可见
      setTimeout(() => {
        imageOpacity.value = 1
      }, 100)
    }

    // 更新背景图片
    const updateBackground = () => {
      const now = new Date()

      const season = getSeason(now)
      const timePeriod = getTimePeriod(now)

      // 获取当前时间段的图片 URL
      const localUrl = generateBackgroundUrl(season, timePeriod)

      // 准备占位符图片 URL
      const placeholderUrl = `https://picsum.photos/1920/1080?season=${season}&time=${timePeriod}&t=${Date.now()}`

      // 直接使用本地图片，同时准备占位符作为备选
      changeBackground(localUrl)

      // 异步验证本地图片是否存在，如果不存在则切换到占位符
      const img = new Image()
      img.onload = () => {
        imageCache.add(localUrl)
      }
      img.onerror = () => {
        // 如果本地图片不存在，切换到占位符
        changeBackground(placeholderUrl)
      }
      img.src = localUrl

      // 异步预加载当前季节的其他图片，不阻塞主流程
      preloadSeasonImages(season).catch(() => {
        // 静默处理预加载错误
      })
    }

    // 添加watch监听器，确保currentBackgroundUrl不会为空
    watch(currentBackgroundUrl, (newUrl) => {
      if (!newUrl) {
        // 如果currentBackgroundUrl为空，恢复默认图片
        currentBackgroundUrl.value = "https://picsum.photos/1920/1080?default=true"
      }
    })

    // 初始化和清理
    onMounted(() => {
      // 初始加载背景
      updateBackground()

      // 每小时更新一次背景，确保时间变化时背景也随之变化
      timeUpdateInterval = setInterval(updateBackground, 3600000)
    })

    onUnmounted(() => {
      // 清理定时器
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval)
      }
    })

    return {
      currentBackgroundUrl,
      imageOpacity,
    }
  },
}
</script>

<style scoped>
.seasonal-background {
  /* 固定定位，覆盖整个视口 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.background-image {
  /* 覆盖整个容器 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 背景图片样式 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* 平滑过渡效果 */
  transition: opacity 0.5s ease-in-out;
  /* 设置z-index，确保背景图片在遮罩层之下 */
  z-index: 0;
}

.background-overlay {
  /* 半透明遮罩层，确保前景内容可读 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 渐变遮罩，从上到下逐渐加深，确保底部内容可读 */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%);
  /* 确保遮罩层在图片之上，但在其他内容之下 */
  z-index: 0;
}

/* 确保在深色模式下遮罩层效果更明显 */
:root.dark-mode .background-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%);
}

/* 浅色模式下遮罩层较浅，但仍需确保内容可读 */
:root.light-mode .background-overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
}
</style>
