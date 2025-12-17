import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"
import viteImagemin from "vite-plugin-imagemin"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"

export default defineConfig({
  plugins: [
    vue(),
    // 图片压缩插件
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.75, 0.8],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
    }),
    // SVG图标插件
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/assets/images")],
      symbolId: "icon-[dir]-[name]",
      inject: "body-last",
      customDomId: "__svg__icons__dom__",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // 性能优化配置
  build: {
    // 生成更小的文件
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // 删除控制台输出
        drop_debugger: true, // 删除debugger语句
        pure_funcs: ["console.log", "debugger"], // 删除特定函数调用
      },
    },
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将vue、chart.js等第三方库拆分为单独的chunk
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor.vue"
            }
            if (id.includes("chart.js") || id.includes("vue-chartjs")) {
              return "vendor.chart"
            }
            if (id.includes("@emailjs") || id.includes("emailjs-com")) {
              return "vendor.email"
            }
            if (id.includes("pinyin-pro")) {
              return "vendor.pinyin"
            }
            return "vendor.common"
          }
          // 按页面分割代码
          if (id.includes("src/views/")) {
            const match = id.match(/src\/views\/(\w+)\.vue/)
            if (match) {
              return `page.${match[1]}`
            }
          }
          // 按组件分割代码
          if (id.includes("src/components/tools/")) {
            const match = id.match(/src\/components\/tools\/(\w+)\.vue/)
            if (match) {
              return `tool.${match[1]}`
            }
          }
        },
        // 配置资源缓存策略
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源映射
    sourcemap: false,
    // 配置资源内联限制
    assetsInlineLimit: 4096, // 4KB以下资源内联
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ["vue", "vue-router", "chart.js", "vue-chartjs", "@emailjs/browser"],
  },
  // 开发服务器配置
  server: {
    open: true,
    host: true,
  },
  // 静态资源配置
  assetsInclude: ["**/*.svg", "**/*.jpg", "**/*.png", "**/*.txt"],
  // 缓存目录
  cacheDir: "./node_modules/.vite_cache",
})
