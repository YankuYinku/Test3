<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MobileNavigation from '@/components/navigation/mobile/MobileNavigation.vue'
import DesktopNavigation from '@/components/navigation/desktop/DesktopNavigation.vue'
import {
  CustomerChangedActionPayload,
  EntryPoint,
  FeatureResponse,
  getGrantedMeinApetitoApplications,
  getIbsscUrl,
  initFeatureFlags,
  MeinApetitoApplication,
  useEventBus,
  useNavigationData,
  usePermissions,
} from '@apetito/portal-sdk-common'
import env from '@/utils/env'
import {
  computed,
  defineProps,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
  onBeforeMount,
  onBeforeUnmount,
  provide,
} from 'vue'
import { INavigationItem } from './components/navigation/types'
import * as prismic from '@prismicio/client'
import { useRoute } from 'vue-router'
import IbsscIcon from '@/components/customIcons/IbsscIcon.vue'
import MsmIcon from '@/components/customIcons/MsmIcon.vue'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'
import { usePrioritizedLanguageCode } from '@/composables/languageCode'
import i18n from '@/i18n'

const { t } = useI18n()
const props = defineProps<{
  applications: MeinApetitoApplication[]
}>()
const route = useRoute()
let permissions = reactive<{ permissionCodes: string[] }>({ permissionCodes: [] })
const repositoryName = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
const endpoint = prismic.getEndpoint(repositoryName)
const client = prismic.createClient(endpoint)
const pageTitle = ref('')

const prepareNavigation = (items: INavigationItem[]) => {
  // accessing route.path here will re-evaluate navigation items when route changes.
  route.path
  if (permissions.permissionCodes.length === 0) return []

  const grantedApplications = getGrantedMeinApetitoApplications(
    props.applications,
    permissions.permissionCodes
  )

  return items
    .filter(nav =>
      grantedApplications.some(
        ga =>
          ga.name === nav.applicationName &&
          (!ga.entryPoints ||
            ga.entryPoints.length === 0 ||
            ga.entryPoints?.some(ep => ep.name === nav.entryPointName))
      )
    ) // set the right navi item active (according to current window.location)
    .map(item => {
      const meinApetitoApplication = props.applications.find(
        app => app.name === item.applicationName
      )
      const entryPoint = meinApetitoApplication?.entryPoints?.find(
        ep => ep.name === item.entryPointName
      )

      if (typeof meinApetitoApplication !== 'undefined' && meinApetitoApplication.isDefault) {
        item.href = '/'
      }

      if (
        typeof meinApetitoApplication !== 'undefined' &&
        !meinApetitoApplication.isDefault &&
        meinApetitoApplication.path
      ) {
        if (meinApetitoApplication.path.startsWith('/')) item.href = meinApetitoApplication.path
        else item.href = '/' + meinApetitoApplication.path

        if (typeof entryPoint !== 'undefined' && entryPoint.path) {
          if (entryPoint.path.startsWith('/') || entryPoint.path.startsWith('#'))
            item.href = item.href + entryPoint.path
          else item.href = item.href + '/' + entryPoint.path
        }
      }

      return item
    })
}

const unpreparedMainNavigationItems = ref<INavigationItem[]>()
const unpreparedSubNavigation = ref<INavigationItem[]>()
const mainNavigation = ref<INavigationItem[]>([])
const permissionBasedMainNav = computed<INavigationItem[]>(() => {
  return mainNavigation.value
})
const subNav = ref<INavigationItem[]>([])
const subNavigation = computed<INavigationItem[]>(() => {
  // accessing route.path here will re-evaluate subNavigation when route changes.
  route.path
  return subNav.value
})
const bottomNavigation = ref<INavigationItem[]>([
  {
    name: t('navigation.items.privacyPolicy'),
    applicationName: '@apetito/legal',
    href: '/privacy-policy',
  },
])
const accessibleNavigationItems = computed<INavigationItem[]>(() => {
  return [...permissionBasedMainNav.value, ...subNavigation.value, ...bottomNavigation.value]
})

const currentApplicationName = ref('')
// Contains the active menu item (looking into main and sub menu)
const activeMenuItem = computed(() => {
  return accessibleNavigationItems.value.find(page => page.active)
})

const navigationBus = useNavigationData(getCurrentInstance(), data => {
  currentApplicationName.value =
    data?.applicationName || activeMenuItem.value?.applicationName || ''

  const menuItems = [...permissionBasedMainNav.value, ...subNav.value, ...bottomNavigation.value]
  const activeItem = menuItems.find(item => item.active)

  if (activeItem && activeItem.applicationName !== currentApplicationName.value) {
    activeItem.active = false
  }

  const itemToActivate = menuItems.find(
    item => item.applicationName === currentApplicationName.value
  )
  if (itemToActivate) {
    itemToActivate.active = true
  }

  nextTick(() => {
    if (activeMenuItem.value) {
      activeItemChanged(activeMenuItem.value, navigationBus.pageTitle)
    }
  })
})

