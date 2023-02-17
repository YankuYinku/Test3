import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordName,
  RouteRecordRaw,
} from 'vue-router'
import MyCompany from '../views/MyCompany.vue'
import Profile from '../views/Profile.vue'
import env from '@/utils/env'
import i18n from '@/i18n'
import { initFeatureFlags, FeatureResponse } from '@apetito/portal-sdk-common'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/my-profile',
  },
  {
    path: '/my-company',
    name: 'MyCompany',
    component: MyCompany,
  },
  {
    path: '/my-profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import(/* webpackChunkName: "accounts" */ '../views/Accounts.vue'),
    meta: {
      isFeatureFlagged: true,
      featureName: 'apetito.meinapetito.portal.accountList',
    },
  },
  {
    path: '/bkt',
    name: 'Bkt',
    component: () => import(/* webpackChunkName: "bkt" */ '../views/Bkt.vue'),
    meta: {
      isFeatureFlagged: true,
      featureName: 'apetito.meinapetito.portal.bkt',
    },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import(/* webpackChunkName: "orders" */ '../views/Orders.vue'),
    meta: {
      isFeatureFlagged: true,
      featureName: 'apetito.meinapetito.portal.orderHistory',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(env.VUE_APP_BASE_URL),
  routes,
})

function setTitle(title: RouteRecordName | null | undefined) {
  document.title = i18n.global.t(`titles.${String(title).toLowerCase()}`)
}

router.beforeEach(to => {
  if (to.meta.isFeatureFlagged) {
    return initFeatureFlags([to.meta.featureName as string]).then((result: FeatureResponse[]) => {
      const featureEnabled = result?.find(
        feature => feature.feature === to.meta.featureName && feature.value
      )
      if (featureEnabled) {
        setTitle(to.name)
        return true
      } else {
        return '/'
      }
    })
  } else {
    setTitle(to.name)
    return true
  }
})

export default router
