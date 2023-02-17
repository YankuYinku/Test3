<script lang="ts" setup>
import { defineProps } from 'vue'
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { PlausibilityError } from '@/composables/use-plausibility-check'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  errors: PlausibilityError[]
}>()
</script>
<template>
  <div v-if="props.errors.length" class="rounded-2xl border-2 border-red-500 bg-red-50 p-4 pr-16">
    <div class="flex items-start gap-4 pr-8">
      <div class="p-2 pr-3">
        <font-awesome-icon class="text-3xl text-red-500" size="2xl" :icon="faExclamationTriangle" />
      </div>
      <div>
        <h3 class="mb-2 font-bold">{{ t('tabs.bkt.formErrorBoxTitle') }}</h3>
        <ul class="pl-4">
          <template v-for="(error, index) in errors" :key="index">
            <li class="list-disc">{{ error.title }}</li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
