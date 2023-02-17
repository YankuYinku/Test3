<script lang="ts" setup>
import { useStore } from '@/stores'
import { VcItemsList } from '@apetito/components-ui-vue3'
import FaqSlice from '@/components/slices/FaqSlice.vue'
import FaqVideoSlice from '@/components/slices/FaqVideoSlice.vue'
import FaqModalContent from '@/components/FaqModalContent.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-8 bg-faq-light-blue p-14">
    <section>
      <VcItemsList
        details-class="apps-faq"
        show-next-and-prev
        auto-scroll
        :items="store.groupsWithFirstThreeTopics"
        :use-groups="true"
      >
        <!-- Group Header -->
        <template #group:header="{ group, index }">
          <div class="flex items-center gap-3 mt-6" :class="{ firstGroup: index === 0 }">
            <h3>{{ group.title }}</h3>
            <router-link
              @click="store.activeGroup = group"
              class="mt-0.5 text-sm text-primary hover:text-primary-dark hover:underline"
              :to="{ name: 'faq', hash: group.slug }"
            >
              <span>{{ t('Faq.Overview.ShowAllLink') }}</span>
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="icon ml-1" size="sm" />
            </router-link>
          </div>
        </template>

        <!-- List Item -->
        <template v-slot:item="{ item }">
          <FaqSlice v-if="item.slice_type === 'faq'" :slice="item"></FaqSlice>
          <FaqVideoSlice v-else :slice="item"></FaqVideoSlice>
        </template>

        <!-- Modal Content -->
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
