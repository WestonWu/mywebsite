import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/projects",
      name: "projects",
      component: () => import("../views/ProjectsView.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/ContactView.vue"),
    },
    {
      path: "/gallery",
      name: "gallery",
      component: () => import("../views/GalleryView.vue"),
      meta: {
        title: "作品图库"
      }
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("../views/BlogView.vue"),
      meta: {
        title: "博客文章"
      }
    },
    {
      path: "/blog/:id",
      name: "blogPost",
      component: () => import("../views/BlogPostView.vue"),
      meta: {
        title: "博客详情"
      },
      props: true
    },
    {
      path: "/tools",
      name: "tools",
      component: () => import("../views/ToolsView.vue"),
      meta: {
        title: "实用工具"
      }
    },
  ]
})

export default router
