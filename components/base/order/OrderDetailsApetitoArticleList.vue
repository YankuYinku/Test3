<script lang="ts" setup>
import { ApetitoOrderPosition } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetailsArticleAvailability from './OrderDetailsArticleAvailability.vue'

const store = useStore()

const props = defineProps<{
  positions: ApetitoOrderPosition[]
  stickyTableHeader?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <table class="article-list bg-white">
    <thead :class="{ 'sticky-table-header': props.stickyTableHeader }">
      <tr class="border-b-1 bg-white">
        <th class="whitespace-nowrap text-left">
          {{ t('tabs.orders.details.apetito.table.articleNumber') }}
        </th>
        <th class="text-left">{{ t('tabs.orders.details.apetito.table.title') }}</th>
        <th class="text-right">{{ t('tabs.orders.details.apetito.table.amount') }}</th>
        <th class="text-right">{{ t('tabs.orders.details.apetito.table.quantity') }}</th>
        <th class="text-center">{{ t('tabs.orders.details.apetito.table.available') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(position, index) in props.positions"
        class="text-sm"
        :key="position.id"
        :class="{ 'border-b-1': index === props.positions?.length - 1 }"
      >
        <td class="text-right">{{ position.articleId }}</td>
        <td class="text-left">{{ position.title }}</td>
        <td class="text-right">{{ position.amount }}</td>
        <td class="text-right">{{ position.quantity }}</td>
        <td class="text-center">
          <OrderDetailsArticleAvailability
            :article-availability="store.isArticleAvailable(position.articleId)"
          ></OrderDetailsArticleAvailability>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
@import 'table-style.scss';

.sticky-table-header {
  position: sticky;
  top: 7.75rem;
}
</style>
