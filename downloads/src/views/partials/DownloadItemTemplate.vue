<script setup lang="ts">
import { computed, defineProps, inject, toRefs } from 'vue'
import { IDownloadDetailModel } from '@/models/download.model'
import { useI18n } from 'vue-i18n'
import { DownloadModelInjectionKey } from '@/models/download/_injectionKeys'
import DownloadButton from '@/components/download/partials/DownloadButton.vue'
import Image from '@/components/download/partials/Image.vue'
import Text from '@/components/download/partials/Text.vue'
import DownloadInformation from '@/components/download/partials/DownloadInformation.vue'

const props = defineProps<{
  item: IDownloadDetailModel
}>()

const { item } = toRefs(props)

const { t } = useI18n()

const itemSortimentCode = computed(() => {
  const [sortimentData] = item.value?.sortiments || []
  return sortimentData?.code
})

const downloadModel = inject(DownloadModelInjectionKey)
</script>

<template>
  <div class="download">
    <Image :image-source="item.filePreview.url" />
    <Text :title="item.title" :description="item.description" />
    <DownloadInformation
      v-if="item.file?.sizeValue && item.file?.typeDescription"
      :file-size="item.file?.sizeValue"
      :file-type="item.file?.typeDescription"
    />
    <DownloadButton
      v-if="item.file?.url && item.file?.displayName && item.file?.type"
      :download-link="item.file?.url"
      :download-description="item.file?.displayName"
      :download-file-type="item.file?.type"
    />
  </div>
</template>

<style scoped lang="scss">
.download {
  @apply grid items-center gap-4;
  grid-template-columns: min-content 1fr 6rem min-content 2.5rem;
}

@media (min-width: 1280px) {
  .download {
    grid-template-columns: min-content 1fr 8rem 6rem min-content 2.5rem;
  }
}
</style>
