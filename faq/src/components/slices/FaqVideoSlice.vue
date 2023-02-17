<script lang="ts" setup>
import { computed, defineProps, inject } from 'vue'
import { VcImg } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { GlobalVideoPlayerKey } from '@/injectionKeys'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  slice: any
}>()

const { t } = useI18n()

// get reference to global video player function
const openVideo = inject(GlobalVideoPlayerKey)

const model = computed(() => ({
  video: props.slice?.primary?.video,
  teaser: props.slice?.primary?.video_teaser[0]?.text,
  length: props.slice?.primary?.video_length,
}))

</script>

<template>
  <div class="flex items-center gap-4 bg-white">
    <div class="h-full w-24 flex-shrink-0 bg-apetitoGray-light">
      <VcImg :src="model.video?.thumbnail_url" :width="96" :height="63"></VcImg>
    </div>
    <div class="text-sm uppercase text-light-grey">{{ t('Faq.FaqVideoSlice.Video') }}</div>
    <div class="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold">
      {{ model.teaser }}
    </div>
    <div class="text-xl">
      {{ model.length }}
      <span class="text-sm text-light-grey">{{ t('Faq.FaqVideoSlice.Minutes') }}</span>
    </div>
    <div class="p-4 text-2xl text-light-grey">
      <font-awesome-icon
        @click.stop="
          openVideo && openVideo(model.video.html, model.video.width, model.video.height)
        "
        :icon="['fas', 'caret-circle-right']"
        class="icon text-primary-dark"
        size="sm"
      />
    </div>
  </div>
</template>
