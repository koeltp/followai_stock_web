import { createRouter, createWebHistory } from 'vue-router'
import StockList from '../views/StockList.vue'
import StockAnalysis from '../views/StockAnalysis.vue'
import About from '../views/About.vue'
import Config from '../views/Config.vue'
import AnalysisLog from '../views/AnalysisLog.vue'
import AnalysisHistory from '../views/AnalysisHistory.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: StockList
  },
  {
    path: '/analysis-history',
    name: 'analysis-history',
    component: AnalysisHistory
  },
  {
    path: '/analysis/:code/:name',
    name: 'analysis',
    component: StockAnalysis,
    props: true
  },
  {
    path: '/config',
    name: 'config',
    component: Config
  },
  {
    path: '/analysis-logs',
    name: 'analysis-logs',
    component: AnalysisLog
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
