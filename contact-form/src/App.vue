<script lang="ts" setup>
import { PrismicRepositoryName } from '@/injectionKeys/prismic'
import env from '@/utils/env'
import { useEventBus, CustomerChangedActionPayload } from '@apetito/portal-sdk-common'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, provide, ref } from 'vue'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

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
provide(PrismicRepositoryName, env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito')
</script>

<template>
  <div class="apps-contact-form flex">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.apps-contact-form {
  min-height: calc(100vh - var(--header-height, 0));
}
</style>
