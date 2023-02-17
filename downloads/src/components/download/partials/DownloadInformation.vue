<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { defineProps } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  fileSize: string
  fileType: string
}>()
</script>

<template>
  <div class="hidden flex-col justify-self-end text-right lg:flex">
    <div class="items-center justify-end lg:flex">
      <div class="text-s mr-2 w-40 text-gray-500">
        {{ t(`fileTypes.${props.fileType.toLowerCase()}`) }}
      </div>
      <div class="text-s mr-8 justify-self-end whitespace-nowrap font-bold text-gray-500">
        {{ fileSize }}
      </div>
    </div>
  </div>
</template>
