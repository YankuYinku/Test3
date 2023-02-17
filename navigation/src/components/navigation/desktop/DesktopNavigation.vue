<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import NavigationItem from '@/components/navigation/NavigationItem.vue'
import { useI18n } from 'vue-i18n'
import { defineProps, nextTick, ref, toRefs, defineEmits } from 'vue'
import { NavigationProps, useNavigation } from '@/composables/navigation'
import { INavigationItem } from '@/components/navigation/types'
import { getImprintUrl } from '@apetito/portal-sdk-common'
import { navigateTo } from '@/utils/navigation'
import useStore from '@/stores'
import { storeToRefs } from 'pinia'
import * as prismic from '@prismicio/client'
import env from '@/utils/env'

const store = useStore()
const { t, locale } = useI18n()
const props = defineProps<{
  primaryNavItems: INavigationItem[]
  secondaryNavItems?: INavigationItem[]
  footerNavItems?: INavigationItem[]
}>()

const emit = defineEmits<{
  (e: 'activeMenuItemChanged', menuItem: INavigationItem): void
}>()

const { primaryNavItems, secondaryNavItems, footerNavItems } = toRefs(props)
const { hasSecondaryNavigation, hasFooterNavigation } = useNavigation(props as NavigationProps)
const { isMenuOpen } = storeToRefs(store)
const searchWrapper = ref()

const repositoryName = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
const endpoint = prismic.getEndpoint(repositoryName)
const client = prismic.createClient(endpoint)
const termsOfServicePrismicType = 'tos'

const tosURL = ref('/')
const tosLoaded = ref(false)

client.getByType(termsOfServicePrismicType, { lang: locale.value }).then(data => {
  tosURL.value = data.results[0].data.tos.url
  tosLoaded.value = true
})

const focusSearch = () => {
  toggleDesktopMenu()

  nextTick(() => {
    searchWrapper.value.search.focus()
  })
}
const toggleDesktopMenu = async () => {
  const state = !isMenuOpen.value
  store.menuOpen = state

  window.dispatchEvent(
    new CustomEvent('toggle:navigation', {
      detail: {
        state,
      },
    })
  )
}
</script>

