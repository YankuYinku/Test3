<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogTitle } from '@headlessui/vue'
import { defineProps, defineEmits, computed } from 'vue'
import { VcButtonPrimary } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  title1: string
  title2: string
  modalText: string
  cancelButtonText?: string
  okButtonText?: string
  objective: string
}>()

const okButton = computed(() => props.okButtonText ?? t('tabs.accounts.modals.confirm'))
const cancelButton = computed(() => props.cancelButtonText ?? t('tabs.accounts.modals.cancel'))

const emit = defineEmits<{
  (event: 'close', payload: { reason: 'ok' | 'cancel' }): void
}>()

function closeModal(reason: 'ok' | 'cancel') {
  emit('close', { reason })
}
</script>
<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog
      as="div"
      class="apps-user-account-details relative z-10 h-full w-full"
      @close="closeModal('cancel')"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
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
              class="w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all md:ml-72"
            >
              <div class="flex gap-4">
                <font-awesome-icon
                  class="icon text-3xl text-primary"
                  size="lg"
                  :icon="['fal', 'question-circle']"
                />
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  {{ props.title1 }} <span class="font-bold">{{ objective }}</span>
                  {{ props.title2 }}
                </DialogTitle>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-500">
                  {{ modalText }}
                </p>
              </div>

              <div class="mt-8 flex items-center justify-end gap-6">
                <a class="cursor-pointer px-6 text-primary" @click="closeModal('cancel')">
                  {{ cancelButton }}
                </a>
                <vc-button-primary class="px-6" type="button" @click="closeModal('ok')">
                  {{ okButton }}
                </vc-button-primary>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
