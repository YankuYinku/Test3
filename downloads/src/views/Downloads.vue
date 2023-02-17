<script setup lang="ts">
import { VcHeartSpinner, VcPaginate, VcItemsList } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import Filters from '@/components/filters/Filters.vue'
import DownloadItemTemplate from '@/views/partials/DownloadItemTemplate.vue'
import { useDownloadView } from '@/composables/download/downloads'
import { GET_DOWNLOADS } from '@/graphql/downloads.graphql'
import { DEFAULT_CATEGORY } from '@/constants'
import { computed, inject, onBeforeMount, ref } from 'vue'
import { UserLanguageInjectionKey } from '@/models/users/_injectionKeys'
import i18n from '@/i18n'
import { dispatchNavigationData } from '@apetito/portal-sdk-common'

const { t } = useI18n()
const languageCode = inject(UserLanguageInjectionKey, ref(i18n.global.locale.value))
const downloadsView = useDownloadView(
  GET_DOWNLOADS,
  DEFAULT_CATEGORY.DOWNLOADS,
  languageCode.value,
  response => {
    return response.data.downloads.items
  }
)
const { filters, onFilterChange, downloadModel, emptyDownloadsMessage, showPagination } =
  downloadsView
const loading = downloadsView.loading
const loadingSortiments = downloadsView.loadingSortiments
const loadingDownloads = downloadsView.loadingDownloads
const page = computed({
  get: () => downloadModel.value.download.queryParams.page,
  set: page => (downloadModel.value.download.queryParams.page = page),
})
const totalPages = computed(() => downloadModel.value.download.overallPages)

onBeforeMount(() => {
  dispatchNavigationData('@apetito/downloads')
})
</script>

<template>
  <div class="download-list__wrapper relative bg-background">
    <div v-if="loading" class="absolute bottom-0 top-0 isolate z-10 w-full">
      <VcHeartSpinner class="absolute bg-background bg-opacity-50" />
    </div>

    <div v-if="!loadingSortiments && !loadingDownloads">
      <div class="relative bg-background px-4">
        <Filters
          v-if="filters"
          class="sticky top-6 z-30"
          :filters="filters"
          :overall-results="downloadModel.download.overallItems"
          :loading="loading"
          @change="onFilterChange"
        ></Filters>

        <VcItemsList
          details-class="apps-downloads"
          :items="downloadModel.download.items"
          :loading="loading"
          :enable-details="false"
        >
          <template #empty v-if="!loading">
            {{ emptyDownloadsMessage }}
          </template>
          <template v-slot:item="{ item }">
            <DownloadItemTemplate :item="item"></DownloadItemTemplate>
          </template>
        </VcItemsList>

        <div
          v-if="showPagination"
          class="sticky bottom-0 z-20 -mx-4 mb-8 mt-4 flex justify-center bg-background py-2"
        >
          <VcPaginate v-model="page" :total="totalPages"></VcPaginate>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.download-list__wrapper {
  min-height: calc(100vh - var(--header-height));

  .vc-heart-spinner {
    > div {
      @apply top-96;
    }
  }
}
</style>
