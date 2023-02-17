<script lang="ts" setup>
import NotificationsBell from '@/components/notificationsBell/NotificationsBell.vue'
import { NotificationsOptions, notify } from '@kyvg/vue3-notification'
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, provide, ref } from 'vue'
import {
  CustomerChangedActionPayload,
  DEFAULT_MESSAGES_NAMESPACE,
  useEventBus,
} from '@apetito/portal-sdk-common'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { VcButtonSecondary } from '@apetito/components-ui-vue3'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const notificationsEventBus = useEventBus<string | NotificationsOptions>(
  DEFAULT_MESSAGES_NAMESPACE,
  getCurrentInstance()
)
const userAccountEventBus = useEventBus<CustomerChangedActionPayload>(
  '@apetito/user-account',
  getCurrentInstance()
)
const unsubscribeNotificationsEventBus = notificationsEventBus.subscribeEventBusAction(message => {
  if (message?.payload) {
    notify(message.payload)
  }
})

const handle = (e: Event) => {
  const composedPath = (e.composedPath() || []).filter(
    el => el instanceof HTMLElement
  ) as HTMLElement[]

  if (
    composedPath.some((element: HTMLElement) => {
      return element.classList.contains('apps-notifications')
    })
  ) {
    e.stopImmediatePropagation()
  }
}

const userLanguageCode = ref(i18n.global.locale.value)

const provideUserLanguageCode = (payload: CustomerChangedActionPayload) => {
  const { languageCodes } = payload
  userLanguageCode.value = usePrioritizedLanguageCode(languageCodes)
  i18n.global.locale.value = userLanguageCode.value
}
const unsubscribeUserAccountEventBus = userAccountEventBus.subscribeEventBusAction(event => {
  if (event?.type === 'CustomerChanged') {
    provideUserLanguageCode(event.payload)
  }
})

onBeforeMount(() => {
  window.addEventListener('pointerdown', handle)
  window.addEventListener('mousedown', handle)
  userAccountEventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
  })
})

onBeforeUnmount(() => {
  unsubscribeUserAccountEventBus()
  unsubscribeNotificationsEventBus()
  window.removeEventListener('pointerdown', handle)
  window.removeEventListener('mousedown', handle)
})

function getNotificationIcon(notificationType: 'success' | 'error' | 'warn'): string {
  switch (notificationType) {
    case 'success':
      return 'check-circle'
    case 'error':
      return 'exclamation-circle'
    case 'warn':
      return 'exclamation-triangle'
    default:
      return 'info-circle'
  }
}

provide(UserLanguageInjectionKey, userLanguageCode)
</script>

<template>
  <div class="apps-notifications">
    <!-- There is a bug with displayed toasts when any headlessUi dialog is active. -->
    <!-- Toasts are not visible in such case because notifications app resides inside <header/> element, which has z-index of 35 -->
    <!-- HeadlessUi dialogs have z-index equal to 40, hence the notifications are jumping right behind them. -->
    <!-- One possible solution is to teleport <notifications/> to <main/> element and adding apps-notifications class on it. TBD -->
    <teleport to="#headlessui-portal-root">
      <notifications
        pause-on-hover
        position="bottom right"
        class="apps-notifications z-50 px-6 py-0"
        width="auto"
        :close-on-click="false"
      >
        <template #body="{ item, close }">
          <div
            class="notification my-2 min-w-90 rounded border-l-12 p-7.5 text-xs text-gray-800 shadow-md"
            :class="item.type"
          >
            <div class="mb-5 flex items-center justify-between gap-3.75">
              <div class="flex items-center gap-3.75">
                <font-awesome-icon
                  class="icon rounded p-1 text-3xl text-white"
                  :icon="['fal', getNotificationIcon(item.type)]"
                />
                <div class="text-2xl font-bold">
                  {{ item.title }}
                </div>
              </div>
              <VcButtonSecondary
                has-custom-background-color
                has-custom-focus
                has-custom-text-color
                class="-mt-9 -mr-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-transparent bg-transparent text-gray-800 shadow-none hover:text-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="close"
              >
                <font-awesome-icon :icon="['fal', 'times']" />
              </VcButtonSecondary>
            </div>
            <div class="text-lg">{{ item.text }}</div>
          </div>
        </template>
      </notifications>
    </teleport>
    <notifications-bell></notifications-bell>
  </div>
</template>

<style lang="scss" scoped>
.vue-notification-wrapper {
  @apply overflow-visible;

  .notification {
    @apply border-l-12 border-notification-info-dark bg-notification-info-light;

    .icon {
      @apply bg-notification-info-dark;
    }

    &.success {
      @apply border-notification-success-dark bg-notification-success-light;

      .icon {
        @apply bg-notification-success-dark;
      }
    }

    &.error {
      @apply border-notification-error-dark bg-notification-error-light;

      .icon {
        @apply bg-notification-error-dark;
      }
    }

    &.warn {
      @apply border-notification-warn-dark bg-notification-warn-light;

      .icon {
        @apply bg-notification-warn-dark;
      }
    }
  }
}
</style>
