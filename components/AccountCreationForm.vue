<script lang="ts" setup>
import {
  reactive,
  ref,
  defineEmits,
  inject,
  defineProps,
  computed,
  Ref,
  watch,
  ComputedRef,
  nextTick,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { VcSelect } from '@apetito/components-ui-vue3'
import MultiSelect from './base/MultiSelect.vue'
import { required, email, helpers } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { VcButtonPrimary } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ApolloClient } from '@apollo/client/core/ApolloClient'
import { NormalizedCacheObject } from '@apollo/client/cache'
import { ApolloClients } from '@vue/apollo-composable'
import { editUser } from '@/graphql/accounts'
import { useStore } from '@/stores/accounts-store'
import { CustomerNumberRole, Role, UserAccountModel } from '@/models/user-account.interface'
import MessageBox from './base/MessageBox.vue'
import { MessageType } from '@/types/message'
import { useFocus } from '@vueuse/core'
import { ERROR_NOTIFICATION_DURATION, WARN_NOTIFICATION_DURATION } from '@/const/notifications'
import { useMessage } from '@apetito/portal-sdk-common'

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const { t } = useI18n()
const { dispatchSuccessMessage, dispatchWarnMessage, dispatchErrorMessage } = useMessage()
const store = useStore()

const props = defineProps<{
  adminCustomerNumbers: number[]
  userAccount?: UserAccountModel // only set in edit mode
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'closeOnSave', mode: 'create' | 'edit', email: string): void
}>()

// when a user account is defined we are in edit mode
const isEditMode = computed(() => !!props.userAccount)

const isLocked = computed(() => props.userAccount?.isSap)

// reference to the first input, which should receive focus on form opening
const focusInput = ref()
useFocus(focusInput, { initialValue: true })

// create or edit is loading
const loading = ref(false)

const formData = reactive({
  firstName: isEditMode.value ? props.userAccount?.firstName ?? '' : '',
  lastName: isEditMode.value ? props.userAccount?.lastName ?? '' : '',
  email: isEditMode.value ? props.userAccount?.email ?? '' : '',
  role: 'Orderer' as Role,
  customerNumbers: [] as string[],
})

const customerNumberOptions: ComputedRef<{ id: string; value: CustomerNumberRole }[]> = computed(
  () => {
    if (isEditMode.value) {
      return (
        getUserAndAdminNumbersMerged().map((num: CustomerNumberRole, index: number) => ({
          id: index.toString(),
          value: num,
        })) ?? []
      )
    } else {
      return props.adminCustomerNumbers?.map((num: number, index: number) => ({
        id: index.toString(),
        value: { customerNumber: num, role: formData.role } as CustomerNumberRole,
      }))
    }
  }
)

const unwatch = watch(
  customerNumberOptions,
  () => {
    if (customerNumberOptions.value) {
      formData.customerNumbers = getInititalCustomerNumbers()
    }
    nextTick(() => {
      unwatch()
    })
  },
  { immediate: true }
)

// preselected customer numbers ( edit mode only )
function getInititalCustomerNumbers(): string[] {
  if (isEditMode.value) {
    if (!props.userAccount?.customerNumbers) {
      return []
    } else {
      return (
        props.userAccount?.customerNumbers.map(
          option =>
            customerNumberOptions.value?.find(
              cusNum =>
                cusNum.value.customerNumber === option.customerNumber &&
                cusNum.value.role === option.role
            )?.id as string
        ) ?? []
      )
    }
  } else {
    // in create form the list is empty
    return []
  }
}

// merges the customer numbers with the customer numbers the user is admin for
function getUserAndAdminNumbersMerged() {
  const all = props.userAccount ? [...props.userAccount.customerNumbers] : []
  const newAdminNumbers =
    props.adminCustomerNumbers
      ?.filter(
        adminNumber =>
          !all.find(allItem => {
            return allItem.customerNumber === adminNumber
          })
      )
      .map(number => ({ customerNumber: number, role: formData.role } as CustomerNumberRole)) ?? []
  return all.concat(newAdminNumbers)
}

// Form validations used in create account form
const createValidations = {
  email: {
    required: helpers.withMessage(t('tabs.accounts.createForm.errors.email.required'), required),
    email: helpers.withMessage(t('tabs.accounts.createForm.errors.email.invalid'), email),
  },
  customerNumbers: {
    required: helpers.withMessage(
      t('tabs.accounts.createForm.errors.customerNumbers.required'),
      required
    ),
  },
}

// Form validations used in edit account form
const editValidations = {
  customerNumbers: {
    required: helpers.withMessage(
      t('tabs.accounts.createForm.errors.customerNumbers.required'),
      required
    ),
  },
}

