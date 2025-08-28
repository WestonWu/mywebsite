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
  
  const count = 30; // 增加粒子数量以增强视觉效果
  
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
  const size = 5 + Math.random() * 15; // 更小的粒子，更精致
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
    // 根据粒子大小调整发光效果
    boxShadow: `0 0 ${size * 3}px ${size * 0.5}px ${color}`,
    opacity: 0.7 + Math.random() * 0.3 // 随机透明度增加层次感
  });
  
  // 返回粒子对象，包含元素和动画属性
  return {
    element,
    size,
    x: x,
    y: y,
    speedX: (Math.random() - 0.5) * 0.8, // 更小的速度，更平滑
    speedY: (Math.random() - 0.5) * 0.8,
    baseSpeedX: (Math.random() - 0.5) * 0.8,
    baseSpeedY: (Math.random() - 0.5) * 0.8,
    color,
    index,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.5,
    // 添加粒子之间的连接效果
    connections: []
  };
}

// 获取主题感知的柔和颜色
function getRandomColor() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode') || !document.documentElement.classList.contains('light-mode');
  
  // 根据主题选择不同的颜色方案
  if (isDarkMode) {
    // 深色模式下的明亮但不刺眼的颜色
    const colors = [
      'rgba(58, 134, 255, 0.8)',  // 蓝色
      'rgba(255, 105, 180, 0.8)', // 粉色
      'rgba(72, 209, 204, 0.8)',  // 青色
      'rgba(255, 215, 0, 0.8)',   // 金色
      'rgba(147, 112, 219, 0.8)', // 紫色
      'rgba(255, 160, 122, 0.8)'  // 珊瑚色
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
      'rgba(255, 99, 71, 0.7)'    // 番茄色
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
    particle.rotation += particle.rotationSpeed;
    
    // 边界反弹
    if (particle.x < -particle.size) {
      particle.x = window.innerWidth + particle.size;
    } else if (particle.x > window.innerWidth + particle.size) {
      particle.x = -particle.size;
    }
    if (particle.y < -particle.size) {
      particle.y = window.innerHeight + particle.size;
    } else if (particle.y > window.innerHeight + particle.size) {
      particle.y = -particle.size;
    }
    
    // 鼠标互动效果 - 粒子避开鼠标
    const dx = particle.x - mousePosition.x;
    const dy = particle.y - mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const avoidRadius = 150; // 避开范围
    if (distance < avoidRadius) {
      // 计算避开方向
      const force = (avoidRadius - distance) / avoidRadius * 2;
      particle.speedX = particle.baseSpeedX + (dx / distance) * force;
      particle.speedY = particle.baseSpeedY + (dy / distance) * force;
    } else {
      // 恢复基础速度
      particle.speedX += (particle.baseSpeedX - particle.speedX) * 0.02;
      particle.speedY += (particle.baseSpeedY - particle.speedY) * 0.02;
    }
    
    // 应用位置和旋转更新
    Object.assign(particle.element.style, {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      transform: `rotate(${particle.rotation}deg)`
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
    
    const dx = particle.x - otherParticle.x;
    const dy = particle.y - otherParticle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxConnectionDistance = 150; // 最大连接距离
    if (distance < maxConnectionDistance) {
      // 根据距离计算透明度
      const opacity = (maxConnectionDistance - distance) / maxConnectionDistance * 0.3;
      
      // 创建连接线条
      const line = document.createElement('div');
      Object.assign(line.style, {
        position: 'absolute',
        background: `rgba(255, 255, 255, ${opacity})`,
        height: '1px',
        left: `${particle.x + particle.size / 2}px`,
        top: `${particle.y + particle.size / 2}px`,
        width: `${distance}px`,
        transformOrigin: '0 50%',
        transform: `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`,
        pointerEvents: 'none',
        zIndex: '1'
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
    particle.element.style.boxShadow = `0 0 ${particle.size * 3}px ${particle.size * 0.5}px ${particle.color}`;
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
  
  console.log('DOMParticle组件已挂载 - 优化的粒子效果已启用');
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
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.1s ease-out, opacity 0.3s ease;
  filter: blur(0.5px); /* 轻微模糊增加柔和度 */
}
</style>