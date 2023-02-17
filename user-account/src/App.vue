<script setup lang="ts">
import {
  authentication,
  ICurrentUserData,
  appInsights,
  useEventBus,
  CustomerChangedActionPayload,
} from '@apetito/portal-sdk-common'
import {
  computed,
  getCurrentInstance,
  onBeforeMount,
  ref,
  Ref,
  onBeforeUnmount,
  provide,
} from 'vue'
import UserAccountSettings from './components/UserAccountSettings.vue'
import { UserAccountModelInterface, useStore } from '@/stores/'
import UserAccountCustomerSelection from './components/UserAccountCustomerSelection.vue'
import { useCustomerChanged } from '@/composables/customer'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const store = useStore()

const userAccount: Ref<UserAccountModelInterface | undefined> = ref()
try {
  userAccount.value = authentication.getAccount()
  if (userAccount.value === null) {
    appInsights.trackEvent({
      name: 'Login_User-Account_App_GetAccount',
      properties: {
        customerNumbers: store.activeCustomerNumbers,
        reason: 'userAccount is null',
      },
    })
  }
} catch (error: unknown) {
  appInsights.trackEvent({
    name: 'Login_User-Account_App_GetAccount',
    properties: {
      customerNumbers: store.activeCustomerNumbers,
      error: error,
    },
  })
}
const isSignedIn: Ref<boolean | undefined> = ref()
try {
  isSignedIn.value = authentication.isSignedIn()
} catch (error: unknown) {
  appInsights.trackEvent({
    name: 'Login_User-Account_App_IsSignedIn',
    properties: {
      customerNumbers: store.activeCustomerNumbers,
      error: error,
    },
  })
}

const { publishChanges } = useCustomerChanged(store)
const { subscribeEventBusAction, getEventBusPayload } = useEventBus<ICurrentUserData>(
  '@apetito/sspa-user-data',
  getCurrentInstance()
)
subscribeEventBusAction(event => {
  if (event?.payload) {
    setStoreData(event.payload)
  }
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

onBeforeMount(async () => {
  getEventBusPayload().then(setStoreData)
  eventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
  })
})

onBeforeUnmount(() => {
  unsubscribeEventBus()
})

function setStoreData(payload: ICurrentUserData) {
  if (payload) {
    store.getUserData(payload)
    publishChanges()
  }
}

function signOut(): void {
  authentication.signOut().catch((error: Error) => {
    appInsights.trackEvent({
      name: 'Login_User-Account_App_SignOut',
      properties: {
        customerNumbers: store.activeCustomerNumbers,
        error: error,
      },
    })
  })
}

function changePassword(): void {
  authentication.changePassword().catch((error: Error) => {
    appInsights.trackEvent({
      name: 'Login_User-Account_App_ChangePassword',
      properties: {
        customerNumbers: store.activeCustomerNumbers,
        error: error,
      },
    })
  })
}

function editProfile(): void {
  authentication.editProfile().catch((error: Error) => {
    appInsights.trackEvent({
      name: 'Login_User-Account_App_EditProfile',
      properties: {
        customerNumbers: store.activeCustomerNumbers,
        error: error,
      },
    })
  })
}

const customerSelectorShown = computed(() => store.allCustomerNumbers?.length)

provide(UserLanguageInjectionKey, userLanguageCode)
</script>

<template>
  <div class="apps-user-account">
    <div class="flex gap-6">
      <user-account-customer-selection
        v-if="customerSelectorShown"
      ></user-account-customer-selection>
      <user-account-settings
        v-if="isSignedIn"
        @sign-out="signOut()"
        @change-password="changePassword()"
        @edit-profile="editProfile()"
        :account="userAccount"
      ></user-account-settings>
    </div>
  </div>
</template>
