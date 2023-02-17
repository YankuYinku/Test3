<script setup lang="ts">
import { defineProps } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{
  optionId: string
  value: string
  checked: boolean
}>()
</script>

<template>
  <div class="relative flex items-center">
    <label class="checkbox-label flex items-center pl-4" :for="optionId">
      <input
        type="checkbox"
        class="cursor-pointer opacity-0"
        :id="optionId"
        :name="optionId"
        :checked="checked"
        :value="value"
        @input="event => $emit('update:checked', (event?.target as HTMLInputElement).checked)"
      /><span class="custom-checkbox"
        ><font-awesome-icon class="icon text-white" size="md" :icon="['fal', 'check']" /></span
      ><span>{{ value }}</span></label
    >
  </div>
</template>

<style lang="scss" scoped>
.checkbox-label {
  height: 24px;
  user-select: none;
  cursor: pointer;
}

input ~ .custom-checkbox {
  position: absolute;
  height: 20px;
  width: 20px;
  top: 2px;
  left: 0;
  border: 1px solid #c7c5c0;
  border-radius: 1px;
  .icon {
    transform: translate(2px, -2px);
  }
}

input:checked ~ .custom-checkbox {
  background-color: #58b03b;
  color: #58b03b;
  border-color: transparent;
}
</style>
