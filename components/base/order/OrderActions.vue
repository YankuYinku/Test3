<script lang="ts" setup>
import { Order } from '@/models/order.js'
import { useStore } from '@/stores/order-store'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ApolloClients } from '@vue/apollo-composable'
import { computed } from '@vue/reactivity'
import { defineEmits, defineProps, inject } from 'vue'
import OrderDetailsAvailabilityModal from './OrderDetailsAvailabilityModal.vue'

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  (e: 'orderAction', value: OrderAction): void
}>()

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const store = useStore()

type OrderAction = 'print' | 'mail' | 'shop'

const actions: { icon: string; action: OrderAction; enabled: boolean }[] = [
  { icon: 'print', action: 'print', enabled: false },
  { icon: 'envelope', action: 'mail', enabled: false },
]

function onOpenPanel() {
  if (props.order.supplier === 'apetito') {
    store.loadApetitoOrderDetails(apiClients.default, props.order.id, [props.order.customerNumber])
  } else {
    store.loadHawaOrderDetails(apiClients.default, props.order.id, [props.order.customerNumber])
  }
}

function onConfirm(close: () => void) {
  if (props.order.supplier === 'apetito') {
    store.addItemsToBasket(apiClients.default).then(() => {
      if (close) {
        close()
      }
    })
  } else {
    store.addHawaArticlesToBasket(apiClients.default).then(() => {
      if (close) {
        close()
      }
    })
  }
}
</script>

<template>
  <div class="flex items-center gap-6" @click.prevent.stop>
    <template v-for="action in actions" :key="action.icon">
      <template v-if="action.enabled">
        <div class="group">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full p-2 text-warm-grey ring-1 ring-gray-100 group-hover:ring-primary"
            @click="emit('orderAction', action.action)"
          >
            <font-awesome-icon
              class="icon text-md group-hover:text-primary"
              :icon="['fal', action.icon]"
            />
          </div>
        </div>
      </template>
    </template>

    <!-- Shopping cart for re-order with availability pop-over -->
    <OrderDetailsAvailabilityModal
      :panel-position="'bottom-left'"
      @confirm="onConfirm"
    >
      <template #button>
        <div class="group" @click="onOpenPanel">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full p-2 text-warm-grey ring-1 ring-gray-100 group-hover:ring-primary"
          >
            <font-awesome-icon
              class="icon text-md group-hover:text-primary"
              :icon="['fal', 'shopping-cart']"
            />
          </div>
        </div>
      </template>
    </OrderDetailsAvailabilityModal>
  </div>
</template>
