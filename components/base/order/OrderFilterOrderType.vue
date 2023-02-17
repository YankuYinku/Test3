<script lang="ts" setup>
import { useStore } from '@/stores/order-store'
import { VcSelect } from '@apetito/components-ui-vue3'
import { computed } from '@vue/reactivity'
import { defineEmits, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const store = useStore()

const emit = defineEmits<{
  (e: 'change', value: string | null): void
}>()

const items = computed(() => {
  const allTypes = {
    label: t('tabs.orders.filters.orderType.allTypes'),
    value: null,
    amount: store.totalItemsInAllCategories,
  }

  const options = store.suppliers.map(supplier => ({
    label: supplier.supplier,
    value: supplier.supplier,
    amount: supplier.amount,
  }))

  return [allTypes, ...options]
})

const values = ref(items.value[0])

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
    :loading="store.loading"
  >
    <template #item:append="{ item, selected }">
      <span class="rounded bg-background px-1" :class="[selected && 'text-black']">
        {{ item.amount }}
      </span>
    </template>
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
