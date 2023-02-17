<script lang="ts" setup>
import { defineProps } from 'vue'
import { VcImg } from '@apetito/components-ui-vue3'

const props = defineProps<{
  imageSource: string
}>()
</script>

<template>
  <div class="h-20 w-28 flex-shrink-0">
    <VcImg width="28" height="20" :src="props.imageSource" />
  </div>
</template>
