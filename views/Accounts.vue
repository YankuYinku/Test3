<script setup lang="ts">
import AccountList from '@/components/AccountList.vue'
import { useStore } from '@/stores/accounts-store'
import { NormalizedCacheObject } from '@apollo/client/cache'
import { VcButtonPrimary, VcSideModal } from '@apetito/components-ui-vue3'
import { ApolloClient } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeMount,
  onBeforeUnmount,
  Ref,
  ref,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AccountCreationForm from '@/components/AccountCreationForm.vue'
import {
  useEventBus,
  CustomerChangedActionPayload,
  dispatchNavigationData,
  useMessage,
} from '@apetito/portal-sdk-common'
import { VcHeartSpinner } from '@apetito/components-ui-vue3'
import MessageBox from '@/components/base/MessageBox.vue'
import { MessageType } from '@/types/message'
import { FeatureToggleComponent as feature } from 'vue-feature-toggle'
import { useFeatureFlags } from '@/composables/featureFlag'
import { SUCCESS_NOTIFICATION_DURATION, ERROR_NOTIFICATION_DURATION } from '@/const/notifications'

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const store = useStore()
const { t } = useI18n()

const { loading, getEventBusPayload, subscribeEventBusAction } =
  useEventBus<CustomerChangedActionPayload>('@apetito/user-account', getCurrentInstance())

const featureName = 'apetito.meinapetito.portal.accountList'

const { key } = useFeatureFlags(feature, [featureName])

// all customer numbers (admin and non admin)
const customerNumbers: Ref<number[]> = ref([])

// all customer numbers the user is also admin for.
const adminNumbers: Ref<number[]> = ref([])

// all administrated admin numbers
const allAdminNumbers: Ref<number[]> = ref([])

// if the user is admin for the current selected customer number
const isAdmin = computed(() => adminNumbers.value?.length > 0 && customerNumbers.value.length > 0)

// is only one customer number selected (accounts can then be edited)
const isSingleCustomerSelected = computed(() => {
  return customerNumbers.value.length === 1
})

// is there any user data loaded
const isUserDataAvailable = computed(() => {
  return !!customerNumbers.value?.length
})

// if this prop returns an object a message box (info or error) is shown above the list
const messageBox = computed((): { type: MessageType; text: string } | null => {
  if (!isAdmin.value && isUserDataAvailable.value) {
    return { type: 'info', text: 'tabs.accounts.infos.noAdmin' }
  }

  if (!isSingleCustomerSelected.value && isUserDataAvailable.value) {
    return { type: 'info', text: 'tabs.accounts.infos.selectCustomer' }
  }

  if (!isUserDataAvailable.value && !loading.value)
    return { type: 'error', text: 'tabs.accounts.errors.noUserData' }

  return null
})

// is the invite / create user sidebar open?
const createFormOpen = ref(false)

// reload list when customer numbers change
watch(adminNumbers, () => {
  if (adminNumbers.value.length) {
    loadAccounts()
  }
})

let unsubscribe: () => boolean

onBeforeMount(() => {
  // get current and future customer numbers (admin only)
  getEventBusPayload().then(userData => handleUserData(userData))
  unsubscribe = subscribeEventBusAction(action => handleUserData(action?.payload))

  dispatchNavigationData('@apetito/user-account-details')
})

onBeforeUnmount(() => {
  unsubscribe && unsubscribe()
})

const handleUserData = (userData: CustomerChangedActionPayload | undefined): void => {
  const userCustomerNumbers = userData?.customerNumbers.map(customer => customer.customerNumber)
  customerNumbers.value = userCustomerNumbers ?? []
  allAdminNumbers.value = userData?.administratedCustomerNumbers ?? []
  adminNumbers.value = filterAdminCustomerNumbers(
    userCustomerNumbers ?? [],
    userData?.administratedCustomerNumbers ?? []
  )

  store.selectedUserData = userData?.customerNumbers ?? []
}

// checks if customer number is also included in admin numbers.
function filterAdminCustomerNumbers(customerNumbers: number[], adminNumbers: number[]): number[] {
  return customerNumbers.filter(customerNumber => adminNumbers.includes(customerNumber))
}

function loadAccounts(): void {
  store.getAccounts(adminNumbers.value, apiClients.default, t).catch(() => {
    dispatchErrorMessage({
      title: t('tabs.accounts.notifications.loadAccounts.error.title'),
      text: t('tabs.accounts.notifications.loadAccounts.error.message'),
      duration: 5000,
    })
  })
}

function onAccountCreated(mode: 'edit' | 'create', email: string): void {
  const title =
    mode === 'create'
      ? t('tabs.accounts.notifications.accountCreate.success.title')
      : t('tabs.accounts.notifications.accountEdit.success.title')

  const text =
    mode === 'create'
      ? t('tabs.accounts.notifications.accountCreate.success.message', { email })
      : t('tabs.accounts.notifications.accountEdit.success.message', { email })

  dispatchSuccessMessage({
    title,
    text,
    duration: SUCCESS_NOTIFICATION_DURATION,
  })

  createFormOpen.value = false
  loadAccounts()
}

const { dispatchSuccessMessage, dispatchErrorMessage } = useMessage()

function onAccountDeleted(email: string | null): void {
  if (email) {
    dispatchSuccessMessage({
      title: t('tabs.accounts.notifications.accountDelete.success.title'),
      text: t('tabs.accounts.notifications.accountDelete.success.message', { email }),
      duration: SUCCESS_NOTIFICATION_DURATION,
    })
  } else {
    dispatchErrorMessage({
      title: t('tabs.accounts.notifications.accountDelete.error.title'),
      text: t('tabs.accounts.notifications.accountDelete.error.message'),
      duration: ERROR_NOTIFICATION_DURATION,
    })
  }

  loadAccounts()
}

function getNotificationIcon(notificationType: 'success' | 'error'): string {
  switch (notificationType) {
    case 'success':
      return 'check-circle'
    case 'error':
      return 'exclamation-circle'
    default:
      return 'info-circle'
  }
}
</script>

<template>
  <feature :name="featureName" :key="key">
    <div class="relative">
      <div class="flex flex-col gap-4 pt-8">
        <div class="flex justify-end">
          <VcButtonPrimary v-if="isAdmin" class="px-6" @click="createFormOpen = true">
            <font-awesome-icon class="icon text-white" size="lg" :icon="['fal', 'plus']" />
            <span class="pl-2">{{ t('tabs.accounts.button.newAccount') }}</span>
          </VcButtonPrimary>
        </div>
        <!-- Info / error messages -->
        <MessageBox v-if="messageBox" :config="messageBox"></MessageBox>
        <!-- List of account-->
        <AccountList
          v-if="isAdmin && isUserDataAvailable"
          :editable="isSingleCustomerSelected"
          :adminNumbers="allAdminNumbers"
          :customerNumbers="customerNumbers"
          @account-deleted="onAccountDeleted"
          @sidebarClosedOnSave="onAccountCreated"
        ></AccountList>
        <!-- Side modal for user invitation form-->
        <VcSideModal
          class="apps-user-account-details"
          :isOpen="createFormOpen"
          :width="'500px'"
          :isRight="true"
        >
          <AccountCreationForm
            :adminCustomerNumbers="allAdminNumbers"
            @close-modal="createFormOpen = false"
            @closeOnSave="onAccountCreated"
          ></AccountCreationForm>
        </VcSideModal>
      </div>
      <VcHeartSpinner
        v-show="store.loading && !store.loadError"
        class="absolute z-auto bg-background"
      ></VcHeartSpinner>
    </div>
  </feature>
</template>
