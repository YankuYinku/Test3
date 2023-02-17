<script lang="ts" setup>
import { defineProps } from 'vue'
import { PrismicRichText } from '@prismicio/vue'
import PrivacyPolicyCollapsible from './PrivacyPolicyCollapsible.vue'
import { VcPrismicRichTextWrapper } from '@apetito/components-ui-vue3'

const props = defineProps({
  slice: Object,
})
</script>

<template>
  <div class="p-6 text-gray-900">
    <VcPrismicRichTextWrapper>
      <prismic-rich-text
        text-start
        class="text-xl font-bold"
        :field="props.slice?.primary?.block_title"
      >
      </prismic-rich-text>
    </VcPrismicRichTextWrapper>
    <p class="mt-2 text-base text-gray-700">
      <VcPrismicRichTextWrapper>
        <prismic-rich-text :field="props.slice?.primary?.block_description"></prismic-rich-text>
      </VcPrismicRichTextWrapper>
    </p>
    <PrivacyPolicyCollapsible
      v-for="(item, index) in props.slice?.items"
      :key="index"
      :item="item"
    ></PrivacyPolicyCollapsible>
  </div>
</template>
