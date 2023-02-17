<script lang="ts" setup>
import { useCurrencyFormat } from '@/utils/currency'
import { defineProps } from 'vue'

const props = defineProps<{
  amount: number
}>()
</script>

<template>
  <div class="relative text-primary-500">
    <span class="text-3xl font-bold">{{ useCurrencyFormat(props.amount) }}</span>
    <span class="absolute text-sm">*</span>
  </div>
</template>
