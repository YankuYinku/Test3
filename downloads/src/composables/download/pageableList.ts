import { computed, ComputedRef, Ref } from 'vue'

type NavigationDirection = 'next' | 'previous'

export type HandleNavigationPayload = {
  direction: NavigationDirection
  outOfBounds: boolean
}

export const usePageableList = (
  page: Ref<number>,
  overallPages: Ref<number>,
  disable?: Ref<boolean>
) => {
  const handleNavigation = (payload: HandleNavigationPayload) => {
    if (payload.outOfBounds && !disable?.value) {
      page.value =
        payload.direction === 'next'
          ? Math.min(page.value + 1, overallPages.value)
          : Math.max(page.value - 1, 1)
    }
  }

  const disablePrev = computed(() => {
    return page.value === 1
  })

  const disableNext = computed(() => {
    return page.value === overallPages.value
  })

  return {
    handleNavigation,
    disablePrev,
    disableNext,
  }
}
