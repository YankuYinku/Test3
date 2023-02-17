<script lang="ts" setup>
import { useStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const groupHasMultipleTopics = computed(
  () => store.activeGroup?.topics && store.activeGroup?.topics.length > 1
)
</script>

<template>
  <section class="sticky-header z-10 bg-faq-shadow-blue">
    <div class="absolute -mt-8 text-sm text-primary hover:text-primary-dark hover:underline">
      <router-link :to="{ name: 'faq' }">
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="icon mr-2" size="sm" />
        {{ t('Faq.GroupDetails.Header.BackLink') }}
      </router-link>
    </div>
    <h2 class="pb-6 text-3xl font-bold">
      {{ t('Faq.GroupDetails.Header.Headline') }}
      <br />
      <span class="text-primary-500">
        {{ store.activeGroup?.title }}
      </span>
    </h2>
    <div class="flex flex-wrap content-center gap-4">
      <router-link
        :to="{ name: 'faq', hash: store.activeGroup?.slug }"
        v-if="groupHasMultipleTopics"
        :class="[
          'cursor-pointer whitespace-nowrap rounded-full bg-white py-2 px-4 font-bold shadow hover:bg-main hover:text-white',
          store.activeTopic === null
            ? 'pointer-events-none bg-main text-white hover:cursor-default'
            : '',
        ]"
        @click="store.activeTopic = null"
        >{{ t('Faq.GroupDetails.Header.AllTopics') }}</router-link
      >
      <template v-if="groupHasMultipleTopics">
        <router-link
          v-for="topic in store.activeGroup?.topics"
          :key="topic.id"
          :to="{ name: 'faq', hash: `${store.activeGroup?.slug}/${topic.slug}` }"
          :class="[
            'cursor-pointer whitespace-nowrap rounded-full bg-white py-2 px-4 font-bold shadow hover:bg-main hover:text-white',
            store.activeTopic === topic
              ? 'pointer-events-none bg-main text-white hover:cursor-default'
              : '',
          ]"
        >
          {{ topic?.title }}
        </router-link>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sticky-header {
  top: var(--header-height);
  @apply sticky px-14 pt-14 pb-6;
  @media screen and (min-height: 1024px) {
    @apply pb-14;
  }
}
</style>
