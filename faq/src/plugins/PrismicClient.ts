import { App } from 'vue'
import * as prismic from '@prismicio/client'
import env from '@/utils/env'
import { PrismicClientKey } from '@/injectionKeys'

export default {
  install: (app: App) => {
    const repositoryName = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
    const endpoint = prismic.getRepositoryEndpoint(repositoryName)
    const client = prismic.createClient(endpoint)

    app.provide(PrismicClientKey, client)
  },
}
