<script lang="ts" setup>
import { defineSliceZoneComponents, SliceLike, SliceZone } from '@prismicio/vue'
import { defineProps, ref, toRefs, watch } from 'vue'
import FaqAnswerSlice from './slices/FaqAnswerSlice.vue'
import FaqVideoAnswerSlice from './slices/FaqVideoAnswerSlice.vue'

const props = defineProps<{
  item: SliceLike
}>()
const { item } = toRefs(props)

const slices = ref<SliceLike[]>([item.value])

const sliceComponents = defineSliceZoneComponents({
  faq: FaqAnswerSlice,
  faq_video: FaqVideoAnswerSlice,
})

watch(item, newItem => {
  slices.value = [newItem]
})
</script>

<template>
  <div class="faq-modal-text">
    <SliceZone :components="sliceComponents" :slices="slices" />
  </div>
</template>

<style lang="scss">
.faq-modal-text {
  p {
    @apply mb-4;
  }

  ul,
  ol {
    @apply ml-5;
    @apply mb-3;
  }
}
</style>
