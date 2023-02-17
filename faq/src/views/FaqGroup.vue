<script lang="ts" setup>
import FaqHeaderTopics from '@/components/FaqHeaderTopics.vue'
import FaqList from '@/components/FaqList.vue'
import { useStore } from '@/stores'
import { VcHeartSpinner } from '@apetito/components-ui-vue3'
import { onBeforeMount } from 'vue'
import { dispatchNavigationData } from '@apetito/portal-sdk-common'

const store = useStore()

onBeforeMount(() => {
  dispatchNavigationData('@apetito/faq')
})
</script>

<template>
  <div v-if="store.loading" class="relative h-144 max-h-screen bg-beige-500">
    <VcHeartSpinner class="absolute"></VcHeartSpinner>
  </div>
  <template v-else>
    <FaqHeaderTopics></FaqHeaderTopics>
    <FaqList></FaqList>
  </template>
</template>
