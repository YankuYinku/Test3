<script lang="ts" setup>
import { defineProps } from 'vue'
import { PrismicRichText } from '@prismicio/vue'
import { VcPrismicRichTextWrapper, VcButtonLink } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  title?: []
  text?: []
}>()

const openCookieBannerSettings = () => {
  const usercentrics = window ? window.UC_UI! : null
  if (usercentrics) usercentrics?.showSecondLayer()
}
</script>

<template>
  <div class="p-6 text-gray-900">
    <prismic-rich-text text-start class="text-xl font-bold" :field="props.title!">
    </prismic-rich-text>
    <p class="mt-2 text-gray-700">
      <VcPrismicRichTextWrapper>
        <prismic-rich-text :field="props.text!"> </prismic-rich-text>
      </VcPrismicRichTextWrapper>
    </p>
    <p class="mt-4">
      <vc-button-link class="cursor-pointer" @click.prevent="openCookieBannerSettings()">
        {{ t('cookieBanner.link') }}
      </vc-button-link>
    </p>
  </div>
</template>
