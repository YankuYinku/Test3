<script lang="ts" setup>
import FaqHeaderGroups from '@/components/FaqHeaderGroups.vue'
import FaqTopicOverviewList from '@/components/FaqTopicOverviewList.vue'
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
    <FaqHeaderGroups></FaqHeaderGroups>
    <FaqTopicOverviewList></FaqTopicOverviewList>
  </template>
</template>
