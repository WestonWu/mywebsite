<template>
  <div class="skill-chart-container">
    <canvas id="skillChart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController } from 'chart.js';

// 注册所需的组件
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps({
  skills: {
    type: Array,
    required: true
  },
  chartType: {
    type: String,
    default: 'radar',
    validator: (value) => ['radar', 'doughnut', 'bar'].includes(value)
  }
});

const chartRef = ref(null);

// 创建或更新图表的函数
const createOrUpdateChart = (skillsData) => {
  const ctx = document.getElementById('skillChart').getContext('2d');

  // 准备数据
  const labels = skillsData.map(skill => skill.name);
  const data = skillsData.map(skill => skill.level);
  const backgroundColor = generateColors(skillsData.length);

  // 销毁旧图表（如果存在）
  if (chartRef.value) {
    chartRef.value.destroy();
  }

  // 创建新图表
  chartRef.value = new Chart(ctx, {
    type: props.chartType,
    data: {
      labels: labels,
      datasets: [{
        label: '技能水平',
        data: data,
        backgroundColor: backgroundColor,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#333',
        pointHoverBackgroundColor: '#333',
        pointHoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          type: 'radialLinear',
          angleLines: {
            color: 'rgba(255, 255, 255, 0.2)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          pointLabels: {
            color: '#fff',
            font: {
              size: 12
            }
          },
          ticks: {
            backdropColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.9)', // 增加对比度，使文字更清晰
            z: 10,
            stepSize: 20, // 设置步进值为20，避免显示过多刻度
            count: 6, // 设置刻度数量
            display: true
          },
          min: 0,
          max: 100
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
};

onMounted(() => {
  createOrUpdateChart(props.skills);
});

// 监听技能数据变化，更新图表
watch(() => props.skills, (newSkills) => {
  createOrUpdateChart(newSkills);
}, { deep: true });

// 生成一组渐变颜色
function generateColors(count) {
  const colors = [];
  const baseHue = 210; // 蓝色基调
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * hueStep) % 360;
    colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
  }

  return colors;
}
</script>

<style scoped>
.skill-chart-container {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}
</style>