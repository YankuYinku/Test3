<script lang="ts" setup>
import { Order } from '@/models/order'
import { computed, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()

const props = defineProps<{
  order: Order
}>()

const orderDate = computed(() => {
  return `${dayjs(props.order.orderDate).format('DD.MM.YYYY')} ${t('tabs.orders.atTime')} ${dayjs(
    props.order.orderDate
  ).format('HH:mm')}  `
})

const deliveryDate = computed(() => {
  return `${dayjs(props.order.deliveryDate).format('DD.MM.YYYY')} `
})
</script>

<template>
  <div class="whitespace-nowrap text-warm-grey">
    <div class="items-center gap-2 2xl:flex">
      <div class="font-bold">{{ t('tabs.orders.orderDate') }}:</div>
      <div>{{ orderDate }}</div>
    </div>
    <div class="items-center gap-2 2xl:flex">
      <div class="font-bold">{{ t('tabs.orders.deliveryDate') }}:</div>
      <div>{{ deliveryDate }}</div>
    </div>
  </div>
</template>
