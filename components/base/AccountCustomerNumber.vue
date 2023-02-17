<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  item: number
  highlighted: boolean
}>()
</script>

<template>
  <div class="relative rounded-full bg-beige-500 px-2" :class="{ 'opacity-70': !highlighted }">
    <span class="translate-y-1 text-xs" :class="{ 'font-bold': highlighted }">{{ item }}</span>
  </div>
</template>
