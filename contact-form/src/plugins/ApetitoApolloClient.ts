import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { App, readonly } from 'vue'

import { PrismicLink } from 'apollo-link-prismic'
import env from '../utils/env'
import { authentication, getBearerToken } from '@apetito/portal-sdk-common'
import { setContext } from '@apollo/client/link/context'

interface PrismicApolloClientOptions {
  uri: string
  accessToken?: string
}

export default {
  install: (app: App): void => {
    // HTTP connection to the API
    const httpLink = createHttpLink({
      // You should use an absolute URL here
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

    // Cache implementation
    const cache = new InMemoryCache()

    // Create the apollo client
    const apetitoApolloClient = new ApolloClient({
      link: authLink.concat(httpLink as any) as any,
      cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
      },
    })

    const prismicRepository = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
    const prismicRepositoryUrl = `https://${prismicRepository}.cdn.prismic.io/graphql`

    const prismicOptions: PrismicApolloClientOptions = {
      uri: prismicRepositoryUrl,
      //TODO: Klären ob Public oder Private mit Key
      //accessToken: env.VUE_APP_PRISMIC_ACCESS_TOKEN ?? '',
    }

    // Create the apollo client
    const prismicApolloClient = new ApolloClient({
      link: PrismicLink({
        ...prismicOptions,
      }),
      cache,
    })

    const mockApolloClient = new ApolloClient({
      link: createHttpLink({
        uri: 'http://localhost:4001/api/v1/graphql',
      }),
      cache,
    })

    app.provide(ApolloClients, {
      default: readonly(apetitoApolloClient),
      prismic: readonly(prismicApolloClient),
      apetito: readonly(apetitoApolloClient),
      mock: readonly(mockApolloClient),
    })
  },
}
