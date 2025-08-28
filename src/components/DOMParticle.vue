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
  
  const count = 100; // 保持粒子数量为100个，但优化其他性能
  
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
    // 简化阴影效果
    boxShadow: `0 0 ${size}px ${color}`,
    opacity: 0.8 + Math.random() * 0.2, // 更高的透明度
    borderRadius: '50%', // 确保圆形
    position: 'absolute',
    // 使用transform提升性能
    transform: `translate(0, 0)`,
    willChange: 'transform, opacity' // 提示浏览器该元素将要改变
  });
  
  // 返回粒子对象，包含元素和动画属性
  return {
    element,
    size,
    x: x,
    y: y,
    speedX: (Math.random() - 0.5) * 3.0, // 减慢速度范围到±3.0
    speedY: (Math.random() - 0.5) * 3.0,
    baseSpeedX: (Math.random() - 0.5) * 3.0,
    baseSpeedY: (Math.random() - 0.5) * 3.0,
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
    
    // 边界反弹 - 重新设计反弹机制，确保速度稳定
    const maxSpeed = 8.0;
    const minSpeed = 1.0;
    const bufferDistance = 3;
    
    // X轴边界处理
    if (particle.x < 0) {
      particle.x = bufferDistance;
      // 确保反弹速度在合理范围内
      const newSpeedX = minSpeed + Math.random() * 3.0;
      particle.speedX = newSpeedX;
    } else if (particle.x > window.innerWidth) {
      particle.x = window.innerWidth - bufferDistance;
      // 确保反弹速度在合理范围内
      const newSpeedX = -(minSpeed + Math.random() * 3.0);
      particle.speedX = newSpeedX;
    }
    
    // Y轴边界处理
    if (particle.y < 0) {
      particle.y = bufferDistance;
      // 确保反弹速度在合理范围内
      const newSpeedY = minSpeed + Math.random() * 3.0;
      particle.speedY = newSpeedY;
    } else if (particle.y > window.innerHeight) {
      particle.y = window.innerHeight - bufferDistance;
      // 确保反弹速度在合理范围内
      const newSpeedY = -(minSpeed + Math.random() * 3.0);
      particle.speedY = newSpeedY;
    }
    
    // 限制粒子最大速度，防止速度过快
    if (Math.abs(particle.speedX) > maxSpeed) {
      particle.speedX = particle.speedX > 0 ? maxSpeed : -maxSpeed;
    }
    if (Math.abs(particle.speedY) > maxSpeed) {
      particle.speedY = particle.speedY > 0 ? maxSpeed : -maxSpeed;
    }
    
    // 每隔一段时间随机变换粒子颜色
    if (Math.floor(Date.now() / 5000) % 2 === 0) { // 每5秒变换一次颜色
      particle.color = getRandomColor();
      particle.element.style.backgroundColor = particle.color;
      particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
    }
    
    // 使用transform应用位置更新，提升性能
    particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
    
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
  
  // 限制连接线的数量，只连接最近的几个粒子
  const maxConnections = 3;
  let connections = [];
  
  particles.forEach(otherParticle => {
    if (particle === otherParticle) return;
    
    const dx = otherParticle.x - particle.x;
    const dy = otherParticle.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxConnectionDistance = 100; // 最大连接距离
    if (distance < maxConnectionDistance) {
      connections.push({
        particle: otherParticle,
        distance: distance,
        dx: dx,
        dy: dy
      });
    }
  });
  
  // 按距离排序并只保留最近的几个连接
  connections.sort((a, b) => a.distance - b.distance);
  connections = connections.slice(0, maxConnections);
  
  // 绘制连接线
  connections.forEach(conn => {
    const otherParticle = conn.particle;
    const dx = conn.dx;
    const dy = conn.dy;
    const distance = conn.distance;
    
    // 根据距离计算透明度
    const opacity = (100 - distance) / 100 * 0.6;
    
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
      willChange: 'opacity' // 提示浏览器该元素将要改变
    });
    
    container.value.appendChild(line);
    particle.connections.push(line);
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
  // 简化模糊效果以提升性能
}
</style>