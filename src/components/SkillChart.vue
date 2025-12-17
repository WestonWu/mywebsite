<template>
  <div class="skill-chart-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, inject, watch } from "vue"

const props = defineProps({
  skills: {
    type: Array,
    required: true,
  },
  chartType: {
    type: String,
    default: "radar",
    validator: (value) => ["radar", "doughnut", "bar"].includes(value),
  },
})

// 从App.vue注入主题
const theme = inject("theme", { isDarkMode: { value: true } })
const isDarkMode = theme.isDarkMode

const canvasRef = ref(null)
let chartInstance = null
let Chart = null

// 获取当前主题的图表配置
const getChartConfig = () => {
  const isDark = isDarkMode.value

  return {
    backgroundColor: isDark ? "rgba(58, 134, 255, 0.7)" : "rgba(58, 134, 255, 0.7)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
    pointBackgroundColor: isDark ? "#fff" : "#000",
    pointBorderColor: isDark ? "#333" : "#fff",
    pointHoverBackgroundColor: isDark ? "#333" : "#fff",
    pointHoverBorderColor: isDark ? "#fff" : "#000",
    angleLinesColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
    gridColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    pointLabelsColor: isDark ? "#fff" : "#000",
    ticksColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
  }
}

// 更新图表主题配置，避免重新创建图表
const updateChartTheme = () => {
  if (!chartInstance) return

  const chartConfig = getChartConfig()
  const dataset = chartInstance.data.datasets[0]

  // 更新数据集样式
  dataset.backgroundColor = chartConfig.backgroundColor
  dataset.borderColor = chartConfig.borderColor
  dataset.pointBackgroundColor = chartConfig.pointBackgroundColor
  dataset.pointBorderColor = chartConfig.pointBorderColor
  dataset.pointHoverBackgroundColor = chartConfig.pointHoverBackgroundColor
  dataset.pointHoverBorderColor = chartConfig.pointHoverBorderColor

  // 更新刻度和网格样式
  const scales = chartInstance.options.scales
  if (scales.r) {
    scales.r.angleLines.color = chartConfig.angleLinesColor
    scales.r.grid.color = chartConfig.gridColor
    scales.r.pointLabels.color = chartConfig.pointLabelsColor
    scales.r.ticks.color = chartConfig.ticksColor
  }

  // 更新tooltip样式
  chartInstance.options.plugins.tooltip.backgroundColor = isDarkMode.value ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"
  chartInstance.options.plugins.tooltip.titleColor = isDarkMode.value ? "#fff" : "#000"
  chartInstance.options.plugins.tooltip.bodyColor = isDarkMode.value ? "#fff" : "#000"
  chartInstance.options.plugins.tooltip.borderColor = isDarkMode.value ? "#fff" : "#000"

  // 更新图表
  chartInstance.update('none') // 使用'none'模式，避免动画
}

// 初始化图表
const initChart = async () => {
  if (!canvasRef.value) return

  try {
    // 延迟加载Chart.js，减少初始加载时间
    if (!Chart) {
      const chartModule = await import('chart.js')
      Chart = chartModule.Chart
      // 只注册必要的组件
      Chart.register(
        chartModule.RadarController,
        chartModule.RadialLinearScale,
        chartModule.PointElement,
        chartModule.LineElement,
        chartModule.Filler,
        chartModule.Tooltip
      )
    }

    const ctx = canvasRef.value.getContext("2d")

    // 准备数据
    const skillsData = props.skills || []
    const labels = skillsData.map((skill) => skill.name)
    const data = skillsData.map((skill) => skill.level)

    // 获取当前主题的图表配置
    const chartConfig = getChartConfig()

    // 创建图表，优化配置以减少强制重排
    chartInstance = new Chart(ctx, {
      type: props.chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: "技能水平",
            data: data,
            backgroundColor: chartConfig.backgroundColor,
            borderColor: chartConfig.borderColor,
            borderWidth: 2,
            pointBackgroundColor: chartConfig.pointBackgroundColor,
            pointBorderColor: chartConfig.pointBorderColor,
            pointBorderWidth: 2,
            pointHoverBackgroundColor: chartConfig.pointHoverBackgroundColor,
            pointHoverBorderColor: chartConfig.pointHoverBorderColor,
            pointHoverBorderWidth: 2,
            pointRadius: 4, // 减小点半径
            pointHoverRadius: 6, // 减小悬停点半径
            pointHitRadius: 10, // 保持足够的点击区域
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // 禁用动画，减少重排
        },
        transitions: {
          active: {
            animation: {
              duration: 0 // 禁用激活状态动画
            }
          }
        },
        scales: {
          r: {
            type: "radialLinear",
            angleLines: {
              color: chartConfig.angleLinesColor,
              lineWidth: 1,
            },
            grid: {
              color: chartConfig.gridColor,
              lineWidth: 1,
            },
            pointLabels: {
              color: chartConfig.pointLabelsColor,
              font: {
                size: 12,
                weight: "bold",
              },
            },
            ticks: {
              backdropColor: "transparent",
              color: chartConfig.ticksColor,
              z: 10,
              stepSize: 20,
              count: 6,
              display: true,
              font: {
                size: 10,
              },
            },
            min: 0,
            max: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.raw}%`
              },
            },
            backgroundColor: isDarkMode.value ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
            titleColor: isDarkMode.value ? "#fff" : "#000",
            bodyColor: isDarkMode.value ? "#fff" : "#000",
            borderColor: isDarkMode.value ? "#fff" : "#000",
            borderWidth: 1,
            animation: {
              duration: 0 // 禁用tooltip动画
            }
          },
        },
      },
    })
  } catch (error) {
    console.error("Error creating chart:", error)
  }
}

// 监听主题变化，更新图表配置而非重新创建
watch(isDarkMode, () => {
  if (chartInstance) {
    updateChartTheme()
  }
})

// 初始化图表 - 延迟执行，避免阻塞主线程
onMounted(() => {
  // 使用setTimeout延迟加载图表，让页面先渲染
  setTimeout(() => {
    initChart()
  }, 500)
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chartInstance) {
    try {
      chartInstance.destroy()
    } catch (e) {
      console.warn("Error destroying chart:", e)
    }
    chartInstance = null
  }
})
</script>

<style scoped>
.skill-chart-container {
  width: 100%;
  height: 400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}
</style>
