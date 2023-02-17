<script lang="ts" setup>
import FaqSlice from '@/components/slices/FaqSlice.vue'
import FaqVideoSlice from '@/components/slices/FaqVideoSlice.vue'
import { useStore } from '@/stores'
import { VcItemsList } from '@apetito/components-ui-vue3'
import FaqModalContent from '@/components/FaqModalContent.vue'

const store = useStore()
</script>

<template>
  <div class="flex flex-col gap-8 bg-faq-light-blue p-14">
    <section>
      <VcItemsList
        details-class="apps-faq"
        auto-scroll
        show-next-and-prev
        :items="store.getFaqList"
        :use-groups="true"
      >
        <!-- Group Header -->
        <template #group:header="{ group, index }">
          <h3 class="mt-6" :class="{ firstGroup: index === 0 }">{{ group.title }}</h3>
        </template>

        <!-- List Item -->
        <template v-slot:item="{ item }">
          <FaqSlice v-if="item.slice_type === 'faq'" :slice="item"></FaqSlice>
          <FaqVideoSlice v-else :slice="item"></FaqVideoSlice>
        </template>

        <!-- Modal content-->
        <template #modal:content="{ item }">
          <FaqModalContent :item="item"></FaqModalContent>
        </template>
      </VcItemsList>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.firstGroup {
  @apply mt-0;
}
</style>
