<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <Popover class="relative" v-slot="{ open }">
    <PopoverButton
      class="focus:outline-none icon-lg flex place-content-center place-items-center gap-6 rounded-full bg-white p-2 px-2.5 text-left text-xl text-gray-700 antialiased shadow hover:text-primary"
      :class="open && 'text-primary'"
    >
      <font-awesome-icon :icon="['fal', 'bell']"></font-awesome-icon>
    </PopoverButton>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform translate-y-3 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-50"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-3 opacity-0"
    >
      <PopoverPanel class="absolute right-0 z-10 mt-4 max-w-xs">
        <div
          class="shadow-account flex h-60 w-60 items-center justify-center bg-white p-4 text-sm font-semibold text-gray-500"
        >
          {{ t('Feature.UnderDevelopment') }}
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
