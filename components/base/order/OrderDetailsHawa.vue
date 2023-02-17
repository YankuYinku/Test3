<script lang="ts" setup>
import { useDateTimeFormatter } from '@/composables/useDateTime'
import { Order } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { useCurrencyFormat } from '@/utils/currency'
import { NormalizedCacheObject } from '@apollo/client/cache'
import { ApolloClient } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { computed, defineProps, inject, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import OrderDetailsHawaArticleList from './OrderDetailsHawaArticleList.vue'

const store = useStore()
const { t } = useI18n()

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const props = defineProps<{
  order: Order
}>()

const scrollAnchor = ref()

const { order } = toRefs(props)

const details = computed(() => store.hawaOrderDetails)
const hadFailedOrderPositions = computed(() => store.hawaOrderDetails?.failedOrderPositions?.length)

const orderStatus = computed(() => {
  switch (props.order.status) {
    case 'Failed':
      return t('tabs.orders.status.failed')
    case 'InProgress':
      return t('tabs.orders.status.inProgress')
    case 'Succeeded':
      return t('tabs.orders.status.succeeded')
    case 'SucceededPartially':
      return t('tabs.orders.status.succeededPartially')
    default:
      return t('tabs.orders.status.unknown')
  }
})

function loadDetails() {
  scrollAnchor.value?.scrollTo({ top: 0 })
  store.loadHawaOrderDetails(apiClients.default, order.value.id, [order.value.customerNumber])
}

const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ'
const { toLocaleDate } = useDateTimeFormatter('de-DE')

onMounted(() => {
  loadDetails()
})

watch(order, () => {
  loadDetails()
})
</script>


<template>
  <div ref="scrollAnchor" class="overflow-y-auto pb-16">
    <!-- Order details -->
    <section class="sticky top-0 z-20 flex flex-row gap-16 bg-background p-8">
      <!-- left -->
      <div class="text-left text-sm">
        <h3 class="mb-2 text-lg font-bold">{{ details?.supplier.name }}</h3>
        <p class="mb-2 text-gray-500">
          {{ details?.supplier.street }}<br />{{ details?.supplier.zip }}
          {{ details?.supplier.city }}
        </p>
      </div>

      <!-- right -->
      <div class="mt-2 text-left text-sm">
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.orderDate') }}:</div>
          <div>{{ toLocaleDate(details?.orderDate, dateFormat) }}</div>
        </div>
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.deliveryDate') }}:</div>
          <div>{{ toLocaleDate(details?.deliveryDate, dateFormat) }}</div>
        </div>
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.status') }}:</div>
          <div>{{ orderStatus }}</div>
        </div>
      </div>
    </section>

    <!-- Article list -->
    <section class="p-4">
      <OrderDetailsHawaArticleList
        :order-positions="details?.orderPositions"
        :has-availability-column="true"
        :sticky-table-header="true"
      ></OrderDetailsHawaArticleList>
      <div class="p-4 text-right font-bold">
        <span class="pr-4">{{ t('tabs.orders.details.hawa.table.netto') }}:</span>
        {{ useCurrencyFormat(details?.totals.totalNetPrice) }}
      </div>
      <hr class="border-b-1 float-right h-px w-1/3 border-0" />
      <div class="p-4 text-right font-bold">
        <span class="pr-4">{{ t('tabs.orders.details.hawa.table.brutto') }}:</span>
        {{ useCurrencyFormat(details?.totals.totalGrossPrice) }}
      </div>
    </section>

    <!-- Not valid articles -->
    <section v-if="hadFailedOrderPositions" class="px-6">
      <h2 class="p-4 text-left font-bold">
        {{ t('tabs.orders.details.general.invalidPositions') }}
      </h2>
      <OrderDetailsHawaArticleList
        :order-positions="details?.failedOrderPositions"
      ></OrderDetailsHawaArticleList>
    </section>
  </div>
</template>


<style lang="scss" scoped>
@import 'table-style.scss';

.sticky-table-header {
  top: 9.25rem;
}
.sticky-table-header-invalid {
  top: 9.25rem;
}
</style>
