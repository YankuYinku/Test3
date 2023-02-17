<script lang="ts" setup>
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, provide, reactive, ref } from 'vue'
import { GlobalVideoPlayerKey } from './injectionKeys'
import GlobalVideoPlayer from './components/GlobalVideoPlayer.vue'
import { useRouting } from './composables/routing'
import { useFaqs } from './composables/faqs'
import { CustomerChangedActionPayload, useEventBus } from '@apetito/portal-sdk-common'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const globalVideoOpen = ref(false)

const videoValues = reactive({
  html: '',
  height: 0,
  width: 0,
})

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

// function to start the global video player
function openVideo(embedHtml: string, originalWidth: number, originalHeight: number): void {
  videoValues.height = originalHeight
  videoValues.width = originalWidth
  videoValues.html = embedHtml
  globalVideoOpen.value = !globalVideoOpen.value
}

onBeforeMount(() => {
  eventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
  })
})
onBeforeUnmount(() => {
  unsubscribeEventBus()
})

// provide the function in order to open the player from elsewhere.
provide(GlobalVideoPlayerKey, openVideo)
provide(UserLanguageInjectionKey, userLanguageCode)
// handles setting the groups and topics according to router params
useRouting()

// load FAQs
useFaqs()
</script>

<template>
  <div class="apps-faq">
    <router-view></router-view>
    <GlobalVideoPlayer
      v-if="globalVideoOpen"
      @close="globalVideoOpen = false"
      :open="globalVideoOpen"
      :orig-height="videoValues.height"
      :orig-width="videoValues.width"
      :orig-embed-html="videoValues.html"
    ></GlobalVideoPlayer>
  </div>
</template>
