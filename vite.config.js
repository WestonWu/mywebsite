import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue"
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 性能优化配置
  build: {
    // 生成更小的文件
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 删除控制台输出
        drop_debugger: true, // 删除debugger语句
      },
    },
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将vue、chart.js等第三方库拆分为单独的chunk
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vendor.vue'
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'vendor.chart'
            }
            if (id.includes('@emailjs') || id.includes('emailjs-com')) {
              return 'vendor.email'
            }
            return 'vendor.common'
          }
        },
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源映射
    sourcemap: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'chart.js', 'vue-chartjs', '@emailjs/browser'],
  },
  // 开发服务器配置
  server: {
    open: true,
    host: true,
  },
  // 静态资源配置
  assetsInclude: ['**/*.svg', '**/*.jpg', '**/*.png', '**/*.txt'],
  // 缓存目录
  cacheDir: './node_modules/.vite_cache',
})
