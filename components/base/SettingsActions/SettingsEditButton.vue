<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
    (e: 'click')
}>()
</script>

<template>
    <button
      type="button"
      class="focus:outline-none rounded-md bg-white font-medium text-primary hover:text-primary-dark hover:underline focus:ring-2 focus:ring-primary-dark focus:ring-offset-2"
      @click="emit('click')"
    >
      {{ t('settings.action.edit') }}
    </button>
</template>
