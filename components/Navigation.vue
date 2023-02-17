<script lang="ts" setup>
import { ref, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export interface RouteTarget {
  name: string
}

export interface Tab {
  name: string
  to: RouteTarget
}

const { t } = useI18n()

defineProps<{ tabs: Tab[] }>()

const router = useRouter()

const currentTab = ref<RouteTarget>({ name: router.currentRoute.value.name as string })

const onChange = e => {
  router.push({ name: e.target.value })
}
</script>

<template>
  <div>
    <div class="sm:hidden">
      <label for="tabs" class="sr-only">{{ t('tabs.screenReader.selectTab') }}</label>
      <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
      <select
        id="tabs"
        name="tabs"
        class="focus:outline-none block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        @change="onChange"
      >
        <option
          v-for="tab in tabs"
          :key="tab.name"
          :selected="{ name: currentTab }"
          :value="tab.to.name"
        >
          {{ tab.name }}
        </option>
      </select>
    </div>
    <div class="hidden sm:block">
      <div>
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <router-link
            v-for="tab in tabs"
            active-class="border-primary-500 text-primary-500"
            :key="tab.name"
            :to="tab.to"
            v-slot="{ isActive }"
            class="whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            :aria-current="isActive ? 'page' : undefined"
          >
            {{ tab.name }}
          </router-link>
        </nav>
      </div>
    </div>
  </div>
</template>
