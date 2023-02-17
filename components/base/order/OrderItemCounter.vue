<script lang="ts" setup>
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  numberOfOrderItems: number
}>()
</script>

<template>
  <div class="flex items-center">
    <span class="text-right text-3xl font-bold">{{ props.numberOfOrderItems }}</span>
    <span class="pl-2 text-xs text-warm-grey">{{ t('tabs.orders.products') }}</span>
  </div>
</template>