const validationCreate$ = useVuelidate(createValidations, formData)
const validationEdit$ = useVuelidate(editValidations, formData)

const roles = ref([
  { name: t('tabs.accounts.roles.Orderer'), value: 'Orderer' },
  { name: t('tabs.accounts.roles.Administrator'), value: 'Administrator' },
])

function checkCustomerNumbers(): void {
  if (isEditMode.value) {
    validationEdit$.value.customerNumbers.$touch()
  } else {
    validationCreate$.value.customerNumbers.$touch()
  }
}

function submitForm(): void {
  if (isEditMode.value) {
    editAccount()
  } else {
    createAccount()
  }
}

function formNotValid() {
  dispatchWarnMessage({
    title: t('tabs.accounts.notifications.form.validation.error.title'),
    text: t('tabs.accounts.notifications.form.validation.error.message'),
    duration: WARN_NOTIFICATION_DURATION,
  })
}

function editAccount(): void {
  validationEdit$.value.$validate().then(valid => {
    if (valid) {
      loading.value = true

      const customerNumberRoleAssignments = customerNumberOptions.value
        .filter(option => {
          return formData.customerNumbers.includes(option.id)
        })
        .map(option => ({ ...option.value, role: formData.role }))

      return apiClients.default
        .mutate({
          mutation: editUser,
          variables: {
            userId: props.userAccount?.id,
            customerNumberRoleAssignments,
          },
        })
        .then(() => {
          loading.value = false
          emit('closeOnSave', 'edit', formData.email)
          resetForm()
        })
        .catch(() => {
          loading.value = false
          dispatchErrorMessage({
            title: t('tabs.accounts.notifications.accountEdit.error.title'),
            text: t('tabs.accounts.notifications.accountEdit.error.message', {
              email: formData.email,
            }),
            duration: ERROR_NOTIFICATION_DURATION,
          })
        })
    } else {
      formNotValid()
    }
  })
}

function createAccount(): void {
  validationCreate$.value
    .$validate()
    .then(valid => {
      if (valid) {
        loading.value = true
        const customerNumberRoleAssignments = customerNumberOptions.value
          .filter(option => {
            return formData.customerNumbers.includes(option.id)
          })
          .map(option => ({ ...option.value, role: formData.role }))

        store
          .inviteAccount(
            {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              customerNumberRoleAssignments,
            },
            apiClients.default
          )
          .then(() => {
            loading.value = false
            emit('closeOnSave', 'create', formData.email)
            resetForm()
          })
          .catch(() => {
            loading.value = false
            dispatchErrorMessage({
              title: t('tabs.accounts.notifications.accountCreate.error.title'),
              text: t('tabs.accounts.notifications.accountCreate.error.message'),
              duration: ERROR_NOTIFICATION_DURATION,
            })
          })
      } else {
        formNotValid()
      }
    })
    .catch(error => console.log(error))
}

const roleDescription: Ref<string> = computed(() => {
  const role = store.roles.find(accountRole => accountRole.role === formData.role)
  return role ? role.description : ''
})

const headline = computed(() =>
  isEditMode.value
    ? t('tabs.accounts.createForm.editCustomer')
    : t('tabs.accounts.createForm.newCustomer')
)

const saveButtonText = computed(() => {
  return isEditMode.value
    ? t('tabs.accounts.button.EditAccount')
    : t('tabs.accounts.button.createAccount')
})

const messageBox = computed((): { type: MessageType; text: string } | null => {
  if (props.userAccount?.isSap) {
    return { type: 'info', text: 'tabs.accounts.infos.notEditable' }
  }
  return null
})

function cancel(): void {
  resetForm()
  validationCreate$.value.$reset()
  close()
}

function close(): void {
  emit('closeModal')
}

function resetForm(): void {
  formData.firstName = ''
  formData.lastName = ''
  formData.role = 'Orderer'
  formData.email = ''
  formData.customerNumbers = []
  validationCreate$.value.$reset()
}

// used inside the multi select to build the string for the checkbox label
function customerNumberRoleValueMapper(value: unknown, checked: boolean): string {
  const customerNumberRole = value as CustomerNumberRole
  const translatedRole = t(`tabs.accounts.roles.${customerNumberRole.role}`)
  const result = customerNumberRole.customerNumber
  return checked ? `${result} (${translatedRole})` : `${result}`
}
</script>

