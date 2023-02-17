<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PrismicRichText } from '@prismicio/vue'
import { faTimes } from '@fortawesome/pro-light-svg-icons'
import { VcImg, VcButtonPrimary } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  modelValue: boolean
  content: any
}>()

const emit = defineEmits(['update:modelValue'])

function closeModal(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <TransitionRoot as="template" :show="props.modelValue">
    <Dialog as="div" class="apps-navigation" @close="closeModal">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div
          class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
            >&#8203;</span
          >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              class="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg bg-white px-6 py-10 text-left align-middle shadow-xl transition-all md:max-w-2xl"
            >
              <div class="absolute top-3 right-3">
                <VcButtonPrimary
                  @click="closeModal"
                  class="flex h-7 w-7 items-center justify-center rounded-full border border-primary-500 bg-primary-200 text-primary-500 hover:bg-primary-300 hover:text-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  has-custom-background-color
                  has-custom-focus
                  has-custom-text-color
                >
                  <font-awesome-icon :icon="faTimes" class="-mb-0.5" />
                </VcButtonPrimary>
              </div>
              <div class="flex items-center">
                <div class="h-36 w-36 flex-initial flex-shrink-0 md:h-48 md:w-48">
                  <vc-img class="h-36 w-36 md:h-48 md:w-48" :src="content?.foto?.url" alt="" />
                </div>
                <div class="ml-4 text-gray-900">
                  <p class="pb-3 text-xl">
                    <prismic-rich-text :field="content?.headline"></prismic-rich-text>
                  </p>
                  <p class="pb-1 text-gray-500">
                    <prismic-rich-text :field="content?.hinweistext"></prismic-rich-text>
                  </p>
                  <p>
                    <a
                      :href="`mailto:${content?.email}`"
                      class="focus:outline-none text-primary hover:text-primary-dark"
                      >{{ content?.email }}</a
                    >
                  </p>
                  <p>
                    <a
                      :href="`tel:${content?.phone.trim()}`"
                      class="focus:outline-none text-primary hover:text-primary-dark"
                      >{{ content?.phone }}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
