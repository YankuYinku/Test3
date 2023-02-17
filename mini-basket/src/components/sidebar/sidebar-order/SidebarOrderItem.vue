<script setup lang="ts">
import { VcImg, VcBadge } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import { defineProps, computed, toRefs } from 'vue'
import { useCurrencyFormat } from '@/utils/currency'
import { BasketVisualItem } from '@/stores/utils/utils'

const { t } = useI18n()
const props = defineProps<{
  order: BasketVisualItem
}>()
const { order } = toRefs(props)

const totalPrice = computed(() => {
  const multipliedPrice =
    order.value.shoppingUnitPrice *
    (order.value.quantity.amount - (order.value?.freeOfChargeQuantity ?? 0))
  return useCurrencyFormat(multipliedPrice)
})

const price = computed(() => {
  return useCurrencyFormat(order.value.shoppingUnitPrice)
})
</script>

<template>
  <div class="mb-4 flex">
    <div class="h-16 w-16">
      <vc-img class="h-16 w-16" :src="order.thumbnailPath" :alt="order.shortDescription"></vc-img>
    </div>
    <div class="flex w-full justify-between py-1">
      <div class="details-left relative w-full pl-2.5">
        <div class="relative h-full">
          <div
            class="hide-overflown-text title top-0.5 text-sm font-semibold leading-4"
            :title="order.shortDescription"
          >
            <span>{{ order.shortDescription }}</span>
          </div>
          <div
            class="hide-overflown-text article-number top-4 text-xs leading-4 text-muted"
            :title="order.articleNumber"
          >
            <span>{{ order.articleNumber }}</span>
          </div>
          <div
            class="hide-overflown-text description top-9 text-xs leading-5 text-muted"
            :title="order.shortDescription"
          >
            <span>
              {{ price }} / {{ t(`packageType.${order.quantity.unit.toLowerCase()}`) }}
              <template v-if="order?.freeOfChargeQuantity">
                ({{ order.freeOfChargeQuantity }}
                {{ t(`packageType.${order.quantity.unit.toLowerCase()}`) }}
                {{ t(`common.freeOfCharge`) }})
              </template>
            </span>
          </div>
        </div>
      </div>
      <div class="details-right flex flex-col justify-between">
        <div class="quantity text-right">
          <vc-badge class="quantity-badge">{{ order.quantity.amount }}</vc-badge>
        </div>
        <div class="price whitespace-nowrap text-lg font-bold leading-4">
          {{ totalPrice }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.quantity-badge {
  @apply bg-black px-2 text-center text-sm text-white;

  min-width: 1.5rem;
}

.hide-overflown-text {
  @apply absolute
  w-full
  overflow-hidden overflow-ellipsis
  whitespace-nowrap;
}
</style>
