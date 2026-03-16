import { createRouter, createWebHistory } from 'vue-router'
import StockList from '../components/StockList.vue'
import StockAnalysis from '../components/StockAnalysis.vue'
import About from '../components/About.vue'
import Config from '../components/Config.vue'

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
