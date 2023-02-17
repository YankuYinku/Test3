<script lang="ts" setup>
import { defineEmits, ref, defineProps, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VcTextField } from '@apetito/components-ui-vue3'
import { BASE_STRING_LENGTH_BEFORE_PROCESSING } from '@/constants'

const props = defineProps<{
  valueProp: string
}>()

const { t } = useI18n()
const { valueProp } = toRefs(props)
const search = ref(valueProp.value)

const emit = defineEmits<{
  (e: 'changeSearch', value: string): void
}>()

const onSearchValueChange = () => {
  const value: string = search.value?.trim() || ''

  if (value.length > BASE_STRING_LENGTH_BEFORE_PROCESSING || value.length === 0) {
    emit('changeSearch', value)
  }
}

watch(valueProp, newValue => {
  search.value = newValue
})

watch(search, () => {
  onSearchValueChange()
})
</script>

<template>
  <VcTextField v-model="search" clearable :placeholder="t('downloads.searchInputPlaceholder')" />
</template>
