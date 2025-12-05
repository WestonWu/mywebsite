<template>
  <div class="skill-chart-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, inject, watch } from "vue"
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController } from "chart.js"

// 注册所需的组件
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

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

// 初始化图表
const initChart = () => {
  if (!canvasRef.value) return

  try {
    const ctx = canvasRef.value.getContext("2d")

    // 准备数据
    const skillsData = props.skills || []
    const labels = skillsData.map((skill) => skill.name)
    const data = skillsData.map((skill) => skill.level)

    // 获取当前主题的图表配置
    const chartConfig = getChartConfig()

    // 创建图表
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
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
          },
        },
      },
    })
  } catch (error) {
    console.error("Error creating chart:", error)
  }
}

// 监听主题变化，重新创建图表
watch(isDarkMode, () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  initChart()
})

// 初始化图表 - 只在组件挂载时调用一次
onMounted(() => {
  initChart()
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
