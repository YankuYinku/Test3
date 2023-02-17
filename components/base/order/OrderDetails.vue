<script lang="ts" setup>
import { Order } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { VcHeartSpinner } from '@apetito/components-ui-vue3'
import { defineProps, onUnmounted, toRefs } from 'vue'
import OrderDetailsApetito from './OrderDetailsApetito.vue'
import OrderDetailsHawa from './OrderDetailsHawa.vue'

const props = defineProps<{
  order: Order
}>()

const { order } = toRefs(props)

const store = useStore()

onUnmounted(() => {
  store.apetitoOrderDetails = null
  store.hawaOrderDetails = null
  store.articleAvailabilityChecked = false
  store.articleAvailability = []
})
</script>

<template>
  <VcHeartSpinner v-show="store.detailsLoading" class="z-99 absolute"></VcHeartSpinner>
  <OrderDetailsApetito v-if="order.supplier === 'apetito'" :order="order"></OrderDetailsApetito>
  <OrderDetailsHawa v-else :order="order"></OrderDetailsHawa>
  <slot name="details:bottom:action" :item="order"></slot>
</template>
