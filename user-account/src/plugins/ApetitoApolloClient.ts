import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { App, readonly } from 'vue'
import { setContext } from 'apollo-link-context'
import {
  authentication,
  getBearerToken,
  getEventBusInstance,
  ICurrentUserData,
  appInsights,
} from '@apetito/portal-sdk-common'
import env from '@/utils/env'

export default {
  install: (app: App) => {
    const defaultHttpLink: ApolloLink = createHttpLink({
      uri: env.VUE_APP_MEINAPETITO_GRAPHQL_URI,
    })

    const getUserDataEventBusInstance =
      getEventBusInstance<ICurrentUserData>('@apetito/sspa-user-data')
    const { payload } = getUserDataEventBusInstance.getLastEvent() || {}

    const authLink = setContext(async (_, { headers }) => {
      const token = await authentication.getToken().catch((error: Error) => {
        appInsights.trackEvent({
          name: 'Login_User-Account_ApetitoApolloClient_GetToken',
          properties: {
            customerNumbers: payload?.customers,
            error: error,
          },
        })
      })
      const legacyToken = await getBearerToken()

      return {
        headers: {
          ...headers,
          Authorization: token ?? '',
          Accept: '*/*',
          'X-Apetito-Authorization': legacyToken ?? '',
        },
      }
    })

    const cache = new InMemoryCache()

    const defaultApolloClient = new ApolloClient({
      link: authLink.concat(defaultHttpLink as any) as any,
      cache,
    })

    app.provide(ApolloClients, {
      default: readonly(defaultApolloClient),
    })
  },
}
