import { createRouter, createWebHistory } from 'vue-router'
import StockList from '../views/StockList.vue'
import StockAnalysis from '../views/StockAnalysis.vue'
import About from '../views/About.vue'
import Config from '../views/Config.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: StockList
  },
  {
    path: '/analysis/:code/:name',
    name: 'analysis',
    component: StockAnalysis,
    props: true
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/config',
    name: 'config',
    component: Config
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
