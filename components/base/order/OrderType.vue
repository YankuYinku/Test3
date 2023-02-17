<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'
import ordersState from '@/stores/orders-state';

const { t } = useI18n()

const props = defineProps<{
  type: string
}>()

const iconAndLabel = computed(() => {
  switch (props.type) {
    case 'apetito':
      return { icon: 'soup', label: t('tabs.orders.types.apetito') }
    default:
      return { icon: 'info-circle', label: props.type }
  }
})
</script>

<template>
  <div class="flex items-center gap-4 px-4 text-light-grey">
    <font-awesome-icon class="icon text-xl" :icon="['fal', iconAndLabel.icon]" />
    <div class="text-md hidden 2xl:block">{{ iconAndLabel.label }}</div>
  </div>
</template>
