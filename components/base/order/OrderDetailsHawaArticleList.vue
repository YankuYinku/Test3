<script setup lang="ts">
import { HawaOrderPosition } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { defineProps, withDefaults } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetailsArticleAvailability from './OrderDetailsArticleAvailability.vue'

const { t } = useI18n()
const store = useStore()

const props = withDefaults(
  defineProps<{
    orderPositions: HawaOrderPosition[]
    hasAvailabilityColumn?: boolean
    stickyTableHeader?: boolean
  }>(),
  {
    orderPositions: () => [],
    hasAvailabilityColumn: false,
    stickyTableHeader: false,
  }
)
</script>

<template>
  <table class="article-list bg-white">
    <thead :class="{ 'sticky-table-header': props.stickyTableHeader }">
      <tr class="border-b-1 bg-white">
        <th class="text-right">{{ t('tabs.orders.details.hawa.table.articleNumber') }}</th>
        <th class="text-left">{{ t('tabs.orders.details.hawa.table.description') }}</th>
        <th class="text-left">{{ t('tabs.orders.details.hawa.table.amount') }}</th>
        <th class="text-right">{{ t('tabs.orders.details.hawa.table.price') }}</th>
        <th class="text-right">{{ t('tabs.orders.details.hawa.table.positionSum') }}</th>
        <th v-if="props.hasAvailabilityColumn" class="text-right">
          {{ t('tabs.orders.details.hawa.table.available') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(position, index) in props.orderPositions"
        class="text-sm"
        :key="position.articleId"
        :class="{ 'border-b-1': index === props.orderPositions?.length - 1 }"
      >
        <td class="text-right whitespace-nowrap">{{ position.articleNumber }}</td>
        <td class="text-left">{{ position.description }}</td>
        <td class="text-right">{{ position.quantity }}</td>
        <td class="text-right">{{ position.priceGross }}</td>
        <td class="text-right">{{ position.positionGrossPrice }}</td>
        <td v-if="props.hasAvailabilityColumn" class="text-center">
          <OrderDetailsArticleAvailability
            :article-availability="store.isArticleAvailable(position.articleNumber.toString())"
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
  top: 9.25rem;
}
</style>
