<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  caption: string
  description: string
}>()
</script>

<template>
  <div class="mt-10 divide-y divide-gray-200">
    <div class="space-y-1">
      <h3 class="text-lg font-medium leading-6 text-gray-900">{{ caption }}</h3>
      <p class="max-w-2xl text-sm text-gray-500">
        {{ description }}
      </p>
    </div>
    <div class="mt-6">
      <dl class="divide-y divide-gray-200">
        <slot></slot>
      </dl>
    </div>
  </div>
</template>
