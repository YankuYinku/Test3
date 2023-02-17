<script lang="ts" setup>
import { defineEmits, defineProps, ref, Ref, toRefs } from 'vue'
import SearchInput from '@/components/base/searchInput/SearchInput.vue'
import CategoryFilter from '@/components/filters/categories/CategoryFilter.vue'
import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { debounce } from 'ts-debounce'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  loading: boolean
  overallResults: number
  filters: {
    category?: {
      value: string[]
      categories: CategoriesSummarizationModel[]
      label: string
      defaultCategory: CategoriesSummarizationModel
    }
    search?: {
      value: Ref<string>
    }
  }
}>()

type Filter = {
  filterName: string
  value: unknown
}

const emit = defineEmits<{
  (e: 'change', value: Filter[]): void
}>()

const { loading, filters, overallResults } = toRefs(props)

// For the future use, we will collect all the filter changes made recently.
// That way, if the user manages to change different filters within given
// amount of time, only one request with all the filters updated will be
// fired to get fresh data.
let filterChanges: Filter[] = []
const DEBOUNCE_TIMEOUT = 500

const emitChange = debounce(() => {
  emit('change', filterChanges)

  // After emitting the changes we want to reset the collection of previously changed filters
  filterChanges = []
}, DEBOUNCE_TIMEOUT)

const addFilterChange = (filter: Filter) => {
  // There is no need have multiple filters stored with the same filterName. We only need the newest one.
  filterChanges = filterChanges.filter(
    existingFilter => existingFilter.filterName !== filter.filterName
  )
  filterChanges.push(filter)

  // This will be debounced
  emitChange()
}
const search = ref('')
const onSearch = (value: string) => {
  addFilterChange({
    filterName: 'search',
    value: value.trim(),
  })
}

const onCategoriesChange = (categories: string[]) => {
  addFilterChange({
    filterName: 'category',
    value: categories.filter(Boolean),
  })
}
</script>

<template>
  <header
    class="header sticky z-30 -mx-4 flex flex-row justify-between bg-background px-4 py-1.5 pt-4"
  >
    <div class="box-content flex h-10 items-center gap-1 rounded border border-apetitoGray px-1">
      <CategoryFilter
        v-if="filters.category"
        :value="filters.category.value"
        :categories="filters.category.categories"
        :loading="loading"
        :default-category="filters.category.defaultCategory"
        :label="filters.category.label"
        @change="onCategoriesChange"
      ></CategoryFilter>

      <span
        v-if="overallResults"
        class="inline-flex items-center justify-center whitespace-nowrap rounded bg-main px-2.5 py-0.5 text-center text-sm text-white"
      >
        {{ t('downloads.filesCount', { count: overallResults }) }}
      </span>
    </div>

    <div v-if="filters.search" class="w-80">
      <SearchInput :valueProp="search" @changeSearch="onSearch" />
    </div>
  </header>
</template>

<style scoped>
.header {
  top: var(--header-height);
}
</style>
