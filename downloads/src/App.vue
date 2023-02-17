<script setup lang="ts">
import Downloads from '@/views/Downloads.vue'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, provide, ref } from 'vue'
import { UserLanguageInjectionKey } from '@/models/users/_injectionKeys'
import { useEventBus, CustomerChangedActionPayload } from '@apetito/portal-sdk-common'
import i18n from '@/i18n'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'

const eventBus = useEventBus<CustomerChangedActionPayload>(
  '@apetito/user-account',
  getCurrentInstance()
)
const userLanguageCode = ref(i18n.global.locale.value)

const provideUserLanguageCode = (payload: CustomerChangedActionPayload) => {
  const { languageCodes } = payload
  userLanguageCode.value = usePrioritizedLanguageCode(languageCodes)
  i18n.global.locale.value = userLanguageCode.value
}
const unsubscribeEventBus = eventBus.subscribeEventBusAction(event => {
  if (event?.type === 'CustomerChanged') {
    provideUserLanguageCode(event.payload)
  }
})
onBeforeMount(() => {
  eventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
  })
})
onBeforeUnmount(() => {
  unsubscribeEventBus()
})

provide(UserLanguageInjectionKey, userLanguageCode)
</script>

<template>
  <router-view></router-view>
</template>
