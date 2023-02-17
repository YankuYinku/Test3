<script lang="ts" setup>
import { defineEmits, ref, watch } from 'vue'
import { VcSelect } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import { StatusCodes } from '@/models/order.js'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'change', value: boolean): void
}>()

const values = ref({ label: t('tabs.orders.filters.orderStatus.allStatus'), value: null })

const items: { label: string; value: StatusCodes | null }[] = [
  { label: t('tabs.orders.filters.orderStatus.allStatus'), value: null },
  { label: t('tabs.orders.filters.orderStatus.succeeded'), value: 'Succeeded' },
  { label: t('tabs.orders.filters.orderStatus.succeededPartially'), value: 'SucceededPartially' },
  { label: t('tabs.orders.filters.orderStatus.inProgress'), value: 'InProgress' },
  { label: t('tabs.orders.filters.orderStatus.failed'), value: 'Failed' },
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
