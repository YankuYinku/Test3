<script lang="ts" setup>
import OrderDetailsBottomActions from '@/components/base/order/OrderDetailsBottomActions.vue'
import { Order, OrderGroup } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { VcItemsList } from '@apetito/components-ui-vue3'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { defineProps, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetails from './base/order/OrderDetails.vue'
import OrderListItem from './base/OrderListItem.vue'

defineProps<{
  groups: OrderGroup[]
}>()

const { t } = useI18n()

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const store = useStore()

const emptyResultMessage = t('tabs.orders.emptyResultMessage')

function reOrder(order: Order, closeModalFunction: () => void) {
  if (order.supplier === 'apetito') {
    store.addItemsToBasket(apiClients.default).then(() => {
      if (closeModalFunction) {
        closeModalFunction()
      }
    })
  } else {
    store.addHawaArticlesToBasket(apiClients.default).then(() => {
      if (closeModalFunction) {
       closeModalFunction()
      }
    })
  }
}
</script>

<template>
  <VcItemsList
    details-class="apps-user-account-details"
    auto-scroll
    :items="groups"
    :useGroups="true"
    :enableDetails="true"
    :showNextAndPrev="true"
  >
    <template #empty v-if="!store.loading">
      {{ emptyResultMessage }}
    </template>
    <template v-slot:item="{ item }"> <OrderListItem :order="item"></OrderListItem></template>
    <template #group:header="{ group, index }">
      <h3 class="text-xl text-warm-grey" :class="{ 'mt-8': index !== 0 }">{{ group.title }}</h3>
    </template>
    <template #modal:content="{ item, closeModal }">
      <OrderDetails :order="item">
        <template #details:bottom:action="{ item }"
          ><OrderDetailsBottomActions
            :order="item"
            @reorder="reOrder(item, closeModal)"
          ></OrderDetailsBottomActions
        ></template>
      </OrderDetails>
    </template>
  </VcItemsList>
</template>
