<template>
  <div ref="rainContainer" class="rain-container">
    <!-- 雨滴将通过JavaScript动态创建 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const rainContainer = ref(null);
let raindrops = [];
let animationId = null;

// 创建雨滴元素
function createRaindrops() {
  if (!rainContainer.value) return;
  
  // 清空容器
  rainContainer.value.innerHTML = '';
  raindrops = [];
  
  const count = 150; // 雨滴数量
  
  for (let i = 0; i < count; i++) {
    const raindrop = createRaindropElement();
    rainContainer.value.appendChild(raindrop.element);
    raindrops.push(raindrop);
  }
}

// 创建单个雨滴元素
function createRaindropElement() {
  // 创建div元素作为雨滴
  const element = document.createElement('div');
  
  // 设置样式类
  element.classList.add('raindrop');
  
  // 随机大小和透明度
  const width = 1 + Math.random() * 2; // 宽度1-3px
  const height = 15 + Math.random() * 25; // 高度15-40px
  const opacity = 0.4 + Math.random() * 0.6; // 透明度0.4-1.0
  
  // 计算初始位置
  const x = Math.random() * window.innerWidth;
  const y = -height - Math.random() * window.innerHeight; // 从屏幕上方开始
  
  // 设置初始样式
  Object.assign(element.style, {
    width: `${width}px`,
    height: `${height}px`,
    background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.1), rgba(173, 216, 230, 0.9))', // 渐变色雨滴
    left: `${x}px`,
    top: `${y}px`,
    opacity: opacity,
    position: 'absolute',
    borderRadius: '50% 50% 60% 40%', // 不规则圆形，更自然
    pointerEvents: 'none', // 不影响鼠标事件
    filter: 'blur(0.5px)', // 轻微模糊效果
    boxShadow: `0 0 ${width}px rgba(173, 216, 230, 0.5)` // 发光效果
  });
  
  // 返回雨滴对象，包含元素和动画属性
  return {
    element,
    x: x,
    y: y,
    width: width,
    height: height,
    speed: 5 + Math.random() * 10, // 下落速度5-15px/帧
    wind: -2 + Math.random() * 4, // 水平风力影响-2到2px/帧
    opacity: opacity,
    sway: Math.random() * 0.5, // 摆动幅度
    swayPhase: Math.random() * Math.PI * 2 // 摆动相位
  };
}

// 动画循环
function animate() {
  raindrops.forEach(raindrop => {
    // 更新摆动相位
    raindrop.swayPhase += 0.05;
    
    // 更新位置
    raindrop.y += raindrop.speed;
    raindrop.x += raindrop.wind + Math.sin(raindrop.swayPhase) * raindrop.sway; // 添加摆动效果
    
    // 如果雨滴落到屏幕底部以下，重新从顶部开始
    if (raindrop.y > window.innerHeight) {
      raindrop.y = -raindrop.height - Math.random() * 100;
      raindrop.x = Math.random() * window.innerWidth;
      raindrop.swayPhase = Math.random() * Math.PI * 2; // 重置摆动相位
    }
    
    // 如果雨滴移出水平边界，调整位置
    if (raindrop.x < -raindrop.width) {
      raindrop.x = window.innerWidth;
    } else if (raindrop.x > window.innerWidth) {
      raindrop.x = -raindrop.width;
    }
    
    // 应用位置更新
    Object.assign(raindrop.element.style, {
      left: `${raindrop.x}px`,
      top: `${raindrop.y}px`
    });
  });
  
  // 请求下一帧
  animationId = requestAnimationFrame(animate);
}

// 窗口大小变化处理
function handleResize() {
  // 重新创建雨滴以适应新窗口大小
  createRaindrops();
}

onMounted(() => {
  if (!rainContainer.value) return;
  
  // 创建雨滴
  createRaindrops();
  
  // 启动动画
  animate();
  
  // 添加事件监听
  window.addEventListener('resize', handleResize);
  
  console.log('RainEffect组件已挂载 - 美化后的下雨动画效果已启用');
});

onUnmounted(() => {
  // 清理资源
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.rain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5; /* 提高层级，确保在粒子效果之上 */
  overflow: hidden;
}
</style>