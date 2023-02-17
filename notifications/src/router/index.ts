import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import env from '@/utils/env'

const routes: Array<RouteRecordRaw> = []

const router = createRouter({
  history: createWebHashHistory(env.VUE_APP_BASE_URL),
  routes,
})

export default router
