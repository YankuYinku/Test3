import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import env from '@/utils/env'
import i18n from '@/i18n'
import { dispatchNavigationData } from '@apetito/portal-sdk-common'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'PrivacyPolicy',
    component: () => import(/* webpackChunkName: "privacypolicy" */ '../views/PrivacyPolicy.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(env.VUE_APP_BASE_URL),
  routes,
})

router.beforeEach((to, _, next) => {
  document.title = i18n.global.t(`titles.${String(to.name).toLowerCase()}`)
  next()
})

export default router
