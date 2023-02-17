<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch, defineProps, withDefaults, defineEmits } from 'vue'
import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { VcSelect } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    value: string[]
    categories: CategoriesSummarizationModel[]
    defaultCategory: CategoriesSummarizationModel
    label: string
    loading: boolean
  }>(),
  {
    label: '',
    loading: false,
    value: () => [],
  }
)

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'change', categories: string[]): void
}>()

const { defaultCategory, value: filterValue, label, categories } = toRefs(props)

const getPreselectedCategories = (defaultCategory: CategoriesSummarizationModel) => {
  if (filterValue.value.length) {
    return categories.value.filter(category => {
      return filterValue.value.includes(category.categoryName)
    })
  }

  return [defaultCategory]
}

const selectedCategories = ref<CategoriesSummarizationModel[]>(
  getPreselectedCategories(defaultCategory.value)
)

const inputLabel = computed(() => {
  let selected = selectedCategories.value

  if (!Array.isArray(selected)) {
    selected = [selected]
  }

  return (
    selected
      ?.filter(Boolean)
      ?.map(category => category.categoryName)
      ?.join('/') || label.value
  )
})

const onChange = (categories: string[]) => {
  emit(
    'change',
    categories.filter(categoryName => {
      return categoryName && categoryName !== t('category.all.downloads')
    })
  )
}

watch(selectedCategories, (val, old) => {
  if (JSON.stringify(val) === JSON.stringify(old)) {
    return
  }

  if (!val) {
    onChange([])
  } else {
    if (!Array.isArray(val)) {
      val = [val]
    }

    onChange(val.map(cat => cat.categoryName))
  }
})

const categoriesLoaded = ref(false)

watch(
  categories,
  val => {
    if (!categoriesLoaded.value) {
      nextTick(() => {
        selectedCategories.value = getPreselectedCategories(defaultCategory.value)
      })
      categoriesLoaded.value = true
    }
  },
  {
    immediate: true,
  }
)

watch(filterValue, () => {
  selectedCategories.value = getPreselectedCategories(defaultCategory.value)
})
</script>

<template>
  <vc-select
    v-model="selectedCategories"
    return-object
    item-value="categoryName"
    item-text="categoryName"
    class="category-picker"
    :items="categories"
    :label="inputLabel"
    :loading="loading"
  >
    <template v-slot:item:append="{ item, selected }">
      <span class="rounded bg-background px-1" :class="[selected && 'text-black']">
        {{ item.amount || 0 }}
      </span>
    </template>
  </vc-select>
</template>

<style lang="scss" scoped>
.category-picker {
  :deep(> div) {
    @apply mt-0;
  }

  &:not(.vc-select__open) {
    @apply drop-shadow-none;

    ::v-deep(button) {
      @apply bg-transparent;
    }
  }
}
</style>
