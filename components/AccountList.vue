<script lang="ts" setup>
import { Role, UserAccountModel } from '@/models/user-account.interface'
import { useStore } from '@/stores/accounts-store'
import { AccountCommand } from '@/types/commands'
import { VcItemsList } from '@apetito/components-ui-vue3'
import { NormalizedCacheObject } from '@apollo/client/cache'
import { ApolloClient } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { defineEmits, defineProps, inject } from 'vue'
import AccountCreationForm from './AccountCreationForm.vue'
import AccountListItem from './base/AccountListItem.vue'
import ConfirmationModal from './base/ConfirmationModal.vue'
import { useConfirmationModal } from '@/composables/confirmation-modal'
import { useI18n } from 'vue-i18n'
import { reinviteUser } from '@/graphql/accounts'
import { SUCCESS_NOTIFICATION_DURATION, ERROR_NOTIFICATION_DURATION } from '@/const/notifications'
import { useMessage } from '@apetito/portal-sdk-common'

const { dispatchSuccessMessage, dispatchErrorMessage } = useMessage()
const store = useStore()

const { t } = useI18n()

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const props = defineProps<{
  editable: boolean
  customerNumbers: number[]
  adminNumbers: number[]
}>()

const { onClose, confirm, isOpen, modalMessage, modalTitle1, modalTitle2, objectiveText } =
  useConfirmationModal()

const emit = defineEmits<{
  (e: 'account-deleted', email: string | null): void
  (e: 'sidebarClosedOnSave', mode: 'create' | 'edit', email: string): void
}>()

function onAccountCommand({
  command,
  user,
  value,
}: {
  command: AccountCommand
  user: UserAccountModel
  value?: unknown
}): void {
  switch (command) {
    case 'delete':
      {
        // only delete those customerNumbers that are right now selected (customer number selector on top)
        const customerNumbersToDelete = user.customerNumbers
          .filter(numberRole => props.customerNumbers.includes(numberRole.customerNumber))
          .map(numberRole => numberRole.customerNumber)

        const noMoreCustomerNumbersLeft =
          customerNumbersToDelete.length === user.customerNumbers.length

        Promise.resolve(
          noMoreCustomerNumbersLeft
            ? confirm(
                t('tabs.accounts.modals.deleteAll.title1'),
                t('tabs.accounts.modals.deleteAll.message', {
                  name: `${user.firstName} ${user.lastName}`,
                })
              )
            : confirm(
                t('tabs.accounts.modals.delete.title1'),
                t('tabs.accounts.modals.delete.message'),
                t('tabs.accounts.modals.delete.title2'),
                `${user.firstName} ${user.lastName}`
              )
        )
          .then(() => {
            return store
              .deleteAccount(user.id, customerNumbersToDelete, apiClients.default)
              .then(() => {
                emit('account-deleted', user.email)
              })
              .catch(() => {
                emit('account-deleted', null)
              })
          })
          .catch(() => {
            // user cancelled delete
          })
      }
      break
    case 'changeRole': {
      // save current role to reset it back to this value if the user cancels the role change
      const currentRole = store.roleOfCustomerNumberFromAccount(props.customerNumbers[0], user.id)

      // set the value optimistically, we roll it back if the user cancels / or an error occurs
      store.setRole(user.id, value as Role)

      confirm(
        t('tabs.accounts.modals.rolechange.title'),
        t('tabs.accounts.modals.rolechange.message', {
          username: `${user.firstName} ${user.lastName}`,
          role: t(`tabs.accounts.roles.${value}`),
        })
      )
        .then(() => {
          return store
            .changeRole(user.id, props.customerNumbers[0], value as Role, apiClients.default)
            .then(() => {
              dispatchSuccessMessage({
                title: t('tabs.accounts.notifications.roleChange.success.title'),
                text: t('tabs.accounts.notifications.roleChange.success.message', {
                  name: `${user.firstName} ${user.lastName}`,
                  role: t(`tabs.accounts.roles.${value}`),
                }),
                duration: SUCCESS_NOTIFICATION_DURATION,
              })
            })
            .catch(() => {
              dispatchErrorMessage({
                title: t('tabs.accounts.notifications.roleChange.error.title'),
                text: t('tabs.accounts.notifications.roleChange.error.message', {
                  name: `${user.firstName} ${user.lastName}`,
                }),
                duration: ERROR_NOTIFICATION_DURATION,
              })
              // set back role to role before
              currentRole && store.setRole(user.id, currentRole)
            })
        })
        .catch(() => {
          // user cancelled, so we roll back to the role before
          currentRole && store.setRole(user.id, currentRole)
        })

      break
    }
    case 'reinvite': {
      apiClients.default
        .mutate({ mutation: reinviteUser, variables: { userId: user.id } })
        .then(() => {
          dispatchSuccessMessage({
            title: t('tabs.accounts.notifications.reinvite.success.title'),
            text: t('tabs.accounts.notifications.reinvite.success.message', { email: user.email }),
            duration: SUCCESS_NOTIFICATION_DURATION,
          })
        })
        .catch(() => {
          dispatchErrorMessage({
            title: t('tabs.accounts.notifications.reinvite.error.title'),
            text: t('tabs.accounts.notifications.reinvite.error.message', { email: user.email }),
            duration: ERROR_NOTIFICATION_DURATION,
          })
        })
      break
    }
    default:
      // nothing
      break
  }
}

function onEditAccount(mode: 'create' | 'edit', email: string) {
  emit('sidebarClosedOnSave', mode, email)
}
</script>
<template>
  <ConfirmationModal
    :is-open="isOpen"
    :title1="modalTitle1"
    :title2="modalTitle2"
    :modal-text="modalMessage"
    :objective="objectiveText"
    @close="event => onClose(event.reason)"
  ></ConfirmationModal>
  <div class="flex w-full flex-col gap-4">
    <VcItemsList
      class="flex-grow"
      details-class="apps-user-account-details"
      :items="store.accounts"
      :showNextAndPrev="false"
    >
      <template v-slot:item="{ item }">
        <AccountListItem
          class="pointer-events-auto"
          :editable="editable"
          :user-account="item"
          :current-customer-numbers="customerNumbers"
          @account-command="onAccountCommand"
        ></AccountListItem
      ></template>
      <template #modal:content="{ item, closeModal }">
        <AccountCreationForm
          :user-account="item"
          :admin-customer-numbers="adminNumbers"
          @close-modal="closeModal"
          @close-on-save="
            (mode, email) => {
              onEditAccount(mode, email)
              closeModal()
            }
          "
        ></AccountCreationForm>
      </template>
    </VcItemsList>
  </div>
</template>
