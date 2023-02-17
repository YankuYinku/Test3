<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import { VcImg } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getApplicationStaticAssetPath } from '@apetito/portal-sdk-common'
import env from '@/utils/env'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  slice: any
}>()
const fallbackImage: string = getApplicationStaticAssetPath('img/fallback.png', 'faq', env.NODE_ENV)

const model = computed(() => {
  return props.slice.primary
})
</script>

<template>
  <div class="flex items-center gap-4 bg-white">
    <div class="h-full w-24 flex-shrink-0 bg-apetitoGray-light">
      <VcImg
        :width="96"
        :height="63"
        :src="model.faq_image?.preview?.url ?? '#'"
        :fallback-src="fallbackImage"
      ></VcImg>
    </div>
    <div class="text-sm uppercase text-light-grey">{{ t('Faq.FaqSlice.Question') }}</div>
    <div class="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold">
      {{ model.question[0].text }}
    </div>
    <div class="p-4 text-2xl text-light-grey">
      <font-awesome-icon :icon="['fal', 'angle-right']" class="icon" size="lg" />
    </div>
  </div>
</template>
