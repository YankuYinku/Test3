import { App, readonly } from 'vue'
import BasketRoutes from './routes/Basket'
import { ApplicationAPI, MiniBasketApiKey } from '@/plugins/api/models'
import { createRoutesProxy } from '@apetito/sdk'

const routes = BasketRoutes()

export const rawApi: ApplicationAPI = {
  ...routes,
}

export const api: ApplicationAPI = createRoutesProxy(rawApi)

export default {
  install: (app: App) => {
    app.provide(MiniBasketApiKey, readonly(api))
  },
}
