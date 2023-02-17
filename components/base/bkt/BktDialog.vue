<script lang="ts" setup>
import { VcButtonPrimary } from '@apetito/components-ui-vue3'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { defineEmits, defineProps, toRefs, watch, withDefaults } from 'vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    text: string
    confirmButtonText?: string
    cancelButtonText?: string
  }>(),
  {
    isOpen: false,
  }
)

const emit = defineEmits<{ (e: 'close', confirmed: boolean): void }>()

const { isOpen } = toRefs(props)

function close(confirmed: boolean): void {
  isOpen.value = false
  emit('close', confirmed)
}
</script>

<template>
  <TransitionRoot appear :show="props.isOpen" as="template">
    <Dialog as="div" class="apps-user-account-details" @close="close(false)">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 z-40 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                {{ props.title }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  <slot name="text">{{ props.text }}</slot>
                </p>
              </div>

              <div class="mt-4 flex items-center justify-end gap-2">
                <a class="cursor-pointer px-6 text-primary" @click="close(false)">
                  {{ props.cancelButtonText }}
                </a>

                <VcButtonPrimary class="px-4" @click="close(true)">
                  {{ props.confirmButtonText }}
                </VcButtonPrimary>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
