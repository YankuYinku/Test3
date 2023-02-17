<script lang="ts" setup>
import { useVideoEmbed } from '@/composables/videoEmbed'
import { Dialog, DialogOverlay } from '@headlessui/vue'
import { ref, defineProps } from 'vue'

const props = defineProps({
  open: Boolean,
  origWidth: Number,
  origHeight: Number,
  origEmbedHtml: String,
})

const container = ref()
const embedHtml = useVideoEmbed(
  container,
  props.origWidth!,
  props.origHeight!,
  props.origEmbedHtml!
)
</script>

<template>
  <Dialog class="apps-faq" :open="open" @close="$emit('close')">
    <div class="fixed inset-0 z-40 overflow-y-auto">
      <DialogOverlay class="fixed inset-0 bg-black opacity-30" />
      <div class="flex h-full content-center items-center justify-center">
        <div ref="container" class="isolate z-50 w-9/12 max-w-screen-lg">
          <div v-html="embedHtml" class="z-50"></div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
