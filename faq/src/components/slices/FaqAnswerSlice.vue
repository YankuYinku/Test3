<script lang="ts" setup>
import { PrismicImage, PrismicRichText } from '@prismicio/vue'
import { computed, defineProps } from 'vue'
import { VcPrismicRichTextWrapper } from '@apetito/components-ui-vue3'

const props = defineProps<{
  slice: any
}>()

const model = computed(() => {
  return props.slice.primary
})
</script>

<template>
  <div class="p-8 text-left">
    <VcPrismicRichTextWrapper>
      <PrismicRichText :field="model.question" class="mb-3 text-2xl"></PrismicRichText>
      <PrismicRichText :field="model.answer"></PrismicRichText>
    </VcPrismicRichTextWrapper>
    <PrismicImage :field="model.faq_image" />
  </div>
</template>
