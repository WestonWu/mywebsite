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
let mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// 创建粒子元素
function createParticles() {
  if (!container.value) return;
  
  // 清空容器
  container.value.innerHTML = '';
  particles = [];
  
  const count = 50; // 增加粒子数量到50个
  
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
  const size = 2 + Math.random() * 3; // 更小的粒子大小：2-5px
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
    boxShadow: `0 0 ${size * 1.5}px ${color}`,
    opacity: 0.8 + Math.random() * 0.2, // 更高的透明度
    borderRadius: '50%', // 确保圆形
    position: 'absolute',
    transition: 'transform 0.2s ease-out, opacity 0.3s ease'
  });
  
  // 返回粒子对象，包含元素和动画属性
  return {
    element,
    size,
    x: x,
    y: y,
    speedX: (Math.random() - 0.5) * 2.0, // 增加速度范围
    speedY: (Math.random() - 0.5) * 2.0,
    baseSpeedX: (Math.random() - 0.5) * 2.0,
    baseSpeedY: (Math.random() - 0.5) * 2.0,
    color,
    index,
    connections: []
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
      'rgba(147, 112, 219, 0.8)', // 紫色
      'rgba(50, 205, 50, 0.8)'    // 绿色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  } else {
    // 浅色模式下的柔和颜色
    const colors = [
      'rgba(30, 144, 255, 0.7)',  // 深蓝色
      'rgba(221, 160, 221, 0.7)', // 紫红色
      'rgba(64, 224, 208, 0.7)',  // 青绿色
      'rgba(255, 165, 0, 0.7)',   // 橙色
      'rgba(138, 43, 226, 0.7)',  // 紫罗兰
      'rgba(60, 179, 113, 0.7)'   // 海洋绿
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// 鼠标移动事件处理
function handleMouseMove(e) {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
}

// 动画循环
function animate() {
  particles.forEach(particle => {
    // 更新位置
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    // 边界反弹 - 增加反弹力度并添加边界推力
    if (particle.x < 0) {
      particle.speedX = Math.abs(particle.speedX) * 1.2; // 增加反弹力度
      particle.x = 0;
      particle.speedX += 0.5; // 添加边界推力
    } else if (particle.x > window.innerWidth) {
      particle.speedX = -Math.abs(particle.speedX) * 1.2;
      particle.x = window.innerWidth;
      particle.speedX -= 0.5;
    }
    if (particle.y < 0) {
      particle.speedY = Math.abs(particle.speedY) * 1.2;
      particle.y = 0;
      particle.speedY += 0.5;
    } else if (particle.y > window.innerHeight) {
      particle.speedY = -Math.abs(particle.speedY) * 1.2;
      particle.y = window.innerHeight;
      particle.speedY -= 0.5;
    }
    
    // 鼠标互动效果 - 粒子避开鼠标
    const dx = particle.x - mousePosition.x;
    const dy = particle.y - mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const avoidRadius = 120; // 避开范围
    if (distance < avoidRadius) {
      // 计算避开方向
      const force = (avoidRadius - distance) / avoidRadius * 1.5;
      particle.speedX = particle.baseSpeedX + (dx / distance) * force;
      particle.speedY = particle.baseSpeedY + (dy / distance) * force;
      
      // 鼠标靠近时粒子变大
      particle.element.style.transform = `scale(${1 + (avoidRadius - distance) / avoidRadius * 0.5})`;
    } else {
      // 恢复基础速度和大小
      particle.speedX += (particle.baseSpeedX - particle.speedX) * 0.05;
      particle.speedY += (particle.baseSpeedY - particle.speedY) * 0.05;
      particle.element.style.transform = 'scale(1)';
    }
    
    // 应用位置更新
    Object.assign(particle.element.style, {
      left: `${particle.x}px`,
      top: `${particle.y}px`
    });
    
    // 绘制粒子之间的连接线
    drawConnections(particle);
  });
  
  // 请求下一帧
  animationId = requestAnimationFrame(animate);
}

// 绘制粒子之间的连接线
function drawConnections(particle) {
  // 清除之前的连接
  particle.connections.forEach(connection => {
    if (connection.parentNode) {
      connection.parentNode.removeChild(connection);
    }
  });
  particle.connections = [];
  
  particles.forEach(otherParticle => {
    if (particle === otherParticle) return;
    
    const dx = otherParticle.x - particle.x;
    const dy = otherParticle.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxConnectionDistance = 100; // 最大连接距离
    if (distance < maxConnectionDistance) {
      // 根据距离计算透明度
      const opacity = (maxConnectionDistance - distance) / maxConnectionDistance * 0.6;
      
      // 创建连接线条
      const line = document.createElement('div');
      Object.assign(line.style, {
        position: 'absolute',
        background: `linear-gradient(to right, ${particle.color}, ${otherParticle.color})`,
        height: '1px',
        left: `${particle.x + particle.size / 2}px`,
        top: `${particle.y + particle.size / 2}px`,
        width: `${distance}px`,
        transformOrigin: '0 50%',
        transform: `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`,
        pointerEvents: 'none',
        opacity: opacity,
        zIndex: '0',
        transition: 'opacity 0.2s ease'
      });
      
      container.value.appendChild(line);
      particle.connections.push(line);
    }
  });
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
    particle.element.style.boxShadow = `0 0 ${particle.size * 1.5}px ${particle.color}`;
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
  window.addEventListener('mousemove', handleMouseMove);
  
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
  
  console.log('DOMParticle组件已挂载 - 增强的互动粒子效果已启用');
});

onUnmounted(() => {
  // 清理资源
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style>
/* 使用全局样式确保粒子能够正确显示 */
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
  border-radius: 50%; /* 确保粒子是圆形的 */
  filter: blur(0.8px); /* 更柔和的模糊效果 */
}
</style>