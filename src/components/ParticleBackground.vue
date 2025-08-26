<template>
    <div class="background-container">
        <canvas ref="canvas" class="particle-background"></canvas>
    </div>
    <div class="animation-controls">
        <button
            v-for="type in animationTypes"
            :key="type.id"
            :class="['control-btn', { active: currentAnimation === type.id }]"
            @click="handleAnimationChange(type.id)"
        >
            {{ type.name }}
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const canvas = ref(null)
let animationFrameId = null
const currentAnimation = ref("particles")
let ctx = null
let particles = []
let raindrops = []
let colorOffset = 0

// 颜色配置
const colors = [
    { r: 0, g: 112, b: 243 }, // 亮蓝色
    { r: 255, g: 45, b: 85 }, // 亮红色
    { r: 147, g: 51, b: 234 }, // 亮紫色
    { r: 52, g: 199, b: 89 }, // 亮绿色
    { r: 255, g: 159, b: 10 }, // 橙色
]

// 获取当前颜色
const getCurrentColor = (offset = 0) => {
    const time = (Date.now() / 3000 + offset) % colors.length // 使用时间戳来控制颜色变化
    const index1 = Math.floor(time)
    const index2 = (index1 + 1) % colors.length
    const ratio = time - index1

    const color1 = colors[index1]
    const color2 = colors[index2]

    return {
        r: Math.round(color1.r + (color2.r - color1.r) * ratio),
        g: Math.round(color1.g + (color2.g - color1.g) * ratio),
        b: Math.round(color1.b + (color2.b - color1.b) * ratio),
    }
}

// 设置canvas尺寸
const resizeCanvas = () => {
    if (!canvas.value) return
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
}

// 粒子类
class Particle {
    constructor() {
        if (!canvas.value) {
            this.x = 0
            this.y = 0
        } else {
            this.x = Math.random() * canvas.value.width
            this.y = Math.random() * canvas.value.height
        }
        this.size = Math.random() * 1.5 + 0.5 // 减小粒子尺寸
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.opacity = Math.random() * 0.3 + 0.7
        this.colorOffset = Math.random() * 2
        this.glowSize = this.size * 2 // 发光范围
    }

    update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.value.width) this.x = 0
        else if (this.x < 0) this.x = canvas.value.width

        if (this.y > canvas.value.height) this.y = 0
        else if (this.y < 0) this.y = canvas.value.height
    }

    draw() {
        const color = getCurrentColor(this.colorOffset)

        // 添加发光效果
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowSize)
        glow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`)
        glow.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity * 0.3})`)
        glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

        // 绘制发光效果
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // 绘制粒子核心
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`
        ctx.fill()
    }
}

// 雨滴类
class Raindrop {
    constructor() {
        this.reset()
        this.splashing = false
        this.splashProgress = 0
        this.splashDroplets = []
    }

    reset() {
        if (!canvas.value) {
            this.x = 0
        } else {
            this.x = Math.random() * canvas.value.width
        }
        this.y = -10
        this.z = Math.random() * 3 + 1
        this.speed = (Math.random() * 1 + 1.5) * this.z // 降低基础速度
        this.size = (Math.random() * 2 + 2) * this.z
        this.opacity = (Math.random() * 0.2 + 0.3) * this.z
        this.angle = Math.PI / 16 + (Math.random() * Math.PI) / 32 // 减小倾斜角度
        this.wobble = 0
        this.wobbleSpeed = Math.random() * 0.01 // 减小摆动速度
    }

    draw() {
        if (this.splashing) {
            this.splashDroplets.forEach((droplet) => {
                if (droplet.opacity <= 0) return
                // 绘制水花效果
                const glow = ctx.createRadialGradient(
                    droplet.x,
                    droplet.y,
                    0,
                    droplet.x,
                    droplet.y,
                    droplet.size * 2
                )
                glow.addColorStop(0, `rgba(255, 255, 255, ${droplet.opacity})`)
                glow.addColorStop(1, "rgba(255, 255, 255, 0)")

                ctx.beginPath()
                ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2)
                ctx.fillStyle = glow
                ctx.fill()
            })
            return
        }

        // 绘制水滴主体
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)

        // 绘制水滴形状
        const dropHeight = this.size * 2
        const dropWidth = this.size

        // 控制点的相对位置
        const cp1x = this.x - dropWidth
        const cp1y = this.y + dropHeight * 0.25
        const cp2x = this.x + dropWidth
        const cp2y = this.y + dropHeight * 0.25
        const endX = this.x
        const endY = this.y + dropHeight

        // 使用贝塞尔曲线绘制水滴形状
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
        ctx.bezierCurveTo(cp2x, cp2y, cp1x, cp1y, this.x, this.y)

        // 创建水滴的渐变效果
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + dropHeight)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`)
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.opacity * 0.3})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * 0.1})`)

        ctx.fillStyle = gradient
        ctx.fill()

        // 添加高光效果
        const highlight = ctx.createRadialGradient(
            this.x - this.size * 0.3,
            this.y + this.size * 0.3,
            0,
            this.x - this.size * 0.3,
            this.y + this.size * 0.3,
            this.size * 0.5
        )
        highlight.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`)
        highlight.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.beginPath()
        ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.3, this.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = highlight
        ctx.fill()
    }

    createSplash() {
        this.splashing = true
        this.splashProgress = 0
        this.splashDroplets = []
        const numDroplets = Math.floor(Math.random() * 3) + 2
        for (let i = 0; i < numDroplets; i++) {
            this.splashDroplets.push({
                x: this.x + (Math.random() - 0.5) * this.size * 4,
                y: canvas.value.height,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -(Math.random() * 2 + 1),
                size: Math.random() * this.size * 0.3,
                opacity: this.opacity * 0.6,
            })
        }
    }

    update() {
        if (this.splashing) {
            this.splashProgress += 0.05 // 减慢水花消失速度
            this.splashDroplets.forEach((droplet) => {
                droplet.x += droplet.speedX * 0.5 // 减慢水花横向扩散速度
                droplet.y += droplet.speedY * 0.5 // 减慢水花纵向运动速度
                droplet.speedY += 0.1 * this.z // 减小重力影响
                droplet.opacity -= 0.01 // 减慢透明度变化
            })

            if (this.splashProgress >= 1) {
                this.reset()
                this.splashing = false
            }
            return
        }

        this.wobble += this.wobbleSpeed
        const wobbleX = Math.sin(this.wobble) * 0.2 // 减小横向摆动幅度
        this.x += wobbleX + Math.sin(this.angle) * this.speed * 0.05 // 减小横向漂移
        this.y += this.speed * 0.8 // 降低实际下落速度

        if (this.y > canvas.value.height) {
            this.createSplash()
        }
    }
}

