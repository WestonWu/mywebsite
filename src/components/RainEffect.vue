<template>
  <div ref="rainContainer" class="rain-container">
    <!-- 雨滴将通过JavaScript动态创建 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const rainContainer = ref(null);
let raindrops = [];
let splashes = [];
let animationId = null;

// 创建雨滴元素
function createRaindrops() {
  if (!rainContainer.value) return;
  
  // 清空容器
  rainContainer.value.innerHTML = '';
  raindrops = [];
  
  const count = 50; // 减少雨滴数量到50个，提高性能
  
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
  
  // 随机大小和透明度，更真实的雨滴大小
  const width = 1 + Math.random() * 1.5; // 宽度1-2.5px，更细的雨滴
  const height = 8 + Math.random() * 20; // 高度8-28px，更符合真实雨滴
  const opacity = 0.5 + Math.random() * 0.5; // 透明度0.5-1.0
  
  // 计算初始位置
  const x = Math.random() * window.innerWidth;
  const y = -height - Math.random() * 100; // 从屏幕上方开始
  
  // 创建更真实的雨滴形状和渐变效果
  const gradient = `linear-gradient(to bottom, 
    rgba(255, 255, 255, 0.9), 
    rgba(200, 230, 255, 0.8), 
    rgba(150, 210, 255, 0.5), 
    rgba(100, 190, 255, 0.3))`;
  
  // 设置初始样式，更真实的雨滴外观
  Object.assign(element.style, {
    width: `${width}px`,
    height: `${height}px`,
    background: gradient, // 使用渐变效果，更真实
    left: `${x}px`,
    top: `${y}px`,
    opacity: opacity,
    position: 'absolute',
    borderRadius: '90% 90% 80% 80% / 80% 80% 90% 90%', // 更真实的雨滴形状
    pointerEvents: 'none', // 不影响鼠标事件
    boxShadow: '0 0 3px rgba(255, 255, 255, 0.5)', // 轻微发光效果，模拟雨滴反光
    filter: 'blur(0.5px)', // 轻微模糊，模拟运动模糊
    transform: `translate(0, 0)`, // 使用transform提升性能
    willChange: 'transform' // 提示浏览器该元素将要改变
  });
  
  // 返回雨滴对象，包含元素和动画属性
  return {
    element,
    x: x,
    y: y,
    width: width,
    height: height,
    speed: 3 + Math.random() * 8, // 初始速度3-11px/帧
    acceleration: 0.1 + Math.random() * 0.1, // 加速度，雨滴下落会加速
    wind: -1 + Math.random() * 2, // 水平风力影响-1到1px/帧，更真实
    opacity: opacity,
    sway: Math.random() * 0.3, // 摆动幅度
    swayPhase: Math.random() * Math.PI * 2, // 摆动相位
    rotation: Math.random() * 10 - 5, // 初始旋转角度，-5到5度，更真实
    rotationSpeed: -0.5 + Math.random() * 1 // 旋转速度-0.5到0.5度/帧，更真实
  };
}

// 创建水花溅起效果
function createSplash(x, y) {
  // 确保水花在屏幕范围内
  if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
    return;
  }
  
  // 减少水花粒子数量，提高性能
  const splashCount = 3 + Math.floor(Math.random() * 5); // 减少到3-7个水花粒子
  
  for (let i = 0; i < splashCount; i++) {
    // 创建水花粒子元素
    const splashElement = document.createElement('div');
    
    // 设置样式类
    splashElement.classList.add('splash-particle');
    
    // 随机大小，略小一些
    const size = 1 + Math.random() * 3; // 1-4px
    
    // 设置初始样式
    Object.assign(splashElement.style, {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: 'rgba(173, 216, 230, 0.7)',
      left: `${x}px`,
      top: `${y}px`,
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      opacity: 0.7,
      transform: `translate(0, 0)`,
      willChange: 'transform, opacity'
    });
    
    rainContainer.value.appendChild(splashElement);
    
    // 创建水花粒子对象，简化属性
    const splashParticle = {
      element: splashElement,
      x: x,
      y: y,
      size: size,
      // 简化速度范围
      speedX: (-1 + Math.random() * 2) * 1.5,
      speedY: (-2 - Math.random() * 1.5),
      gravity: 0.15 + Math.random() * 0.15,
      opacity: 0.7,
      life: 1.2 // 略短的生命周期
    };
    
    splashes.push(splashParticle);
  }
}