// Cut and paste these main navigation entries into the original array when this feature flag gets removed
initFeatureFlags([
  // We don't need it for now.
  // 'apetito.meinapetito.portal.useFullFeatureSet',
  'apetito.meinapetito.portal.menuplannerDashboard',
  'apetito.meinapetito.portal.msm',
  'apetito.meinapetito.portal.mylunch'
]).then((result: FeatureResponse[]) => {
  const [menuplannerFeatureResult, msmFeatureResult, mylunchFeatureResult] = result

  // Define menuplanner dashboard app only when the feature flag is enabled
  const menuplannerApp = menuplannerFeatureResult.value
    ? {
        name: t('navigation.items.menuPlan'),
        applicationName: '@apetito/menuplanner-dashboard',
        icon: ['fal', 'clipboard-list'],
      }
    : null

  // As we don't need this flag for now, we don't want it to block the other one. Will be clarified later
  const ibsscAppIndex = unpreparedMainNavigationItems.value.findIndex(
    app => app.applicationName === '@apetito/ibssc'
  )

  if (ibsscAppIndex >= 0) {
    unpreparedMainNavigationItems.value = [
      ...unpreparedMainNavigationItems.value.slice(0, ibsscAppIndex + 1),
      menuplannerApp as INavigationItem,
      ...unpreparedMainNavigationItems.value.slice(ibsscAppIndex + 1),
      // If menuplanner's feature flag is disabled it's going to be null - we need to filter it out.
    ].filter(Boolean)
  } else {
    // If ibssc app is unavailable, insert menuplanner right after the dashboard app (position one).
    unpreparedMainNavigationItems.value = [
      unpreparedMainNavigationItems.value[0],
      menuplannerApp as INavigationItem,
      ...unpreparedMainNavigationItems.value.slice(1),
      // If menuplanner's feature flag is disabled it's going to be null - we need to filter it out.
    ].filter(Boolean)
  }

  if (mylunchFeatureResult.value) {
      unpreparedMainNavigationItems.value.splice(1, 0, {
        name: t('navigation.items.mylunch'),
        applicationName: '@apetito/mylunch',
        icon: ['fal', 'utensils-alt'],
      },)
    }

  if (msmFeatureResult.value) {
    unpreparedMainNavigationItems.value.splice(1, 0, {
      name: t('navigation.items.menuServiceManager'),
      applicationName: '@apetito/menuservicemanager',
      customIcon: MsmIcon,
      icon: [],
    })
  }

  //TODO: TBD
  /*  if (fullFeatureSetResult.value) {
    unpreparedMainNavigationItems.value.push(
      ...[
        {
          name: t('navigation.items.merchandise'),
          applicationName: '@apetito/product-catalog',
          entryPointName: 'merchandise',
          icon: ['fal', 'tag'],
        },
      ]
    )
  }*/

  mainNavigation.value = prepareNavigation(unpreparedMainNavigationItems.value)
  subNav.value = prepareNavigation(unpreparedSubNavigation.value)
  activeItemChanged()
})

const eventBus = useEventBus<CustomerChangedActionPayload>(
  '@apetito/user-account',
  getCurrentInstance()
)
const userLanguageCode = ref(i18n.global.locale.value)

const provideUserLanguageCode = (payload: CustomerChangedActionPayload) => {
  const { languageCodes } = payload
  userLanguageCode.value = usePrioritizedLanguageCode(languageCodes)
  i18n.global.locale.value = userLanguageCode.value
}
const unsubscribeEventBus = eventBus.subscribeEventBusAction(event => {
  if (event?.type === 'CustomerChanged') {
    provideUserLanguageCode(event.payload)
  }
})

const initializeUnpreparedMenuEntries = () => {
  unpreparedMainNavigationItems.value = [
    {
      name: t('navigation.items.home'),
      applicationName: '@apetito/dashboard',
      icon: ['fal', 'home'],
    },
    {
      name: t('navigation.items.gnomeKitchen'),
      applicationName: '@apetito/ibssc',
      href: '/',
      promise: getIbsscUrl(),
      customIcon: IbsscIcon,
    },
    {
      name: t('navigation.items.products'),
      applicationName: '@apetito/product-catalog',
      entryPointName: 'food',
      icon: ['fal', 'soup'],
    },
    {
      name: t('navigation.items.materials'),
      applicationName: '@apetito/product-catalog',
      entryPointName: 'material',
      icon: ['fal', 'layer-group'],
    },

    {
      name: t('navigation.items.downloads'),
      applicationName: '@apetito/downloads',
      icon: ['fal', 'arrow-to-bottom'],
    },
  ]
  unpreparedSubNavigation.value = [
    {
      name: t('navigation.items.userAccount'),
      applicationName: '@apetito/user-account-details',
      entryPointName: 'my-company',
      icon: ['fal', 'user-chart'],
    },
    {
      name: t('navigation.items.seminars'),
      applicationName: '@apetito/seminars',
      href: env.VUE_APP_SEMINARS_URL,
      external: true,
      icon: ['fal', 'graduation-cap'],
    },
    {
      name: t('navigation.items.contact'),
      applicationName: '@apetito/contact-form',
      href: '/contact',
      icon: ['fal', 'phone'],
    },
    {
      name: t('navigation.items.help'),
      applicationName: '@apetito/faq',
      href: '/help',
      icon: ['fal', 'question-circle'],
    },
  ]
}

