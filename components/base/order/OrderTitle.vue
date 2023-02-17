<script lang="ts" setup>
import { Order } from '@/models/order'
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  order: Order
}>()
</script>

<template>
  <div class="items-center gap-2 font-bold 2xl:flex">
    <span v-if="order.name">{{ order.name }}</span>
    <template v-else>
      <div>{{ t('tabs.orders.customerNumber') }}:</div>
      <div>{{ order.customerNumber }}</div>
    </template>
  </div>
</template>
