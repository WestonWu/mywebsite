<template>
  <div class="dom-particle-container">
    <!-- 粒子将通过JavaScript动态创建 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const container = ref(null);
let particles = [];
let animationId = null;

// 创建粒子元素
function createParticles() {
  if (!container.value) return;
  
  // 清空容器
  container.value.innerHTML = '';
  particles = [];
  
  const count = 10; // 少量但非常明显的粒子
  
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
  const size = 30 + Math.random() * 20; // 30-50px的大粒子
  const color = getRandomColor();
  
  // 计算实际像素位置（使用window.innerWidth和window.innerHeight而不是vw/vh）
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  
  // 设置初始样式
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.backgroundColor = color;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  
  // 返回粒子对象，包含元素和动画属性
  return {
    element,
    size,
    x: x,
    y: y,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2,
    color,
    index
  };
}

// 获取随机鲜艳颜色
function getRandomColor() {
  const colors = [
    'rgb(255, 0, 0)',    // 红色
    'rgb(0, 255, 0)',    // 绿色
    'rgb(0, 0, 255)',    // 蓝色
    'rgb(255, 255, 0)',  // 黄色
    'rgb(255, 0, 255)',  // 紫色
    'rgb(0, 255, 255)'   // 青色
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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
      particle.x = Math.max(0, Math.min(particle.x, window.innerWidth));
    }
    if (particle.y < 0 || particle.y > window.innerHeight) {
      particle.speedY = -particle.speedY;
      particle.y = Math.max(0, Math.min(particle.y, window.innerHeight));
    }
    
    // 应用位置更新
    particle.element.style.left = `${particle.x}px`;
    particle.element.style.top = `${particle.y}px`;
    
    // 添加一些旋转效果使动画更明显
    const rotation = (Date.now() / 1000 + particle.index) * 10;
    particle.element.style.transform = `rotate(${rotation}deg)`;
  });
  
  // 请求下一帧
  animationId = requestAnimationFrame(animate);
}

// 窗口大小变化处理
function handleResize() {
  // 重新创建粒子以适应新窗口大小
  createParticles();
}

onMounted(() => {
  if (!container.value) return;
  
  // 创建粒子
  createParticles();
  
  // 启动动画
  animate();
  
  // 添加事件监听
  window.addEventListener('resize', handleResize);
  
  console.log('DOMParticle组件已挂载 - 应该能看到彩色方块在动');
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
  z-index: 10; /* 提升z-index确保在背景之上，但在主要内容之下 */
  overflow: hidden;
}

.dom-particle {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.9);
  border: 3px solid white;
  /* 移除transition，使用JavaScript直接控制动画 */
}
</style>