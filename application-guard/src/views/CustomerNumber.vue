<script lang="ts" setup>
import { ref, onBeforeMount, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { CustomerChangedActionPayload, useEventBus } from '@apetito/portal-sdk-common'

const { t } = useI18n()

const { subscribeEventBusAction, getEventBusPayload } =
  useEventBus<CustomerChangedActionPayload>('@apetito/user-account', getCurrentInstance())
let unsubscribeEventBusAction: () => boolean

const isVisible = ref(true)

onBeforeMount(() => {
  getEventBusPayload().then(payload => {
    isVisible.value = payload.customerNumbers.length !== 1
    unsubscribeEventBusAction = subscribeEventBusAction(event => {
      isVisible.value = event?.payload?.customerNumbers.length !== 1
    })
  })
})

onBeforeUnmount(() => {
  unsubscribeEventBusAction()
})
</script>

<template>
  <section v-if="isVisible" class="mt-4 flex items-center justify-center">
    <div class="flex items-center border-l-4 border-blue-600 bg-blue-100 p-4">
      <font-awesome-icon class="icon text-blue-600" size="lg" :icon="['fal', 'info-circle']" />
      <div class="ml-4">
        <h2 class="text-2xl">{{ t('guard.customerNumber.title') }}</h2>
        <p class="mt-1 text-lg">{{ t('guard.customerNumber.description') }}</p>
      </div>
    </div>
  </section>
</template>
