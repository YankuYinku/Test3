<script lang="ts" setup>
import MiniBasketSidebar from '@/components/sidebar/MiniBasketSidebar.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { VcButtonPrimary, VcBadge } from '@apetito/components-ui-vue3'

import {
  computed,
  nextTick,
  withDefaults,
  defineProps,
  onMounted,
  onDeactivated,
  toRefs,
} from 'vue'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const props = withDefaults(
  defineProps<{
    maxCount?: number
  }>(),
  {
    maxCount: 999,
  }
)
const store = useStore()

const { maxCount } = toRefs(props)
const { isOpen, summaryData } = storeToRefs(store)

const badgeText = computed(() => {
  if (summaryData.value.summary.count > maxCount.value) {
    return `${maxCount.value}+`
  }

  return summaryData.value.summary.count
})

const toggleSidebar = () => {
  store.open = !isOpen.value
}

const refreshBasketData = () => {
  store.getBasketSummaryData()
}

onMounted(() => {
  nextTick(() => {
    refreshBasketData()

    window.addEventListener('mini-basket:refresh', refreshBasketData)
  })
})

onDeactivated(() => {
  window.removeEventListener('mini-basket:refresh', refreshBasketData)
})
</script>

<template>
  <span>
    <vc-button-primary
      class="mini-basket-button pr-2.5 shadow"
      :class="{ 'cart-empty': !summaryData.summary.count }"
      @click="toggleSidebar"
    >
      <span class="flex items-center">
        <font-awesome-icon
          :icon="['fal', 'shopping-cart']"
          class="mx-2 text-xl text-main-white"
        ></font-awesome-icon>

        <vc-badge v-if="summaryData.summary.count > 0" class="bg-main-white">
          {{ badgeText }}
        </vc-badge>
      </span>
    </vc-button-primary>

    <mini-basket-sidebar></mini-basket-sidebar>
  </span>
</template>

<style lang="scss" scoped>

.mini-basket-button {
  padding-top: 0.45rem;
  padding-bottom: 0.45rem;
}
.cart-empty {
  @apply bg-dark;
}
</style>
