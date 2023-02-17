<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import AccountCustomerNumber from './AccountCustomerNumber.vue'

const props = defineProps<{
  customerNumbers: number[]
  highlightedNumber?: number
}>()

const maxNumberShown = 3

const additionalNumberCount = computed(() => {
  if (props.customerNumbers?.length > maxNumberShown) {
    return `+${props.customerNumbers.length - maxNumberShown}`
  }
  return null
})

const numbersToShow = computed(() => {
  const copy = [...props.customerNumbers]
  return (
    copy
      // bring the customer number, which is being edited right now,  to front of list
      .sort((a: number) => {
        return a === props.highlightedNumber ? -1 : 0
      })
      // ... and only show a subset
      ?.filter((_, index) => index < maxNumberShown)
  )
})

function isHighlighted(customerNumber: number, currentCustomerNumber: number | undefined) {
  return customerNumber === currentCustomerNumber
}
</script>

<template>
  <div class="relative flex flex-wrap items-center gap-2">
    <template v-for="customerNumber in numbersToShow" :key="customerNumber">
      <AccountCustomerNumber
        :item="customerNumber"
        :highlighted="isHighlighted(customerNumber, props.highlightedNumber)"
      >
      </AccountCustomerNumber>
    </template>
    <div
      v-if="additionalNumberCount"
      class="rounded-full px-2 text-xs text-gray-500 ring-1 ring-apetitoGray"
    >
      {{ additionalNumberCount }}
    </div>
  </div>
</template>
