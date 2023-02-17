import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { App, readonly } from 'vue'

import { PrismicLink } from 'apollo-link-prismic'
import { setContext } from 'apollo-link-context'
import {
  authentication,
  appInsights,
  ICurrentUserData,
  getEventBusInstance,
} from '@apetito/portal-sdk-common'
import env from '../utils/env'

interface PrismicApolloClientOptions {
  uri: string
  accessToken?: string
}

export default {
  install: (app: App, options: unknown) => {
    const httpLink = createHttpLink({
      // You should use an absolute URL here
      uri: env.VUE_APP_MEINAPETITO_GRAPHQL_URI,
    })

    const getUserDataEventBusInstance =
      getEventBusInstance<ICurrentUserData>('@apetito/sspa-user-data')
    const { payload } = getUserDataEventBusInstance.getLastEvent() || {}

    const authLink = setContext(async (_, { headers }) => {
      const token = await authentication.getToken().catch((error: Error) => {
        appInsights.trackEvent({
          name: 'Login_User-Account-Details_ApetitoApolloClient_GetToken',
          properties: {
            customerNumbers: payload?.customers,
            error: error,
          },
        })
      })

      return {
        headers: {
          ...headers,
          Authorization: token ?? '',
          Accept: '*/*',
        },
      }
    })

    const cache = new InMemoryCache()

    const apetitoApolloClient = new ApolloClient({
      link: authLink.concat(httpLink as any) as any,
      cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    })

    const prismicRepository = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
    const prismicRepositoryUrl = `https://${prismicRepository}.cdn.prismic.io/graphql`

    const prismicOptions: PrismicApolloClientOptions = {
      uri: prismicRepositoryUrl,
    }

    const prismicApolloClient = new ApolloClient({
      link: PrismicLink({
        ...prismicOptions,
      }),
      cache,
    })

    app.provide(ApolloClients, {
      default: readonly(apetitoApolloClient),
      prismic: readonly(prismicApolloClient),
      apetito: readonly(apetitoApolloClient),
    })
  },
}