onBeforeMount(() => {
  eventBus.getEventBusPayload().then(payload => {
    provideUserLanguageCode(payload)
    initializeUnpreparedMenuEntries()
  })
})

onBeforeUnmount(() => {
  unsubscribeEventBus()
})

onMounted(async () => {
  const queryResult = await client.getByType('service_center_contact_doc')

  if (queryResult.results.length > 0 && queryResult.results[0]?.data) {
    const contactApp = subNavigation.value.find(
      app => app.applicationName === '@apetito/contact-form'
    )

    if (contactApp && queryResult.results[0]?.data?.foto?.url) {
      contactApp.icon = queryResult.results[0]?.data?.foto?.url
      contactApp.imageIcon = true
    }
  }

  const { granted } = usePermissions()

  permissions.permissionCodes = granted

  mainNavigation.value = prepareNavigation(unpreparedMainNavigationItems.value)
  subNav.value = prepareNavigation(unpreparedSubNavigation.value)

  activeItemChanged()
})

watch(
  [navigationBus, activeMenuItem],
  () => {
    pageTitle.value = navigationBus.pageTitle || activeMenuItem?.value?.name || ''
  },
  { deep: true }
)

// Checks against window.location if the given menu item is the active or not.
function isActiveMenuItem(item: INavigationItem, entryPoints?: EntryPoint[]): boolean {
  const currentPath = window.location.pathname
  const itemPath = item.href
  // only check with hashes if the hash actually has a value
  const hasHash = window.location.hash?.length > 0 && window.location.hash !== '#/'
  const locationIsRoot = currentPath === '/'
  const itemIsRoot = itemPath === '/'
  const pathWithHash = currentPath + window.location.hash

  if (locationIsRoot) {
    return itemIsRoot
  }

  const pageIsSubRoute = entryPoints
    ? entryPoints.map(entry => entry.path).includes(currentPath)
    : false

  if (pageIsSubRoute) {
    return true
  }

  const pathToCheck = hasHash ? pathWithHash : currentPath

  return !itemIsRoot && !!itemPath && pathToCheck.startsWith(itemPath)
}

// sets the clicked item in list to active
function activeItemChanged(item?: INavigationItem, title?: string): void {
  navigationBus.pageTitle = pageTitle.value = title || item?.name || navigationBus.pageTitle || ''
  currentApplicationName.value = item?.applicationName || navigationBus.currentApplicationName || ''

  const appHasMultipleNavItems =
    accessibleNavigationItems.value.filter(
      page => page.applicationName === currentApplicationName.value
    )?.length > 1

  accessibleNavigationItems.value.forEach(page => {
    const isMatchingPage =
      (item && page.applicationName && item.applicationName === page.applicationName) || false

    page.active = appHasMultipleNavItems ? isActiveMenuItem(page) : isMatchingPage

    if (page.active) {
      navigationBus.pageTitle = pageTitle.value = title || page.name || ''
    }
  })

  // if the item is not in the list, set it to active based on current path
  if (!activeMenuItem.value) {
    // sort the list by href length for best match.
    // Having menu items in default order might result in a wrong match because `/` would match `/products` for example.
    const sortedPages = accessibleNavigationItems.value.sort((a, b) => {
      if (a.href?.length === b.href?.length) {
        return 0
      }

      return (a.href?.length || 0) < (b.href?.length || 0) ? 1 : -1
    })

    let foundMatchingPage = false
    sortedPages.forEach(page => {
      if (foundMatchingPage) {
        return
      }

      page.active = isActiveMenuItem(page)
      foundMatchingPage = page.active
    })
  }
}

provide(UserLanguageInjectionKey, userLanguageCode)
</script>

<template>
  <div class="apps-navigation">
    <div class="relative z-40">
      <mobile-navigation
        :primary-nav-items="permissionBasedMainNav"
        :secondary-nav-items="subNavigation"
        :footer-nav-items="bottomNavigation"
      ></mobile-navigation>

      <desktop-navigation
        :primary-nav-items="permissionBasedMainNav"
        :secondary-nav-items="subNavigation"
        :footer-nav-items="bottomNavigation"
      ></desktop-navigation>
    </div>
  </div>

  <Teleport to="#page--title">
    <h1>
      {{ pageTitle }}
    </h1>
  </Teleport>
</template>

<style scoped lang="scss">
::v-deep(.search-trigger) {
  a {
    @apply shadow-inner ring-1 ring-apetitoGray;

    &:hover {
      @apply shadow-md ring-0;
    }
  }
}

@media screen and (max-height: 620px) {
  ::v-deep(nav.space-y-2\.5) {
    @apply space-y-1;
  }
}
</style>
