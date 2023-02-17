<script lang="ts" setup>
import { Order } from '@/models/order'
import { computed, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  order: Order
}>()

const label = computed(() => {
  switch (props.order?.status) {
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

const color = computed(() => {
  switch (props.order?.status) {
    case 'Failed':
      return '#c13b3b'
    case 'InProgress':
      return '#6a99e7'
    case 'Succeeded':
      return '#36772f'
    case 'SucceededPartially':
      return '#aac13b'
    default:
      return '#d4ddd3'
  }
})
</script>

<template>
  <div
    class="status flex h-6 w-6 items-center rounded-full p-2 text-sm font-bold uppercase text-white xl:h-auto xl:w-auto xl:rounded-md"
  >
    <div class="hidden xl:block">{{ label }}</div>
  </div>
</template>

<style lang="scss" scoped>
.status {
  background-color: v-bind(color);
}
</style>