<template>
  <div
    :class="['desktop-menu-wrapper', isMenuOpen && 'expanded md:w-80', !isMenuOpen && 'md:w-20']"
  >
    <div :class="[isMenuOpen && 'overflow-hidden']">
      <div class="flex flex-1 flex-col px-3.5 pt-4 pb-12">
        <div class="flex w-73 flex-shrink-0 items-center justify-between px-2.5">
          <div class="flex items-center gap-5 overflow-hidden">
            <a href="/" @click.prevent="navigateTo('/')">
              <img
                class="h-8 w-8 min-w-8 object-contain"
                src="@/assets/svg/apetito-heart.svg"
                :alt="t('navigation.header.apetito')"
              />
            </a>
            <a
              href="/"
              :class="[
                'opacity-1 flex items-baseline transition-opacity',
                !isMenuOpen && 'invisible opacity-0',
              ]"
              @click.prevent="navigateTo('/')"
            >
              <span class="text-lg text-primary-500">
                {{ t('navigation.header.my') }}
              </span>
              <span class="text-3xl font-semibold text-primary-500">.</span>
              <span class="text-3xl font-semibold text-red-500">
                {{ t('navigation.header.apetito') }}
              </span>
            </a>
          </div>
        </div>
        <div class="mt-1 flex h-8 flex-row-reverse px-2 xl:col-span-6">
          <button class="nav-toggle" @click="toggleDesktopMenu">
            <span class="block w-full text-center">
              <span class="sr-only">{{
                isMenuOpen ? t('navigation.collapse') : t('navigation.expand')
              }}</span>
              <font-awesome-icon
                :icon="['fal', !isMenuOpen ? 'angle-double-right' : 'angle-double-left']"
                size="lg"
                aria-hidden="true"
              ></font-awesome-icon>
            </span>
          </button>
        </div>

        <!--nav class="mt-5 space-y-2.5 bg-white px-1.5">
          <navigation-item
            v-if="!isMenuOpen"
            class="search-trigger"
            :item="{ icon: ['fal', 'search'], href: '#' }"
            :hide-text="!isMenuOpen"
            @click.prevent="focusSearch"
          >
            <span class="opacity-1 transition-opacity">
              {{ t('navigation.search.label') }}
            </span>
          </navigation-item>
          <search-input
            v-else
            ref="searchWrapper"
            :class="[isMenuOpen ? 'visible' : 'invisible']"
          ></search-input>
        </!--nav-->

        <nav class="mt-1 space-y-2.5 bg-white px-1.5">
          <navigation-item
            v-for="item in primaryNavItems"
            :key="`${item.applicationName}-${item.name}-${item.active}`"
            :item="item"
            :hide-text="!isMenuOpen"
            @click="() => emit('activeMenuItemChanged', item)"
          >
            <span class="opacity-1 transition-opacity"> {{ item.name }} </span>
          </navigation-item>
        </nav>

        <nav v-if="hasSecondaryNavigation" class="space-y-2.5 bg-white px-1.5">
          <div class="my-2.5">
            <div class="h-px bg-apetitoGray"></div>
          </div>
          <navigation-item
            v-for="item in secondaryNavItems"
            :key="`${item.applicationName}-${item.name}-${item.active}`"
            :item="item"
            :hide-text="!isMenuOpen"
            @click="() => emit('activeMenuItemChanged', item)"
          >
            <span class="opacity-1 transition-opacity">
              {{ item.name }}
            </span>
          </navigation-item>
        </nav>

        <div class="footer-menu">
          <a href="/" class="w-12.75 max-w-full flex-shrink-0" @click.prevent="navigateTo('/')">
            <img
              class="w-14"
              src="@/assets/svg/apetito.svg"
              loading="lazy"
              :alt="t('navigation.header.myApetito')"
            />
          </a>
          <div
            v-if="hasFooterNavigation"
            :class="[
              'opacity-1 flex flex-1 justify-end gap-2.5 transition-opacity',
              !isMenuOpen && 'invisible opacity-0',
            ]"
          >
            <a
              class="text-sm text-apetitoGray hover:underline"
              target="_blank"
              :href="getImprintUrl()"
            >
              {{ t('navigation.items.imprint') }}
              <font-awesome-icon
                :icon="['fal', 'external-link']"
                size="xs"
                aria-hidden="true"
              ></font-awesome-icon>
            </a>
            <a
              v-if="tosLoaded"
              class="text-sm text-apetitoGray hover:underline"
              target="_blank"
              :href="tosURL"
            >
              {{ t('navigation.items.tos') }}
              <font-awesome-icon
                :icon="['fal', 'external-link']"
                size="xs"
                aria-hidden="true"
              ></font-awesome-icon>
            </a>
            <a
              v-for="item in footerNavItems"
              class="text-sm text-apetitoGray hover:underline"
              :key="`${item.applicationName}-${item.name}-${item.active}`"
              :href="item.href"
              @click.prevent="navigateTo(item.href)"
            >
              {{ item.name }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.desktop-menu-wrapper {
  @apply hidden h-screen transition-width md:inset-y-0 md:flex md:flex-col;

  > div {
    @apply relative flex min-h-0 flex-1 flex-col border-r bg-white shadow-sm;
  }

  .nav-toggle {
    @apply focus:outline-none outline-none inline-flex w-8
    items-center rounded-full border-none bg-transparent
    p-2 px-2.5 py-1 font-medium
    text-gray-700 shadow-none focus:ring-2 focus:ring-main;
  }

  .footer-menu {
    @apply absolute bottom-0 left-0 right-px flex
    items-center justify-between overflow-hidden whitespace-nowrap
    bg-white p-3.5;
  }
}
</style>
