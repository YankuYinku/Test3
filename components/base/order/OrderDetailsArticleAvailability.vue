<script lang="ts" setup>
import { ArticleAvailability } from '@/models/order'
import { useStore } from '@/stores/order-store'
import { VcHeartSpinner } from '@apetito/components-ui-vue3'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineProps } from 'vue'

const props = defineProps<{
  articleAvailability: ArticleAvailability | null
}>()

const store = useStore()
</script>

<template>
  <template v-if="store.articleAvailabilityLoading">
    <VcHeartSpinner
      v-show="true"
      class="small-spinner relative z-0 h-8 w-8 bg-opacity-0"
    ></VcHeartSpinner>
  </template>
  <template v-else>
    <!-- article was not returned from API so we don't know the status -->
    <font-awesome-icon
      v-if="props.articleAvailability === null"
      class="icon text-md text-main group-hover:text-primary"
      :icon="['fal', 'question-circle']"
    />
    <!-- article is actually available so we show the amount -->
    <div v-else-if="props.articleAvailability?.available">
      <span v-if="props.articleAvailability?.amount !== undefined">
        {{ props.articleAvailability?.amount }}
      </span>
      <font-awesome-icon
        v-else
        class="icon text-md text-main group-hover:text-primary"
        :icon="['fal', 'check-circle']"
      />
    </div>
    <!-- article was found, but is out of stock -->
    <font-awesome-icon
      v-else
      class="icon text-md text-red-500 group-hover:text-primary"
      :icon="['fal', 'times']"
    />
  </template>
</template>

<style scoped lang="scss">
.small-spinner {
  width: 50%;
  ::v-deep(.relative) {
    height: 1.5rem;
    width: 1.5rem;
    transform: unset;
  }
}
</style>
