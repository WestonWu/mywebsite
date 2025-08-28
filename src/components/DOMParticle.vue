<template>
  <div ref="container" class="dom-particle-container">
    <!-- 粒子将通过JavaScript动态创建 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const container = ref(null);
let particles = [];
let animationId = null;

// 创建粒子元素
function createParticles() {
  if (!container.value) return;
  
  // 清空容器
  container.value.innerHTML = '';
  particles = [];
  
  const count = 20; // 适中的粒子数量
  
  for (let i = 0; i < count; i++) {
    const particle = createParticleElement(i);
    container.value.appendChild(particle.element);
    particles.push(particle);
  }
}

// 创建单个粒子元素
function createParticleElement(index) {
  // 创建div元素作为粒子
  const element = document.createElement('div');
  
  // 设置样式类
  element.classList.add('dom-particle');
  
  // 随机位置、大小和颜色
  const size = 5 + Math.random() * 10; // 适中的粒子大小
  const color = getRandomColor();
  
  // 计算实际像素位置
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  
  // 设置初始样式
  Object.assign(element.style, {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    left: `${x}px`,
    top: `${y}px`,
    boxShadow: `0 0 ${size}px ${color}`,
    opacity: 0.7 + Math.random() * 0.3 // 随机透明度
  });
  
  // 返回粒子对象，包含元素和动画属性
  return {
    element,
    size,
    x: x,
    y: y,
    speedX: (Math.random() - 0.5) * 1.2, // 适中的移动速度
    speedY: (Math.random() - 0.5) * 1.2,
    color
  };
}

// 获取随机颜色
function getRandomColor() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode') || !document.documentElement.classList.contains('light-mode');
  
  // 根据主题选择不同的颜色方案
  if (isDarkMode) {
    // 深色模式下的明亮颜色
    const colors = [
      'rgba(58, 134, 255, 0.8)',  // 蓝色
      'rgba(255, 105, 180, 0.8)', // 粉色
      'rgba(72, 209, 204, 0.8)',  // 青色
      'rgba(255, 215, 0, 0.8)',   // 金色
      'rgba(147, 112, 219, 0.8)'  // 紫色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  } else {
    // 浅色模式下的柔和颜色
    const colors = [
      'rgba(30, 144, 255, 0.7)',  // 深蓝色
      'rgba(221, 160, 221, 0.7)', // 紫红色
      'rgba(64, 224, 208, 0.7)',  // 青绿色
      'rgba(255, 165, 0, 0.7)',   // 橙色
      'rgba(138, 43, 226, 0.7)'   // 紫罗兰
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// 动画循环
function animate() {
  particles.forEach(particle => {
    // 更新位置
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    // 边界反弹
    if (particle.x < 0 || particle.x > window.innerWidth) {
      particle.speedX = -particle.speedX;
      particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
    }
    if (particle.y < 0 || particle.y > window.innerHeight) {
      particle.speedY = -particle.speedY;
      particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
    }
    
    // 应用位置更新
    Object.assign(particle.element.style, {
      left: `${particle.x}px`,
      top: `${particle.y}px`
    });
  });
  
  // 请求下一帧
  animationId = requestAnimationFrame(animate);
}

// 窗口大小变化处理
function handleResize() {
  // 重新创建粒子以适应新窗口大小
  createParticles();
}

// 主题变化处理
function handleThemeChange() {
  // 当主题变化时，更新粒子颜色
  particles.forEach(particle => {
    particle.color = getRandomColor();
    particle.element.style.backgroundColor = particle.color;
    particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
  });
}

onMounted(() => {
  if (!container.value) return;
  
  // 创建粒子
  createParticles();
  
  // 启动动画
  animate();
  
  // 添加事件监听
  window.addEventListener('resize', handleResize);
  
  // 监听主题变化
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        handleThemeChange();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true
  });
  
  console.log('DOMParticle组件已挂载 - 基础粒子动画已启动');
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
.dom-particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.dom-particle {
  position: absolute;
  border-radius: 50%; /* 确保粒子是圆形的 */
  transition: transform 0.1s ease-out;
  filter: blur(0.5px); /* 轻微模糊增加柔和度 */
}
</style>