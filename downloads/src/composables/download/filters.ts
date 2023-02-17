import { DownloadModelType } from '@/composables/store'
import { Ref } from 'vue'
import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { useI18n } from 'vue-i18n'

export const useCommonFilters = <T>(
  downloadModel: Ref<DownloadModelType<T>>,
  currentFilters: Ref<Record<string, unknown> | null>
) => {
  const { t } = useI18n()

  const setFilter = (filter: { filterName: string; value: unknown }) => {
    switch (filter.filterName) {
      case 'category':
        downloadModel.value.download.queryParams.categories = filter.value as string[]
        downloadModel.value.download.queryParams.page = 1
        break
      case 'search':
        downloadModel.value.download.queryParams.search = filter.value as string
        downloadModel.value.download.queryParams.page = 1
    }
  }

  const onFilterChange = (filters: { filterName: string; value: unknown }[]) => {
    filters.forEach(filter => {
      setFilter(filter)
    })
  }

  const buildFilters = (defaultCategory: CategoriesSummarizationModel) => {
    currentFilters.value = {
      category: {
        value: downloadModel.value.download.queryParams.categories,
        defaultCategory,
        label: t('category.label'),
        categories: downloadModel.value.download.categoriesSummarization,
      },
      search: {
        value: downloadModel.value.download.queryParams.search,
      },
    }
  }

  return {
    setFilter,
    onFilterChange,
    buildFilters,
  }
}
