<script lang="ts" setup>
import { defineEmits, ref, watch } from 'vue'
import { VcSelect } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import { OrderDateRange } from '@/models/order'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'change', value: OrderDateRange): void
}>()

const values = ref({ label: t('tabs.orders.filters.orderDate.thisMonth'), value: 'last 30 days' })

const items: { label: string; value: OrderDateRange | null }[] = [
  { label: t('tabs.orders.filters.orderDate.thisMonth'), value: 'last 30 days' },
  { label: t('tabs.orders.filters.orderDate.lastThreeMonth'), value: 'last 3 month' },
  { label: t('tabs.orders.filters.orderDate.lastSixMonth'), value: 'last 6 months' },
  { label: t('tabs.orders.filters.orderDate.thisYear'), value: 'this year' },
  { label: t('tabs.orders.filters.orderDate.lastYear'), value: 'last year' },
]

watch(values, (newValue, oldValue) => {
  if (newValue.value !== oldValue.value) {
    emit('change', newValue.value)
  }
})
</script>

<template>
  <vc-select
    v-model="values"
    return-object
    item-value="value"
    item-text="label"
    class="filter-button"
    :items="items"
  >
  </vc-select>
</template>

<style lang="scss" scoped>
.filter-button {
  &:not(.vc-select__open) {
    ::v-deep(button) {
      @apply bg-transparent;
    }
  }
}
</style>
