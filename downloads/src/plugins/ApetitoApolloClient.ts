import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { App, readonly } from 'vue'
import { setContext } from 'apollo-link-context'
import { authentication } from '@apetito/portal-sdk-common'
import { getBearerToken } from '@apetito/portal-sdk-common'
import env from '@/utils/env'
import { CLIENTS } from '@/constants/graphql'

export default {
  install: (app: App): void => {
    const defaultHttpLink: ApolloLink = createHttpLink({
      uri: env.VUE_APP_MEINAPETITO_GRAPHQL_URI,
    })

    const authLink = setContext(async (_, { headers }) => {
      const token = await authentication.getToken()
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
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    })

    app.provide(ApolloClients, {
      [CLIENTS.DEFAULT]: readonly(defaultApolloClient),
    })
  },
}