// 动画循环
function animate() {
  // 更新雨滴
  raindrops.forEach(raindrop => {
    // 更新摆动相位
    raindrop.swayPhase += 0.07; // 增加摆动频率，更自然
    
    // 应用加速度，雨滴下落会加速
    raindrop.speed += raindrop.acceleration;
    // 限制最大速度，防止雨滴下落过快
    raindrop.speed = Math.min(raindrop.speed, 20); // 最大速度20px/帧
    
    // 更新位置，添加更自然的摆动效果
    raindrop.y += raindrop.speed;
    raindrop.x += raindrop.wind + Math.sin(raindrop.swayPhase) * raindrop.sway * Math.sin(raindrop.y * 0.01); // 增强摆动效果，模拟风力变化
    
    // 更新旋转角度，更轻微的旋转
    raindrop.rotation += raindrop.rotationSpeed * 0.1; // 减慢旋转速度
    
    // 如果雨滴落到屏幕底部，创建水花并重置位置
    if (raindrop.y > window.innerHeight - raindrop.height - 5) {
      // 创建水花溅起效果，使用雨滴底部中心位置
      createSplash(raindrop.x + raindrop.width/2, window.innerHeight);
      
      // 重置雨滴位置到顶部，并重置速度
      raindrop.y = -raindrop.height - Math.random() * 100;
      raindrop.x = Math.random() * window.innerWidth;
      raindrop.speed = 3 + Math.random() * 8; // 重置速度
      raindrop.swayPhase = Math.random() * Math.PI * 2; // 重置摆动相位
      raindrop.rotation = Math.random() * 10 - 5; // 重置旋转角度
    }
    
    // 如果雨滴移出水平边界，调整位置
    if (raindrop.x < -raindrop.width) {
      raindrop.x = window.innerWidth;
      raindrop.swayPhase = Math.random() * Math.PI * 2; // 重置摆动相位
    } else if (raindrop.x > window.innerWidth) {
      raindrop.x = -raindrop.width;
      raindrop.swayPhase = Math.random() * Math.PI * 2; // 重置摆动相位
    }
    
    // 使用transform应用位置和旋转更新，提升性能
    raindrop.element.style.transform = `translate(${raindrop.x}px, ${raindrop.y}px) rotate(${raindrop.rotation}deg)`;
    // 根据速度调整透明度，更快的雨滴更亮
    raindrop.element.style.opacity = Math.min(raindrop.opacity, raindrop.speed * 0.05);
  });
  
  // 更新水花粒子
  for (let i = splashes.length - 1; i >= 0; i--) {
    const splash = splashes[i];
    
    // 更新位置，添加重力影响
    splash.speedY += splash.gravity; // 应用重力
    splash.x += splash.speedX;
    splash.y += splash.speedY;
    
    // 更新生命周期
    splash.life -= 0.015; // 调整生命周期消耗速度
    splash.opacity = splash.life * 0.8; // 调整透明度计算
    
    // 使用transform应用更新，提升性能
    splash.element.style.transform = `translate(${splash.x}px, ${splash.y}px)`;
    splash.element.style.opacity = splash.opacity;
    
    // 如果生命周期结束或水花落回地面，移除粒子
    if (splash.life <= 0 || splash.y > window.innerHeight) {
      splash.element.remove();
      splashes.splice(i, 1);
    }
  }
  
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
  
  console.log('RainEffect组件已挂载 - 带水花溅起效果的下雨动画已启用');
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
  z-index: 10; /* 提高层级，确保在粒子效果之上 */
  overflow: hidden;
}
</style>