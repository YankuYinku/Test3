<script lang="ts" setup>
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ref, defineProps, computed, Ref, withDefaults, defineEmits, watch } from 'vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/solid'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Role } from '@/models/user-account.interface'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/stores/accounts-store'

const props = withDefaults(
  defineProps<{
    customerNumberRole: Role
    disabled: boolean
  }>(),
  { disabled: false }
)

const emit = defineEmits<{
  (event: 'role-change', role: string): void
}>()

const store = useStore()

const { t } = useI18n()

// account role select box value
const selectedType: Ref<Role> = ref(props.customerNumberRole)

// related icon to user account role.
const roleIcon: Ref<string> = computed(() => {
  const role = store.roles.find(accountRole => accountRole.role === selectedType.value)
  return role ? role.icon : 'user'
})

const roleDescription: Ref<string> = computed(() => {
  const role = store.roles.find(accountRole => accountRole.role === selectedType.value)
  return role ? role.description : t('tabs.accounts.roleDescription.notAvailable')
})

watch(selectedType, value => {
  emit('role-change', value)
})

watch(
  () => props.customerNumberRole,
  value => {
    selectedType.value = value
  }
)
</script>

<template>
  <Listbox
    v-model="selectedType"
    v-slot="{ open }"
    class="relative -mt-px max-w-64"
    :disabled="disabled"
    @click.prevent.stop=""
  >
    <div class="relative mt-1">
      <div class="flex items-center gap-2">
        <Popover v-slot="{ open }" class="relative">
          <PopoverButton class="p-1" :class="open ? '' : 'text-opacity-90'">
            <font-awesome-icon
              class="icon text-gray-500"
              size="lg"
              :icon="['fal', 'info-circle']"
            />
          </PopoverButton>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <PopoverPanel class="role-description absolute left-1/2 z-10 transform px-4 sm:px-0">
              <div class="flex place-items-center gap-8 bg-white px-3 py-2 text-gray-500 shadow-lg">
                <div>
                  <h3>{{ t(`tabs.accounts.roleDescription.title`) }}</h3>
                  <p class="text-primary-500">
                    {{ t(`tabs.accounts.roles.${customerNumberRole}`) }}
                  </p>
                </div>
                <p class="text-xs">
                  {{ roleDescription }}
                </p>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <ListboxButton
          class="relative w-full cursor-default py-2 pl-3 pr-10 text-left sm:text-sm"
          :class="{ 'rounded-full bg-white shadow-md': !disabled }"
        >
          <div class="flex items-center gap-2">
            <span
              ><font-awesome-icon class="icon text-gray-200" size="md" :icon="['fal', roleIcon]"
            /></span>
            <span class="block truncate">{{ t(`tabs.accounts.roles.${selectedType}`) }}</span>
            <span
              v-if="!disabled"
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronDownIcon v-show="!open" class="h-5 w-5 text-gray-500" aria-hidden="true" />
              <ChevronUpIcon v-show="open" class="h-5 w-5 text-gray-500" aria-hidden="true" />
            </span>
          </div>
        </ListboxButton>
        <ListboxOptions
          class="focus:outline-none absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm"
        >
          <ListboxOption
            v-for="role in store.roles"
            v-slot="{ active, selected }"
            as="template"
            :key="role.role"
            :value="role.role"
          >
            <li
              class="flex gap-2"
              :class="[
                active || selected
                  ? 'bg-amber-100 text-primary-500 focus:text-primary-500'
                  : 'text-gray-900',
                'relative cursor-pointer select-none py-2 px-4',
              ]"
            >
              <font-awesome-icon
                class="icon text-gray-200"
                size="md"
                :icon="['fal', role.icon]"
                :class="
                  active || selected ? 'text-primary-500 hover:text-primary-500' : 'text-gray-900'
                "
              />
              <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                {{ t(`tabs.accounts.roles.${role.role}`) }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </div>
    </div>
  </Listbox>
</template>

<style lang="scss" scoped>
.role-description {
  transform: translateX(calc(-100% - 40px)) translateY(-80%);
  width: 30vw;
  min-width: 300px;
  max-width: 450px;
}
</style>
