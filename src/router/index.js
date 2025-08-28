import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import AboutView from "../views/AboutView.vue"
import ProjectsView from "../views/ProjectsView.vue"
import ContactView from "../views/ContactView.vue"
import GalleryView from "../views/GalleryView.vue"
import BlogView from "../views/BlogView.vue"
import BlogPostView from "../views/BlogPostView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/projects",
      name: "projects",
      component: ProjectsView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactView,
    },
    {
      path: "/gallery",
      name: "gallery",
      component: GalleryView,
      meta: {
        title: "作品图库"
      }
    },
    {
      path: "/blog",
      name: "blog",
      component: BlogView,
      meta: {
        title: "博客文章"
      }
    },
    {
      path: "/blog/:id",
      name: "blogPost",
      component: BlogPostView,
      meta: {
        title: "博客详情"
      },
      props: true
    },
  ]
})

export default router
