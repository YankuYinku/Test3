<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineExpose, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/navigation'

const { t } = useI18n()
const search = ref()
const searchQuery = ref('')

const submitSearch = () => {
  navigateTo(`/search?s=${searchQuery.value}`)
  searchQuery.value = ''
}

defineExpose({ search })
</script>

<template>
  <form class="w-full" @submit.prevent="submitSearch">
    <label for="search" class="sr-only">{{ t('navigation.search.label') }}</label>
    <div class="relative text-dark focus-within:text-main">
      <div
        class="h-9.5 w-9.5 pointer-events-none absolute inset-y-0 left-px pl-2 flex items-center"
      >
        <font-awesome-icon class="text-xl" aria-hidden="true" :icon="['fal', 'search']" />
      </div>
      <input
        v-model="searchQuery"
        id="search"
        name="search"
        ref="search"
        class="block w-full shadow-inner bg-apetitoGray-light border border-apetitoGray rounded-3xl py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-apetitoGray-dark focus:ring-1 focus:ring-main focus:border-main sm:text-sm"
        type="search"
        :placeholder="t('navigation.search.placeholder')"
      />
      <button
        :disabled="!searchQuery"
        :class="[
          'absolute ml-8 top-1.5 right-1.5 rounded-3xl text-white w-6.5 h-6.5',
          searchQuery ? 'bg-primary' : 'bg-apetitoGray',
        ]"
      >
        <font-awesome-icon :icon="['fal', 'long-arrow-right']"></font-awesome-icon>
      </button>
    </div>
  </form>
</template>
