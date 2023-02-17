import './assets/styles/tailwind.css'
import { h, createApp } from 'vue'
import singleSpaVue from 'single-spa-vue'
import App from './App.vue'
import i18n from './i18n'
import env from '@/utils/env'
import { createPinia } from 'pinia'
import apetitoApolloClient from '@/plugins/ApetitoApolloClient'
import '@/plugins/icons'

if ([true, 'true'].includes(env.VUE_APP_INCLUDE_BASE_TAILWIND)) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ;(() => import(/* webpackChunkName: "tailwind.base" */ '@/assets/styles/tailwind.base.css'))()
}

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App)
    },
  },
  handleInstance(app) {
    app.use(createPinia())
    app.use(i18n)
    app.use(apetitoApolloClient)
  },
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
