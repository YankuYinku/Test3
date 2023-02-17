<script setup lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { VcButtonSecondary, VcLoader, VcSeparator, VcButtonLink } from '@apetito/components-ui-vue3'
import SidebarOrderItem from '@/components/sidebar/sidebar-order/SidebarOrderItem.vue'
import SidebarOrderGroup from '@/components/sidebar/sidebar-order/SidebarOrderGroup.vue'
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCurrencyFormat } from '@/utils/currency'
import { navigateToUrl } from 'single-spa'
import { useStore } from '@/stores'
import { getIndividualBasketItems } from '@/stores/utils/utils'

const { t } = useI18n()
const store = useStore()
const state = reactive({
  isLoading: false,
})

const itemsCount = computed(() => store.summaryData.summary.count)
const items = computed(getIndividualBasketItems)
const hasGroups = computed(() => !!items.value?.groups?.length)
const hasItems = computed(() => !!items.value?.individualItems?.length)
const hasAnyItems = computed(() => {
  return hasItems.value || hasGroups.value
})
const totalPrice = computed(() => useCurrencyFormat(store.summaryData.summary.total))

const basketLink = computed(() => store.basketLink)
const orderOverviewLink = computed(() => store.orderOverviewLink)

const isOpen = computed(() => store.isOpen)
const close = () => {
  store.open = false
}

const fetchItems = () => {
  state.isLoading = true

  store.getBasketDetailedDataIfNeeded().then(() => {
    state.isLoading = false
  })
}

const navigateTo = (url: string) => {
  close()
  navigateToUrl(url)
}

watch(isOpen, isOpen => {
  if (isOpen) {
    fetchItems()
  }
})
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="apps-mini-basket" @close="close">
      <div class="fixed inset-0 z-50 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <DialogOverlay class="absolute inset-0" />

          <div class="fixed inset-y-0 right-0 z-50 flex max-w-100">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-250 sm:duration-300"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-250 sm:duration-300"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <div class="relative w-screen max-w-90">
                <div
                  class="flex h-full flex-col overflow-hidden bg-white py-6 pt-16 shadow-xl md:pt-6"
                >
                  <div class="px-4">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="mr-3 text-xl font-semibold text-dark">
                        {{ t('mini-basket.slider.title') }}
                      </DialogTitle>
                      <div class="flex h-7 items-center">
                        <vc-button-secondary
                          class="close-sidebar outline-none border-none px-2.5 py-1 focus:ring-0"
                          @click="close"
                        >
                          <span class="sr-only">{{ t('mini-basket.slider.close') }}</span>
                          <font-awesome-icon
                            aria-hidden="true"
                            size="md"
                            :icon="['fal', 'times']"
                          ></font-awesome-icon>
                        </vc-button-secondary>
                      </div>
                    </div>
                  </div>
                  <div class="relative mt-14 h-full flex-1 pl-4">
                    <vc-loader v-if="state.isLoading" class="w-1/4 text-gray-100"></vc-loader>

                    <div v-else class="flex h-full flex-col">
                      <div class="items-container">
                        <div v-if="hasAnyItems">
                          <template v-for="item in items.individualItems" :key="item.data.key">
                            <sidebar-order-item
                              class="mt-2"
                              :order="item.data"
                            ></sidebar-order-item>
                          </template>
                          <vc-separator
                            v-if="hasItems && hasGroups"
                            class="mx-10 mt-4 mb-4 opacity-40"
                          ></vc-separator>
                          <template v-for="item in items.groups" :key="item.data.key">
                            <sidebar-order-group
                              class="mt-2"
                              :group="item.data"
                            ></sidebar-order-group>
                          </template>
                        </div>
                        <div v-else class="mb-10 p-4 text-center text-muted">
                          {{ t('mini-basket.slider.empty') }}
                        </div>
                      </div>
                      <div class="bottom-container pr-4">
                        <template v-if="hasAnyItems">
                          <vc-separator></vc-separator>
                          <div
                            class="my-3.5 flex items-baseline justify-between text-xl font-semibold"
                          >
                            <span class="text-base">
                              <p class="m-0">{{ t('mini-basket.slider.sum') }}</p>
                              <p class="m-0 text-xs font-normal">
                                {{ t('common.products', itemsCount) }}
                              </p>
                            </span>
                            <span>{{ totalPrice }}</span>
                          </div>
                        </template>
                        <vc-button-link
                          v-if="basketLink"
                          class="w-full text-center"
                          :to="basketLink"
                          @click.prevent="navigateTo(basketLink)"
                        >
                          {{ t('mini-basket.cta.goToBasket') }}
                        </vc-button-link>
                        <vc-button-link
                          v-if="orderOverviewLink"
                          variant="secondary"
                          class="mt-2.5 w-full text-center shadow-none"
                          :to="orderOverviewLink"
                          @click.prevent="navigateTo(orderOverviewLink)"
                        >
                          {{ t('mini-basket.cta.goToOrder') }}
                        </vc-button-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style lang="scss" scoped>
.close-sidebar {
  @apply text-gray-700 shadow-none;
}

.items-container {
  @apply overflow-y-auto pr-4;
}

.items-container {
  max-height: calc(100vh - 18rem);

  &::-webkit-scrollbar {
    @apply h-2 w-2;
  }

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgb(245 244 242);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
}
</style>
