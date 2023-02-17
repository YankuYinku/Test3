<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  caption: string
}>()

defineEmits<{
  (e: 'edit:click'): void
}>()
</script>

<template>
  <div class="py-4 sm:grid sm:grid-cols-3 sm:py-5">
    <dt class="text-sm font-medium text-gray-500">
      <p>{{ caption }}</p>
    </dt>
    <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
      <span class="flex-grow">
        <slot></slot>
      </span>
      <span class="ml-4 flex-shrink-0">
        <slot name="actions"></slot>
      </span>
    </dd>
  </div>
</template>
