<script lang="ts" setup>
import { defineProps } from 'vue'
import { PrismicRichText } from '@prismicio/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { VcPrismicRichTextWrapper } from '@apetito/components-ui-vue3'

const props = defineProps({
  item: Object,
})
</script>

<template>
  <div>
    <div class="py-2 sm:py-2">
      <div class="divide-y-2 divide-gray-200">
        <dl class="mt-2 space-y-6 divide-y divide-gray-200">
          <Disclosure as="div" class="" v-slot="{ open }">
            <dt>
              <DisclosureButton
                class="focus:outline-none flex w-full items-start justify-between border border-background bg-background px-4 py-1 text-left text-lg text-gray-900 transition-all duration-100 hover:border-gray-300 hover:bg-gray-300"
                :class="[open ? 'rounded-t-md' : 'rounded-md']"
              >
                <VcPrismicRichTextWrapper>
                  <prismic-rich-text
                    text-start
                    class="text-xl font-bold"
                    :field="props.item?.collapsible_title"
                  >
                  </prismic-rich-text>
                </VcPrismicRichTextWrapper>
                <span class="ml-2 flex h-7">
                  <ChevronDownIcon
                    aria-hidden="true"
                    :class="[
                      open ? '-rotate-180' : 'rotate-0',
                      'h-6 w-6 transform transition-all duration-100',
                    ]"
                  />
                </span>
              </DisclosureButton>
            </dt>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-98 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-out"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-98 opacity-0"
            >
              <DisclosurePanel as="dd" class="rounded-b-md border border-t-0 border-background py-2">
                <p class="mt-2 px-4 text-base text-gray-700">
                  <VcPrismicRichTextWrapper>
                    <prismic-rich-text :field="props.item?.collapsible_text"></prismic-rich-text>
                  </VcPrismicRichTextWrapper>
                </p>
              </DisclosurePanel>
            </transition>
          </Disclosure>
        </dl>
      </div>
    </div>
  </div>
</template>
