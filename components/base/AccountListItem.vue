<script lang="ts" setup>
import { UserAccountModel } from '@/models/user-account.interface'
import { defineProps, defineEmits, computed } from 'vue'
import AccountStatus from './AccountStatus.vue'
import AccountCustomerNumberList from './AccountCustomerNumberList.vue'
import AccountListItemContextMenu from './AccountListItemContextMenu.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AccountRoleSelector from './AccountRoleSelector.vue'
import { AccountCommand } from '@/types/commands'
import { useI18n } from 'vue-i18n'
import { getApplicationStaticAssetPath } from '@apetito/portal-sdk-common'
import env from '@/utils/env'

const props = defineProps<{
  userAccount: UserAccountModel
  currentCustomerNumbers: number[]
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (
    event: 'account-command',
    payload: { command: AccountCommand; user: UserAccountModel; value?: unknown }
  ): void
}>()

const submenuEntries = computed(() => [
  {
    title: t('tabs.accounts.contextMenu.edit'),
    icon: 'pen',
    onClick: () => emit('account-command', { command: 'edit', user: props.userAccount }),
    display: false,
  },
  {
    title: t('tabs.accounts.contextMenu.inviteAgain'),
    icon: 'envelope-open-text',
    onClick: () => emit('account-command', { command: 'reinvite', user: props.userAccount }),
    display: props.userAccount.status === 'Invited',
  },
  {
    title: t('tabs.accounts.contextMenu.delete'),
    icon: 'trash-alt',
    onClick: () => emit('account-command', { command: 'delete', user: props.userAccount }),
    display: true,
  },
])

const isSap = computed(() => props.userAccount.isSap)

const editable = computed(() => props.currentCustomerNumbers.length === 1)

const roleSelectorGridSize = computed(() => {
  return editable.value ? 'minmax(12rem, 0.5fr)' : '0fr'
})

const customerNumbersGridSize = computed(() => {
  return editable.value ? '0.3fr' : '0.7fr'
})

const customerNumberStyles = computed(() => {
  return editable.value ? 'span 1' : 'span 2'
})

const customerNumberToEdit = computed(() => {
  if (!props.currentCustomerNumbers || props.currentCustomerNumbers.length > 1) {
    return undefined
  }

  return props.currentCustomerNumbers[0]
})

const customerNumbers = computed(() => {
  return props.userAccount.customerNumbers.map(customerNumber => customerNumber.customerNumber)
})

const roleOfCustomerNumberToEdit = computed(() => {
  const custNumberRole = props.userAccount.customerNumbers.find(
    customerNumberRole => customerNumberRole.customerNumber === customerNumberToEdit.value
  )
  return custNumberRole?.role
})

function onRoleChange(role: string) {
  emit('account-command', { command: 'changeRole', user: props.userAccount, value: role })
}

const iconUrl = computed(() => {
  let filename: string

  switch (roleOfCustomerNumberToEdit.value) {
    case 'Administrator':
      filename = 'img/icon_admin.png'
      break
    case 'Orderer':
      filename = 'img/icon_orderer.png'
      break
    default:
      filename = 'img/icon_unknown.png'
  }

  // special case SAP users
  if (props.userAccount.isSap) {
    filename = 'img/icon_unknown_locked.png'
  }

  return getApplicationStaticAssetPath(filename, 'user-account-details', env.NODE_ENV)
})
</script>

<template>
  <!-- Click stop in next line until sidebar is available-->
  <div class="account-item">
    <div class="user-icon w-16 px-2"><img :src="iconUrl" /></div>
    <div class="username font-bold">
      {{ props.userAccount.firstName }} {{ props.userAccount.lastName }}
    </div>
    <div class="email text-sm text-gray-500" :title="props.userAccount.email">
      {{ props.userAccount.email }}
    </div>
    <AccountCustomerNumberList
      class="customer-numbers"
      :customer-numbers="customerNumbers"
      :highlighted-number="customerNumberToEdit"
    ></AccountCustomerNumberList>
    <AccountRoleSelector
      v-if="editable"
      class="account-selector justify-self-left"
      :key="roleOfCustomerNumberToEdit"
      :disabled="!editable || isSap"
      :customer-number-role="roleOfCustomerNumberToEdit!"
      @role-change="onRoleChange"
    ></AccountRoleSelector>
    <AccountStatus class="account-status" :status="props.userAccount.status"></AccountStatus>
    <AccountListItemContextMenu
      class="context-menu w-11 px-4"
      :context-menu-entries="submenuEntries"
      :disabled="isSap"
    ></AccountListItemContextMenu>
    <div class="arrow px-4">
      <font-awesome-icon
        class="icon text-gray-200 group-hover:text-primary"
        size="2x"
        :icon="['fal', 'angle-right']"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.account-item {
  display: grid;
  gap: 1rem;
  align-items: center;
  grid-template-columns:
    [userIcon] min-content
    [username] minmax(8rem, 0.6fr)
    [email] minmax(8rem, 0.6fr)
    [customerNumbers] v-bind(customerNumbersGridSize)
    [roleSelector] v-bind(roleSelectorGridSize)
    [status] minmax(7rem, 0.4fr)
    [contextMenu] 0.1fr
    [arrow] min-content;

  .user-icon {
    display: none;
  }
  .username {
    grid-column: userIcon / email;
  }

  .customer-numbers {
    grid-column: v-bind(customerNumberStyles);
  }

  .email {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@media screen and (min-width: 1600px) {
  .account-item {
    .user-icon {
      display: block;
    }
    .username {
      grid-column: username / email;
    }
  }
}
</style>
