import './assets/styles/tailwind.css'
import '@/plugins/icons'
import { h, createApp } from 'vue'
import singleSpaVue from 'single-spa-vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import env from '@/utils/env'

if ([true, 'true'].includes(env.VUE_APP_INCLUDE_BASE_TAILWIND)) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ;(() => import(/* webpackChunkName: "tailwind.base" */ '@/assets/styles/tailwind.base.css'))()
}

const vueLifecycles = singleSpaVue({
  createApp: createApp,
  appOptions: {
    render() {
      return h(App, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        applications: this.applications,
      })
    },
  },

  handleInstance(app) {
    app.use(router)
    app.use(i18n)
    app.use(createPinia())
  },
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
