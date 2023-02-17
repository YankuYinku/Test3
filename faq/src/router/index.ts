import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'
import { dispatchNavigationData } from '@apetito/portal-sdk-common'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'faq',
    component: () => import('../views/Faq.vue'),
  },
  {
    path: '/:group',
    name: 'faqgroup',
    component: () => import('../views/FaqGroup.vue'),
  },
  {
    path: '/:group/:topic',
    name: 'faqtopic',
    component: () => import('../views/FaqGroup.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/help'),
  routes,
})

router.beforeEach((to, _, next) => {
  document.title = i18n.global.t(`titles.${String(to.name).toLowerCase()}`)
  next()
})

export default router
