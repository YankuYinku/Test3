<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CustomerChangedActionPayload, useEventBus } from '@apetito/portal-sdk-common'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, provide, ref } from 'vue'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const { t } = useI18n()

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
  <section class="apps-legal">
    <router-view />
  </section>
  <Teleport to="#page--title">
    <h1>{{ t('main.caption') }}</h1>
  </Teleport>
</template>
