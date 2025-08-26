<template>
    <nav class="navbar">
        <div class="nav-brand">
            <router-link to="/">我的个人网站</router-link>
        </div>
        <div class="menu-toggle" :class="{ 'active': isMenuOpen }" @click="toggleMenu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <ul class="nav-links" :class="{ 'active': isMenuOpen }">
            <li>
                <router-link to="/" @click="closeMenu">首页</router-link>
            </li>
            <li>
                <router-link to="/about" @click="closeMenu">关于我</router-link>
            </li>
            <li>
                <router-link to="/projects" @click="closeMenu">项目展示</router-link>
            </li>
            <li>
                <router-link to="/contact" @click="closeMenu">联系方式</router-link>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';

const isMenuOpen = ref(false);

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
    isMenuOpen.value = false;
}

// 添加滚动监听，当页面滚动时关闭菜单
function handleScroll() {
    if (isMenuOpen.value) {
        isMenuOpen.value = false;
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.navbar {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-brand a {
    color: var(--text-primary);
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.nav-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    padding: 0.5rem 0;
    transition: all 0.3s ease;
}

.nav-links a:hover {
    color: var(--text-primary);
}

.nav-links a::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--accent-color);
    transition: all 0.3s ease;
}

.nav-links a:hover::after {
    width: 100%;
}

/* 桌面端样式 */
.menu-toggle {
    display: none;
}

/* 移动端样式 */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .nav-brand {
        margin-bottom: 0;
    }

    .menu-toggle {
        display: block;
        cursor: pointer;
        z-index: 110;
    }

    .bar {
        display: block;
        width: 25px;
        height: 3px;
        margin: 5px auto;
        transition: all 0.3s ease;
        background-color: var(--text-primary);
    }

    .menu-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }

    .menu-toggle.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }

    .menu-toggle.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }

    .nav-links {
        position: fixed;
        left: -100%;
        top: 0;
        flex-direction: column;
        background-color: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        width: 100%;
        height: 100vh;
        text-align: center;
        transition: 0.3s;
        padding-top: 80px;
        gap: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .nav-links.active {
        left: 0;
        z-index: 105;
    }

    .nav-links a {
        font-size: 1.5rem;
        padding: 1rem;
    }

    .nav-links a::after {
        height: 3px;
    }
}
</style>
