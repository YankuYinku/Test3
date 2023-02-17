<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import NavigationItem from '@/components/navigation/NavigationItem.vue'
import SearchInput from '@/components/search/SearchInput.vue'
import { defineProps, defineEmits, Ref, ref, toRefs, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NavigationProps, useNavigation } from '@/composables/navigation'
import { INavigationItem } from '@/components/navigation/types'
import { getImprintUrl } from '@apetito/portal-sdk-common'
import { navigateTo } from '@/utils/navigation'
import * as prismic from '@prismicio/client'
import env from '@/utils/env'

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
const sidebarOpen = ref(false)
const toggleMobileMenu = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const repositoryName = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
const endpoint = prismic.getEndpoint(repositoryName)
const client = prismic.createClient(endpoint)
const termsOfServicePrismicType = 'tos'
//this call should be combined with the call in the desktop navigation inside the app.vue
const tosURL = ref('/')
const tosLoaded = ref(false)

client.getByType(termsOfServicePrismicType, { lang: locale.value }).then(data => {
  tosURL.value = data.results[0].data.tos.url
  tosLoaded.value = true
})
</script>

<template>
  <div class="mobile-menu-wrapper">
    <div>
      <a href="/" class="flex items-baseline" @click.prevent="navigateTo('/')">
        <span class="text-lg text-primary-500">
          {{ t('navigation.header.my') }}
        </span>
        <span class="text-3xl font-semibold text-primary-500">.</span>
        <span class="text-3xl font-semibold text-red-500">
          {{ t('navigation.header.apetito') }}
        </span>
      </a>

      <button class="h-8 w-8 text-black" @click="toggleMobileMenu">
        <font-awesome-icon :icon="['fal', 'bars']"></font-awesome-icon>
      </button>
    </div>

    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="apps-navigation" @close="sidebarOpen = false">
        <div class="fixed inset-0 z-50 flex md:hidden">
          <TransitionChild
            as="template"
            enter="transition-opacity ease-linear duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-transparent bg-opacity-75" />
          </TransitionChild>
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <div class="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div class="flex min-h-0 flex-1 flex-col border-r bg-white shadow-sm">
                <div class="flex h-full flex-1 flex-col px-3.5 pt-4 pb-12">
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
                        class="opacity-1 flex items-center transition-opacity"
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
                    <button class="nav-trigger" @click="toggleMobileMenu">
                      <span class="block w-full text-center">
                        <span class="sr-only">
                          {{ t('navigation.collapse') }}
                        </span>
                        <font-awesome-icon
                          :icon="['fal', 'angle-double-left']"
                          size="lg"
                          aria-hidden="true"
                        ></font-awesome-icon>
                      </span>
                    </button>
                  </div>

                  <!--nav class="mt-5 space-y-2.5 bg-white px-1.5">
                    <search-input ref="searchWrapper"></search-input>
                  </!--nav-->

                  <nav class="mt-5 space-y-2.5 bg-white px-1.5">
                    <navigation-item
                      v-for="item in primaryNavItems"
                      :key="`${item.name}-${item.active}`"
                      :item="item"
                      @click="() => emit('activeMenuItemChanged', item)"
                    >
                      <span class="opacity-1 transition-opacity">
                        {{ item.name }}
                      </span>
                    </navigation-item>
                  </nav>

                  <nav v-if="hasSecondaryNavigation" class="mb-24 space-y-2.5 bg-white px-1.5">
                    <div class="my-2.5">
                      <div class="h-px bg-apetitoGray"></div>
                    </div>

                    <navigation-item
                      v-for="item in secondaryNavItems"
                      :key="`${item.name}-${item.active}`"
                      :item="item"
                      @click="() => emit('activeMenuItemChanged', item)"
                    >
                      <span class="opacity-1 transition-opacity">
                        {{ item.name }}
                      </span>
                    </navigation-item>
                  </nav>

                  <div class="footer-menu">
                    <a
                      href="/"
                      class="w-12.75 max-w-full flex-shrink-0"
                      @click.prevent="navigateTo('/')"
                    >
                      <img
                        class="w-14"
                        src="@/assets/svg/apetito.svg"
                        loading="lazy"
                        :alt="t('navigation.header.myApetito')"
                      />
                    </a>
                    <div
                      v-if="hasFooterNavigation"
                      class="opacity-1 flex flex-1 justify-end gap-2.5 transition-opacity"
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
                        :key="`${item.name}-${item.active}`"
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
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped lang="scss">
.mobile-menu-wrapper {
  > div {
    @apply fixed flex h-12 w-full justify-between bg-white
    py-2 px-4 shadow md:hidden;
  }
}

::v-deep {
  .nav-trigger {
    @apply focus:outline-none outline-none inline-flex w-8
    items-center rounded-full border-none
    bg-transparent p-2
    px-2.5 py-1
    font-medium text-gray-700 shadow-none focus:ring-2 focus:ring-main;
  }

  .footer-menu {
    @apply absolute bottom-0 right-px left-0 flex
    items-center justify-between overflow-hidden
    whitespace-nowrap bg-white p-3.5;
  }
}
</style>
