import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { App, readonly } from 'vue'

import { PrismicLink } from 'apollo-link-prismic'
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

    const cache = new InMemoryCache()

    const apetitoApolloClient = new ApolloClient({
      link: httpLink,
      cache,
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
      apetito: readonly(apetitoApolloClient)
    })
  },
}
