<script lang="ts" setup>
import OrderFilters from '@/components/base/order/OrderFilters.vue'
import SearchInput from '@/components/base/searchInput/SearchInput.vue'
import OrderList from '@/components/OrderList.vue'
import { useFeatureFlags } from '@/composables/featureFlag'
import { useStore } from '@/stores/order-store'
import { VcHeartSpinner, VcPaginate } from '@apetito/components-ui-vue3'
import { NormalizedCacheObject } from '@apollo/client/cache'
import { ApolloClient } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import {
  CustomerChangedActionPayload,
  dispatchNavigationData,
  useEventBus,
} from '@apetito/portal-sdk-common'
import { getCurrentInstance, inject, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { FeatureToggleComponent as feature } from 'vue-feature-toggle'
import { useI18n } from 'vue-i18n'

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const store = useStore()
const { t } = useI18n()

const featureName = 'apetito.meinapetito.portal.orderHistory'

const { key } = useFeatureFlags(feature, [featureName])

const { getEventBusPayload, subscribeEventBusAction } = useEventBus<CustomerChangedActionPayload>(
  '@apetito/user-account',
  getCurrentInstance()
)

getEventBusPayload().then(action => {
  store.setSelectedCustomer(action.customerNumbers ?? [])
  loadOrderList()
})

const unsubscribe = subscribeEventBusAction(action => {
  store.setSelectedCustomer(action?.payload.customerNumbers ?? [])
  loadOrderList()
})

function loadOrderList(): void {
  store.loadOrders(apiClients.default).then(() => {
    scrollToTop()
  })
}

function scrollToTop() {
  document.querySelector('.root-wrapper-inner')?.scrollTo({
    top: 0,
  })
}

// reload page when page number changes
watch(
  () => store.$state.currentPage,
  (value, oldValue) => {
    if (value !== oldValue) {
      loadOrderList()
    }
  }
)

// reload page when filters change
watch(
  () => store.currentFilters,
  () => {
    loadOrderList()
  },
  { deep: true }
)

onBeforeMount(() => {
  dispatchNavigationData('@apetito/user-account-details')
})

onBeforeUnmount(() => {
  unsubscribe && unsubscribe()
})

function onSearchTermChange(value: string) {
  store.currentFilters.searchTerm = value
}
</script>

<template>
  <feature :name="featureName" :key="key">
    <div class="order-list__wrapper relative">
      <div v-if="store.loading" class="spinner-wrapper absolute bottom-0 top-0 isolate z-30 w-full">
        <VcHeartSpinner class="absolute bg-background bg-opacity-50" />
      </div>
      <section class="relative">
        <div class="min-height flex flex-col gap-4">
          <header class="filters header sticky z-30 -mx-4 bg-background px-4">
            <!-- Filter section-->
            <div class="flex flex-row items-center justify-between gap-2">
              <OrderFilters></OrderFilters>
              <!-- We disable search feature until solution is developed on BE side -->
              <!-- <div class="w-80 min-w-32">
                <SearchInput
                  :value-prop="store.currentFilters.searchTerm"
                  :placeholder="t('tabs.orders.filters.searchPlaceholder')"
                  @change-search="onSearchTermChange"
                />
              </div> -->
            </div>
          </header>
          <!-- Order list-->
          <OrderList :groups="store.orderGroups"></OrderList>
          <div
            v-if="true"
            class="sticky bottom-0 z-20 -mx-4 mb-8 mt-4 flex justify-center bg-background py-2"
          >
            <VcPaginate v-model="store.currentPage" :total="store.totalPages"> </VcPaginate>
          </div>
        </div>
      </section>
    </div>
  </feature>
</template>

<style lang="scss" scoped>
.spinner-wrapper {
  min-height: calc(100vh - var(--header-height));

  :deep(.vc-heart-spinner) {
    > div {
      @apply top-96;
    }
  }
}

.filters {
  top: 8.125rem;
}

.min-height {
  min-height: 30rem;
}
</style>
