<script lang="ts" setup>
import { defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import MultiSelectCheckbox from './MultiSelectCheckbox.vue';
const props = defineProps<{
  value: unknown[]
  // a function which knows how to reads the unknown data coming in via value
  valueMapper?: (value: unknown, checked: boolean) => string
  options: { id: string; value: unknown }[]
  useSelectAll: boolean
  disabled?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits(['update:value'])

function check(id: string, isChecked: boolean): void {
  let updatedValue = [...props.value]
  if (isChecked) {
    updatedValue.push(id)
  } else {
    updatedValue.splice(updatedValue.indexOf(id), 1)
  }
  emit('update:value', updatedValue)
}

function computeValue(value: unknown, checked: boolean) {
  if (props.valueMapper && typeof props.valueMapper === 'function') {
    return props.valueMapper(value, checked)
  }

  return value as string
}

function selectAll(selected: boolean): void {
  if (selected) {
    emit('update:value', [...props.options.map(item => item.id)])
  } else {
    emit('update:value', [])
  }
}
</script>

<template>
  <div class="flex flex-col gap-2" :class="{ 'pointer-events-none opacity-75': disabled }">
    <template v-if="useSelectAll">
      <MultiSelectCheckbox
        :value="t('tabs.accounts.createForm.selectAll')"
        :optionId="'all'"
        :checked="false"
        @update:checked="selectAll"
      ></MultiSelectCheckbox>
    </template>
    <MultiSelectCheckbox
      v-for="item in options"
      :key="item.id"
      :value="computeValue(item.value, props.value?.includes(item.id))"
      :optionId="item.id"
      :checked="props.value?.includes(item.id)"
      @update:checked="check(item.id, $event)"
    ></MultiSelectCheckbox>
  </div>
</template>
