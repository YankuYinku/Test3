<script lang="ts" setup>
import { ref, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from 'ts-debounce'
import CustomIcon from '@/components/base/customIcon/CustomIcon.vue'
import { VcButtonPrimary } from '@apetito/components-ui-vue3'
import { DEFAULT_DEBOUNCE_TIME } from '@/constants'
import { useDownloadFile } from '@/composables/download/downloadManager'

const { t } = useI18n()

const props = defineProps<{
  downloadLink: string
  downloadDescription: string
  downloadFileType: string
}>()
const downloadFile = useDownloadFile(
  props.downloadLink,
  props.downloadDescription,
  props.downloadFileType
)
const count = ref(1)
const downloaded = ref(false)

const clearSuccessStatus = debounce(() => {
  count.value = 1
  downloaded.value = false
}, DEFAULT_DEBOUNCE_TIME)

const downloadButtonClick = async () => {
  downloaded.value = true
  await downloadFile()
  clearSuccessStatus()
}
</script>

<template>
  <div class="w-30 flex items-center" @click.prevent.stop>
    <vc-button-primary
      class="pointer-events-auto z-10 -ml-8"
      @click="downloadFile"
      :disabled="downloaded"
    >
      <div v-if="downloaded" class="flex items-center lg:px-5">
        <CustomIcon icon="download" />
        <span class="pl-2 lg:block">{{ t('downloadButton.downloaded') }}</span>
      </div>
      <div v-else class="flex items-center lg:px-5">
        <CustomIcon icon="download" />
        <span class="pl-2 lg:block">{{ t('downloadButton.download') }}</span>
      </div>
    </vc-button-primary>
  </div>
</template>
