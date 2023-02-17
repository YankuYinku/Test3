<script lang="ts" setup>
import { Order } from '@/models/order.js'
import { useStore } from '@/stores/order-store'
import { VcButtonPrimary } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, defineEmits, defineProps, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetailsAvailabilityModal from './OrderDetailsAvailabilityModal.vue'

const { t } = useI18n()

const props = defineProps<{
  order: Order
}>()

const store = useStore()

const emit = defineEmits<{
  (e: 'reorder', order: Order): void
}>()

const reOrderPossible = computed(() => {
  return (
    store.articleAvailabilityChecked &&
    store.articleAvailability.filter(availability => !!availability.available).length > 0
  )
})

const reorderButtonDisabled = computed(
  () => store.detailsLoading || store.articleAvailabilityLoading || !reOrderPossible.value
)

function onReorder() {
  emit('reorder', props.order)
}
</script>

<template>
  <div class="flex items-center justify-start gap-2 p-8">
    <!-- Re-Order articles button with availability check pop-over -->
    <OrderDetailsAvailabilityModal :disabled="reorderButtonDisabled" @confirm="onReorder">
      <template #button>
        <VcButtonPrimary
          type="button"
          class="ml-auto px-4"
          :class="{
            'pointer-events-none opacity-50': reorderButtonDisabled,
          }"
        >
          <font-awesome-icon
            class="icon text-md group-hover:text-primary"
            :icon="['fal', 'shopping-cart']"
          />
          <span class="pl-2">
            {{ t('tabs.orders.details.general.reorder') }}
          </span>
        </VcButtonPrimary>
      </template>
    </OrderDetailsAvailabilityModal>
  </div>
</template>
