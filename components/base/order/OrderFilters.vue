<script lang="ts" setup>
import { OrderDateRange } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderFilterOrderDate from './OrderFilterOrderDate.vue'
import OrderFilterOrderStatus from './OrderFilterOrderStatus.vue'
import OrderFilterOrderType from './OrderFilterOrderType.vue'

const store = useStore()
const { t } = useI18n()

function onOrderTypeFilterChange(value: string | null) {
  store.setOrderTypeFilter(value)
}

function onOrderDateRangeFilterChange(value: OrderDateRange | null) {
  store.setOrderDateRangeFilter(value)
}

function onOrderStatusFilterChange(value: boolean | null) {
  store.setOrderStatusFilter(value)
}

const orderLabel = computed(() => {
  return t('tabs.orders.filters.ordersCountLabel')
})
</script>

<template>
  <div class="mt-3 flex items-center gap-1 rounded border border-apetitoGray px-1">
    <order-filter-order-type @change="onOrderTypeFilterChange"></order-filter-order-type>
    <span
      class="inline-flex items-center justify-center whitespace-nowrap rounded bg-main px-2.5 py-0.5 text-center text-sm text-white"
    >
      {{ store.totalItems }} {{ orderLabel }}
    </span>
    <span class="my-2 mx-3 h-6 w-px bg-background"></span>
    <order-filter-order-date @change="onOrderDateRangeFilterChange"></order-filter-order-date>
    <order-filter-order-status @change="onOrderStatusFilterChange"></order-filter-order-status>
  </div>
</template>
