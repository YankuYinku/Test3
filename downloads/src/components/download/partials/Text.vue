<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col justify-center">
    <div class="text-lg font-bold text-gray-800 line-clamp-2">{{ props.title }}</div>
    <div class="text-gray-500 line-clamp-2">
      {{ props.description }}
    </div>
  </div>
</template>
