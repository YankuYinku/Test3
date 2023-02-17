import { createRoutesProxy } from '@apetito/sdk'
import { App } from 'vue'
import RootCompanyRoutes from './routes/rootCompany.routes'
import { IRootCompanyApiRoutes, IRootCompanyKey } from './models/IRootCompanyApi.model'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  authentication,
  appInsights,
  ICurrentUserData,
  getEventBusInstance,
} from '@apetito/portal-sdk-common'

export default {
  install: async (app: App, _: unknown) => {
    const getUserDataEventBusInstance =
      getEventBusInstance<ICurrentUserData>('@apetito/sspa-user-data')
    const { payload } = getUserDataEventBusInstance.getLastEvent() || {}

    const apiRoutes = new Promise<IRootCompanyApiRoutes>((resolve, reject) => {
      return authentication
        .getToken()
        .catch((error: Error) => {
          appInsights.trackEvent({
            name: 'Login_User-Account-Details_Plugins_API_GetToken',
            properties: {
              customerNumbers: payload?.customers,
              error: error,
            },
          })
        })
        .then((token: string) => {
          const rootCompanyRoutes = RootCompanyRoutes(token)
          const rootCompanyApi = createRoutesProxy(rootCompanyRoutes)
          resolve(rootCompanyApi)
        })
        .catch(() => reject('Could not provice token'))
    })
    app.provide(IRootCompanyKey, apiRoutes)
  },
}
