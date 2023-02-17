import { ISortiment } from '@apetito/portal-sdk-common'
import { useStore } from '@/stores'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { getCurrentInstance, inject, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useEventBus, CustomerChangedActionPayload, Action } from '@apetito/portal-sdk-common'
import { getPrioritizedLanguageCode } from '@/utils/languageCode'

export const useFaqs = (): void => {
  // # DATA
  const store = useStore()
  const route = useRoute()
  let unsubscribeOnUnmount: (() => boolean) | null = null

  const apiClients = inject<{
    [key: string]: ApolloClient<NormalizedCacheObject>
  }>(ApolloClients, {})

  const queryVariables = reactive({
    sortiments: [] as string[],
    orderSystems: [] as string[],
    languageCode: '',
  })

  // # FUNCTIONS

  function requestFAQs(): void {
    if (apiClients && apiClients['apetito']) {
      store.getGroups(apiClients['apetito'], route, queryVariables)
    }
  }

  function mapToAssortmentCodes(assortment: ISortiment): string {
    return assortment.code
  }

  function updateQueryVariables(action: CustomerChangedActionPayload | undefined): void {
    if (action) {
      queryVariables.sortiments = action.sortiments?.map(mapToAssortmentCodes) ?? []
      queryVariables.orderSystems = action.effectiveOrderSystems ?? []
      queryVariables.languageCode = getPrioritizedLanguageCode(action.languageCodes)
      requestFAQs()
    }
  }

  // When customer is changed in user account app, adjust query params and request faqs
  function onCustomerChanged(event: Action<CustomerChangedActionPayload> | undefined): void {
    updateQueryVariables(event?.payload)
  }

  // # ACTION

  const { getEventBusPayload, subscribeEventBusAction } = useEventBus<CustomerChangedActionPayload>(
    '@apetito/user-account',
    getCurrentInstance()
  )

  // read data from user account app
  getEventBusPayload()
    .then(result => {
      if (result) {
        updateQueryVariables(result)
      }
    })
    .catch(() => {
      queryVariables.orderSystems = []
      queryVariables.sortiments = []
      queryVariables.languageCode = ''
    })

  // # Life Cycle

  onMounted(() => {
    // listen for customer change events
    unsubscribeOnUnmount = subscribeEventBusAction(onCustomerChanged)
  })

  onUnmounted(() => {
    // unregister from event bus actions
    unsubscribeOnUnmount && unsubscribeOnUnmount()
  })
}
