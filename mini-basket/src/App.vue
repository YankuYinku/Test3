<script lang="ts" setup>
import MiniBasketTrigger from '@/components/trigger/MiniBasketTrigger.vue'
import {
  defineProps,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  toRefs,
  withDefaults,
  provide,
  ref,
  getCurrentInstance,
} from 'vue'
import { getHiddenBearerToken } from '@/composables/bearerToken'
import { useStore } from '@/stores'
import { useEventBus, CustomerChangedActionPayload } from '@apetito/portal-sdk-common'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const store = useStore()
const props = withDefaults(
  defineProps<{
    orderOverviewLink?: string
    basketLink?: string
  }>(),
  {
    basketLink: '/basket',
    orderOverviewLink: '',
  }
)
const { orderOverviewLink, basketLink } = toRefs(props)

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
    unsubscribeEventBus()
  }
})

onMounted(() => {
  nextTick(() => {
    store.orderOverviewLink = orderOverviewLink.value
    store.basketLink = basketLink.value
  })
})

onBeforeMount(() => {
  store.initShoppingSession()
  eventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
  })
})

onBeforeUnmount(() => {
  unsubscribeEventBus()
})

const { awaitingToken } = getHiddenBearerToken()

provide(UserLanguageInjectionKey, userLanguageCode)
</script>

<template>
  <div class="apps-mini-basket">
    <mini-basket-trigger v-if="!awaitingToken"></mini-basket-trigger>
    <div v-else class="skeleton h-9.5 w-16 rounded-full bg-apetitoGray"></div>
  </div>
</template>

<style scoped lang="scss">
.skeleton {
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0)
  );
  background-size: 2rem 100%;
  background-position: left -2rem top 0;
  animation: shine 1s ease infinite;

  @apply bg-apetitoGray bg-no-repeat opacity-40;
}

@keyframes shine {
  100% {
    background-position: right -2rem top 0;
  }
}
</style>