const animationTypes = [
    { id: "particles", name: "粒子" },
    { id: "rain", name: "雨滴" },
    { id: "mixed", name: "混合" },
]

// 添加动画切换处理函数
const handleAnimationChange = (type) => {
    currentAnimation.value = type
    if (canvas.value && ctx) {
        if (type === "particles" || type === "mixed") {
            initParticles()
        }
        if (type === "rain" || type === "mixed") {
            initRain()
        }
        // 强制重绘
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }
        animate()
    }
}

// 初始化粒子
const initParticles = () => {
    if (!canvas.value) return
    particles = []
    const numberOfParticles = (canvas.value.width * canvas.value.height) / 6000
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle())
    }
}

// 初始化雨滴
const initRain = () => {
    if (!canvas.value) return
    raindrops = []
    const numberOfDrops = Math.floor((canvas.value.width * canvas.value.height) / 8000)
    for (let i = 0; i < numberOfDrops; i++) {
        raindrops.push(new Raindrop())
    }
}

// 连接粒子
const connectParticles = () => {
    if (!canvas.value || !ctx) return
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
                const opacity = (1 - distance / 150) * 0.5 // 降低连接线不透明度以突出发光效果
                ctx.beginPath()

                const color1 = getCurrentColor(particles[i].colorOffset)
                const color2 = getCurrentColor(particles[j].colorOffset)

                const gradient = ctx.createLinearGradient(
                    particles[i].x,
                    particles[i].y,
                    particles[j].x,
                    particles[j].y
                )
                gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${opacity})`)
                gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${opacity})`)
                ctx.strokeStyle = gradient
                ctx.lineWidth = 0.8 // 减小线条宽度
                ctx.moveTo(particles[i].x, particles[i].y)
                ctx.lineTo(particles[j].x, particles[j].y)
                ctx.stroke()
            }
        }
    }
}

// 动画循环
const animate = () => {
    if (!canvas.value || !ctx) return
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    if (currentAnimation.value === "particles" || currentAnimation.value === "mixed") {
        particles.forEach((particle) => {
            particle.update()
            particle.draw()
        })
        connectParticles()
    }

    if (currentAnimation.value === "rain" || currentAnimation.value === "mixed") {
        raindrops.forEach((drop) => {
            drop.update()
            drop.draw()
        })
    }

    animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
    if (!canvas.value) return
    ctx = canvas.value.getContext("2d")

    // 初始化
    resizeCanvas()
    initParticles()
    initRain()
    animate()

    // 监听窗口大小变化
    window.addEventListener("resize", handleResize)
})

// 窗口调整大小处理函数
const handleResize = () => {
    resizeCanvas()
    initParticles()
    initRain()
}

onUnmounted(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener("resize", handleResize)
})
</script>

<style scoped>
.background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: linear-gradient(to bottom, #000000, #1a1a2e); /* 更深的背景色 */
    z-index: 0;
}

.particle-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.animation-controls {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateZ(9999px);
    display: flex;
    flex-direction: row;
    gap: 15px;
    align-items: center;
    justify-content: center;
    z-index: 999999999; /* 极高z-index确保绝对在最顶层 */
    padding: 12px 20px;
    background: rgba(10, 10, 20, 0.3); /* 略微增加背景不透明度以提高可见度 */
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
    pointer-events: auto;
    backdrop-filter: blur(10px); /* 减少模糊效果以提高清晰度 */
    border: 1px solid rgba(255, 255, 255, 0.5); /* 显著增加边框不透明度 */
    /* 确保始终显示在最上层的额外措施 */
    will-change: transform;
    /* 增强透明效果 */
    mix-blend-mode: normal;
    opacity: 1;
    visibility: visible;
}

.control-btn {
    padding: 10px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1); /* 增加按钮背景不透明度 */
    color: #ffffff; /* 纯白色文字 */
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
    font-weight: 700; /* 增加字体粗细 */
    border: 1px solid rgba(255, 255, 255, 0.6); /* 显著增加按钮边框不透明度 */
    min-width: 80px;
    backdrop-filter: blur(8px); /* 减少模糊效果以提高清晰度 */
    font-family: Arial, sans-serif;
    letter-spacing: 0.5px;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.15); /* 增加悬停背景不透明度 */
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* 增强悬停阴影 */
    border-color: rgba(255, 255, 255, 0.8);
}

.control-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
    color: #ffffff;
}
</style>
