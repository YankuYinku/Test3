<script setup lang="ts">
import { useStore } from '@/stores/order-store'
import { VcButtonPrimary, VcHeartSpinner } from '@apetito/components-ui-vue3'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { computed } from '@vue/reactivity'
import { defineEmits, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetailsApetitoArticleList from './OrderDetailsApetitoArticleList.vue'
import OrderDetailsHawaArticleList from './OrderDetailsHawaArticleList.vue'

const store = useStore()

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'confirm', close: () => void): void
}>()

const props = defineProps<{
  panelPosition?: 'top-right' | 'bottom-left'
  disabled?: boolean
}>()

const positionStyle = computed(() => {
  switch (props.panelPosition) {
    case 'top-right':
      return 'right-0 -translate-y-full'
    case 'bottom-left':
      return 'left-0 -translate-x-full top-0'
    default:
      return 'right-0 -translate-y-full'
  }
})

const headline = computed(() => {
  return store.someArticlesNotAvailable
    ? t('tabs.orders.details.general.articlesNotAvailable')
    : t('tabs.orders.details.general.allArticlesAvailable')
})

const buttonLabel = computed(() => {
  return store.someArticlesNotAvailable
    ? t('tabs.orders.details.general.stillOrder')
    : t('tabs.orders.details.general.confirmOrderButtonLabel')
})

const areApetitoArticles = computed(() => !!store.apetitoOrderDetails)

function confirmReorder(close: () => void) {
  emit('confirm', close)
}
</script>

<template>
  <template v-if="props.disabled">
    <slot name="button"></slot>
  </template>
  <template v-else>
    <Popover v-slot="{ close }" class="relative ml-auto">
      <PopoverButton as="div">
        <slot name="button" :close="close"></slot>
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <PopoverPanel
          class="overlay absolute z-50 w-auto transform text-left"
          :class="positionStyle"
        >
          <div
            class="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="flex flex-col gap-4 p-4">
              <template v-if="store.articleAvailabilityLoading || store.detailsLoading">
                <div class="flex flex-col gap-2 text-center">
                  <h2 class="mt-4 text-lg font-bold">{{ t('tabs.orders.checkAvailability') }}</h2>
                  <div class="h-24">
                    <VcHeartSpinner
                      class="z-99 relative h-56 scale-50 transform bg-opacity-50"
                    ></VcHeartSpinner>
                  </div>
                </div>
              </template>
              <template v-else>
                <h2 class="text-lg font-bold">{{ headline }}</h2>
                <template v-if="store.someArticlesNotAvailable">
                  <template v-if="areApetitoArticles">
                    <OrderDetailsApetitoArticleList
                      :positions="store.getUnavailableApetitoArticles"
                    ></OrderDetailsApetitoArticleList>
                  </template>
                  <template v-else>
                    <OrderDetailsHawaArticleList
                      :order-positions="store.getUnavailableHawaArticles"
                    ></OrderDetailsHawaArticleList>
                  </template>
                </template>
                <template v-else>
                  <p>{{ t('tabs.orders.details.general.pleaseConfirmToReorder') }}</p>
                </template>
                <div class="flex items-center justify-end gap-2">
                  <PopoverButton
                    v-if="!store.addArticlesToBasketLoading"
                    class="cursor-pointer text-primary hover:text-primary-dark"
                  >
                    {{ t('tabs.orders.details.general.cancel') }}
                  </PopoverButton>
                  <div v-else class="small-spinner relative h-8 w-8">
                    <VcHeartSpinner class="z-99 absolute h-6 w-6 bg-opacity-0"></VcHeartSpinner>
                  </div>

                  <VcButtonPrimary
                    class="px-4"
                    :class="[
                      store.addArticlesToBasketLoading && 'disabled pointer-events-none opacity-50',
                    ]"
                    :disabled="store.addArticlesToBasketLoading"
                    @click="confirmReorder(close)"
                  >
                    {{ buttonLabel }}
                  </VcButtonPrimary>
                </div>
              </template>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </template>
</template>

<style scoped lang="scss">
.overlay {
  min-width: 22rem;
}
.small-spinner :deep(.vc-heart-spinner) {
  transform: scale(0.25);
}
</style>
