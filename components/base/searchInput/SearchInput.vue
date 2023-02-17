<script lang="ts" setup>
import { VcTextField } from '@apetito/components-ui-vue3'
import { useDebounceFn } from '@vueuse/core'
import { defineEmits, defineProps, ref, toRefs, watch } from 'vue'

const BASE_STRING_LENGTH_BEFORE_PROCESSING = 2

const props = defineProps<{
  valueProp: string
  placeholder: string
}>()

const { valueProp } = toRefs(props)
const search = ref(valueProp.value)

const emitDebounce = useDebounceFn(func => {
  if (typeof func === 'function') {
    func()
  }
}, 500)

const emit = defineEmits<{
  (e: 'changeSearch', value: string): void
}>()

const onSearchValueChange = () => {
  const value: string = search.value?.trim() || ''

  if (value.length > BASE_STRING_LENGTH_BEFORE_PROCESSING || value.length === 0) {
    emitDebounce(() => emit('changeSearch', value))
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
  <VcTextField v-model="search" clearable :placeholder="props.placeholder" />
</template>