<template>
  <div class="h-full">
    <!-- Close button -->
    <div v-if="!isEditMode" class="absolute top-4 right-10">
      <VcButtonPrimary
        class="flex h-7 w-7 items-center justify-center rounded-full border border-primary-500 bg-primary-200 text-primary-500 hover:bg-primary-300 hover:text-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        has-custom-background-color
        has-custom-focus
        has-custom-text-color
        @click="cancel"
      >
        <font-awesome-icon class="icon" size="sm" :icon="['fal', 'times']" />
      </VcButtonPrimary>
    </div>

    <div class="account-grid h-full">
      <!-- Form-->
      <div class="flex flex-col overflow-y-auto p-8 text-left">
        <MessageBox v-if="props.userAccount?.isSap" class="my-6" :config="messageBox"></MessageBox>
        <h2 class="mb-8 text-2xl">{{ headline }}</h2>
        <form id="account-creation" class="account-creation flex flex-col gap-4">
          <!-- FIRST NAME -->
          <div class="flex flex-col">
            <label for="firstName" class="font-bold">{{
              t('tabs.accounts.createForm.firstName')
            }}</label>
            <input
              v-if="!isEditMode"
              v-model="formData.firstName"
              ref="focusInput"
              class="input ring-0"
              name="firstName"
            />
            <p v-else class="text-md">{{ formData.firstName }}</p>
          </div>

          <!-- LAST NAME -->
          <div class="flex flex-col">
            <label for="surename" class="font-bold">{{
              t('tabs.accounts.createForm.lastName')
            }}</label>
            <input v-if="!isEditMode" v-model="formData.lastName" class="input" name="lastName" />
            <p v-else>{{ formData.lastName }}</p>
          </div>

          <!-- E-MAIL -->
          <div class="flex flex-col">
            <label for="email" class="font-bold">{{ t('tabs.accounts.createForm.email') }}</label>
            <input
              v-if="!isEditMode"
              v-model="formData.email"
              class="input"
              name="email"
              :class="{ error: validationCreate$.email.$error }"
              @blur="validationCreate$.email.$touch"
            />
            <p v-else>{{ formData.email }}</p>
            <template v-for="error in validationCreate$.email.$errors" :key="error.$uid">
              <div v-show="validationCreate$.email.$error" class="h-5 p-2 text-xs text-red-800">
                {{ error.$message }}
              </div>
            </template>
          </div>

          <!-- ROLE -->
          <div class="z-10 py-4">
            <h3 class="font-bold">{{ t('tabs.accounts.createForm.role') }}</h3>
            <VcSelect
              v-model="formData.role"
              item-value="value"
              item-text="name"
              :full-width="true"
              :disabled="isLocked"
              :items="roles"
            ></VcSelect>
            <div class="flex gap-2 pt-4 text-gray-500">
              <font-awesome-icon class="icon" size="md" :icon="['fal', 'info-circle']" />
              <p class="text-sm">{{ roleDescription }}</p>
            </div>
          </div>

          <!-- CUSTOMER NUMBERS -->
          <div>
            <h3 class="pb-4 font-bold">{{ t('tabs.accounts.createForm.customerNumber') }}</h3>
            <MultiSelect
              v-model:value="formData.customerNumbers"
              :options="customerNumberOptions"
              :value-mapper="customerNumberRoleValueMapper"
              :use-select-all="true"
              :disabled="isLocked"
              @update:value="checkCustomerNumbers"
            ></MultiSelect>
            <template v-for="error in validationCreate$.customerNumbers.$errors" :key="error.$uid">
              <div
                v-show="validationCreate$.customerNumbers.$error"
                class="h-5 p-2 text-xs text-red-800"
              >
                {{ error.$message }}
              </div>
            </template>
            <template v-for="error in validationEdit$.customerNumbers.$errors" :key="error.$uid">
              <div
                v-show="validationEdit$.customerNumbers.$error"
                class="h-5 p-2 text-xs text-red-800"
              >
                {{ error.$message }}
              </div>
            </template>
          </div>
        </form>
      </div>
      <!-- Submit form-->
      <div class="flex h-24 items-center justify-end gap-4 pr-8 shadow-3xl">
        <div class="cursor-pointer text-lg text-primary hover:text-primary-dark" @click="cancel">
          {{ t('tabs.accounts.createForm.cancel') }}
        </div>
        <VcButtonPrimary v-if="!isLocked" type="button" class="w-1/2 px-6" @click="submitForm">
          <template v-if="!loading">{{ saveButtonText }}</template>
          <svg
            v-else
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="spinner"
            class="w-6 animate-spin"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"
            ></path>
          </svg>
        </VcButtonPrimary>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-grid {
  display: grid;
  grid-template-rows: minmax(0, 100%) min-content;
}

.input {
  line-height: 1.3rem;
  padding: 0.5rem;
  border-radius: 5px;
  border: solid 1px #c7c5c0;
  background-color: #f6f6f6;

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    border-color: #60ae36;
    box-shadow: none;
  }

  &.error {
    border-color: rgba(153, 27, 27);
  }
}
</style>
