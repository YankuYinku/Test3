<script lang="ts" setup>
import { useVideoEmbed } from '@/composables/videoEmbed'
import { PrismicRichText } from '@prismicio/vue'
import { computed, defineProps, ref } from 'vue'

const props = defineProps<{
  slice: any
}>()

const container = ref<HTMLElement>()

const model = computed(() => ({
  teaser: props.slice?.primary?.video_teaser,
  description: props.slice?.primary?.faq_video_fulltext,
  video: props.slice?.primary?.video,
}))

const videoEmbed = useVideoEmbed(
  container,
  model.value.video.width,
  model.value.video.height,
  model.value.video.html
)
</script>

<template>
  <div class="flex flex-col gap-6 p-8 text-left">
    <PrismicRichText :field="model.teaser" class="text-2xl"></PrismicRichText>
    <div ref="container" v-html="videoEmbed"></div>
    <PrismicRichText :field="model.description" class="text-md"></PrismicRichText>
  </div>
</template>
