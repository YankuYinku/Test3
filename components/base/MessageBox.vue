<script lang="ts" setup>
import { MessageType } from '@/types/message';
import { computed, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  config: {
    type: MessageType
    text: string
  } | null
}>()

const styling = computed(() => {
  return props?.config?.type === 'error'
    ? 'bg-red-300 text-red-600'
    : ' bg-yellow-200 text-yellow-600'
})
</script>

<template>
  <div class="rounded-md p-4 text-sm" :class="styling">
    <h3 class="text-lg">{{ t('tabs.accounts.infos.title') }}</h3>
    <p>{{ t(props?.config?.text) }}</p>
  </div>
</template>
