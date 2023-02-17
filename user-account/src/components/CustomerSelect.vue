<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CustomerModel } from '@/models/customer.model'
import { defineProps, defineEmits } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/solid'
import { computed } from '@vue/reactivity'

const { t } = useI18n({
  inheritLocale: true,
})

const props = defineProps<{ customers: CustomerModel[]; selected: CustomerModel | undefined }>()
const emits = defineEmits(['selectedCustomerChanged'])

const selected = computed(() => props.selected)

function onChange(customer: CustomerModel) {
  emits('selectedCustomerChanged', customer.id)
}
</script>

<template>
  <!-- No customer-->
  <div v-if="customers.length === 0" class="flex items-center">
    <span
      class="focus:outline-none relative w-full cursor-default rounded-full bg-white py-2 px-4 text-left shadow focus:rounded-t-3xl sm:text-sm"
    >
      {{ t('CustomerSelection.NoCustomers') }}
    </span>
  </div>
  <!-- One customer-->
  <div v-else-if="customers?.length === 1" class="flex items-center">
    <span class="pr-2 text-sm">{{ t('CustomerSelection.SingleCustomerLabel') }}:</span>
    <span
      class="focus:outline-none relative w-full cursor-default rounded-full bg-white py-2 px-4 text-left shadow focus:rounded-t-3xl sm:text-sm"
    >
      {{ customers[0].label ? customers[0].label : customers[0].customerNumber }}
    </span>
  </div>
  <!-- Multiple customers-->
  <div v-else class="flex items-center">
    <span class="pr-2 text-sm">{{ t('CustomerSelection.MultipleCustomerLabel') }}:</span>
    <Listbox
      v-slot="{ open }"
      as="div"
      class="w-40"
      :model-value="selected"
      @update:model-value="onChange"
    >
      <div class="relative">
        <ListboxButton
          :class="[open ? 'rounded-2xl' : 'rounded-full']"
          class="can-open focus:outline-none relative w-full cursor-default rounded-2xl bg-white py-2 pl-3 pr-10 text-left shadow focus:rounded-t-3xl sm:text-sm"
        >
          <div class="flex items-center">
            <span
              class="inline-block h-3 w-3 flex-shrink-0 rounded-full"
              :style="{ backgroundColor: selected?.color }"
            >
            </span>
            <span class="ml-3 block truncate">
              {{
                t(
                  (selected?.label && selected?.label.length
                    ? selected?.label
                    : selected?.customerNumber) ?? ''
                )
              }}
            </span>
          </div>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon v-show="!open" class="h-5 w-5 text-gray-500" aria-hidden="true" />
            <ChevronUpIcon v-show="open" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </span>
        </ListboxButton>
        <ListboxOptions
          class="focus:outline-none absolute z-10 max-h-60 w-full list-none overflow-auto rounded-b-2xl bg-white px-0 py-0 shadow sm:text-sm"
        >
          <ListboxOption
            v-for="customer in customers"
            v-slot="{ active, selected }"
            as="template"
            :key="customer.customerNumber"
            :value="customer"
          >
            <li
              :class="[
                active ? 'bg-apetitoGray-light' : 'text-gray-900',
                'relative cursor-pointer select-none py-2 pl-3 pr-9',
              ]"
            >
              <div class="flex items-center">
                <span
                  aria-hidden="true"
                  :style="{ backgroundColor: customer?.color }"
                  :class="['inline-block h-3 w-3 flex-shrink-0 rounded-full']"
                ></span>
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">
                  {{
                    t(
                      customer?.label && customer?.label.length
                        ? customer?.label
                        : customer?.customerNumber
                    )
                  }}
                </span>
              </div>

              <span
                v-if="selected"
                :class="[
                  active ? 'text-white' : 'text-indigo-600',
                  'absolute inset-y-0 right-0 flex items-center pr-4',
                ]"
              >
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </div>
    </Listbox>
  </div>
</template>

<style scoped>
.can-open[aria-expanded='true'] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
