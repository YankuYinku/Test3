<script lang="ts" setup>
import { useDateTimeFormatter } from '@/composables/useDateTime'
import { Order } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { useCurrencyFormat } from '@/utils/currency'

import { NormalizedCacheObject } from '@apollo/client/cache'
import { ApolloClient } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { defineProps, inject, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import OrderDetailsApetitoArticleList from './OrderDetailsApetitoArticleList.vue'

const store = useStore()

const { t } = useI18n()

const props = defineProps<{
  order: Order
}>()

const scrollAnchor = ref()

const { order } = toRefs(props)

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ'
const { toLocaleDate } = useDateTimeFormatter('de-DE')

function loadDetails() {
  scrollAnchor.value?.scrollTo({ top: 0 })
  store.loadApetitoOrderDetails(apiClients.default, props.order.id, [props.order.customerNumber])
}

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
      <!-- left TODO: Reactivate when customer data can be loaded -->
      <div class="hidden text-left text-sm">
        <h3 class="mb-2 text-lg font-bold">Testkunde-Kita-MP</h3>
        <p class="mb-2 text-gray-500">Bonifatiusstr. 305<br />48432 Rheine</p>
        <p class="mb-2 text-gray-500">
          Tel.: 05971 799-1802<br />
          Fax.: 05971 799-71802<br />
          E-Mail: Meinapetito.kitas@apetito.de
        </p>
      </div>

      <!-- left -->
      <div class="text-left text-sm">
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.customerNumber') }}:</div>
          <div>{{ store.apetitoOrderDetails?.header.customerNumber }}</div>
        </div>
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.goodsRecipient') }}:</div>
          <div>{{ store.apetitoOrderDetails?.header.deliveryToCustomerNumber }}</div>
        </div>
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.status') }}:</div>
          <div>
            {{
              store.apetitoOrderDetails?.header.exported === true
                ? t('tabs.orders.details.apetito.statusSuccess')
                : t('tabs.orders.details.apetito.statusFail')
            }}
          </div>
        </div>
      </div>

      <!-- right -->
      <div class="text-left text-sm">
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.orderDate') }}:</div>
          <div>{{ toLocaleDate(props.order.orderDate, dateFormat) }}</div>
        </div>
        <div class="flex">
          <div class="w-32 font-bold">{{ t('tabs.orders.details.general.deliveryDate') }}:</div>
          <div>{{ toLocaleDate(props.order.deliveryDate, dateFormat) }}</div>
        </div>
      </div>
    </section>

    <!-- Article list -->
    <section class="p-6">
      <OrderDetailsApetitoArticleList
        :sticky-table-header="true"
        :positions="store.apetitoOrderDetails?.positions ?? []"
      ></OrderDetailsApetitoArticleList>
      <div class="p-4 text-right text-lg font-bold">
        <span class="pr-4">{{ t('tabs.orders.details.general.totalAmount') }}:</span>
        {{ useCurrencyFormat(store.apetitoOrderDetails?.header.totalAmount) }}
      </div>
    </section>
  </div>
</template>
