<script setup lang="ts">
import CustomerSelect from './CustomerSelect.vue'
import { onMounted } from 'vue'
import { useCustomerChanged } from '@/composables/customer'
import { useStore } from '@/stores'

const store = useStore()
const { publishChanges } = useCustomerChanged(store)

/**
 * Select box event handler.
 * Sets the currently selected customer as active in state.
 * @param id
 */
function changeSelectedCustomer(id: number): void {
  store.changeSelectedCustomer(id)
  publishChanges()
}

onMounted(() => {
  publishChanges()
})
</script>

<template>
  <CustomerSelect
    :selected="store.activeCustomerOption"
    :customers="store.getCustomerSelectOptions"
    @selectedCustomerChanged="changeSelectedCustomer"
  ></CustomerSelect>
</template>
