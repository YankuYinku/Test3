import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/downloads',
    name: 'downloads',
    component: () => import('../views/Downloads.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  document.title = i18n.global.t(`titles.${String(to.name).toLowerCase()}`)
  next()
})

export default router
