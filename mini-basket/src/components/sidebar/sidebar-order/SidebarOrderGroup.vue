<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { defineProps, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { BasketVisualGroup } from '@/stores/utils/utils'

const { t } = useI18n()
const props = defineProps<{
  group: BasketVisualGroup
}>()
const { group } = toRefs(props)
</script>

<template>
  <div class="mb-4 flex">
    <div class="flex w-12 justify-center py-1 text-2xl">
      <font-awesome-icon
        class="text-dark"
        size="sm"
        :icon="['fal', group.icon]"
      ></font-awesome-icon>
    </div>
    <div class="flex w-full justify-between pb-1">
      <div class="relative w-full pl-2.5">
        <div class="relative h-full">
          <div class="title text-lg leading-4 text-dark" :title="group.name">
            <span>{{ t(`products.groups.${group.name}`) }}</span>
          </div>
          <div class="top-9 text-xs leading-6 text-muted" :title="group.count">
            <span>{{ t('common.products', group.count) }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div class="price whitespace-nowrap text-lg leading-4">
          {{ group.totalPrice }}
        </div>
      </div>
    </div>
  </div>
</template>
