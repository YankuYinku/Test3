import { computed, ComputedRef } from 'vue'
import { INavigationItem } from '@/components/navigation/types'

type ComponentProps<PropNames extends string = string> = Readonly<{
  [key in PropNames]?: unknown
}>

export interface NavigationProps extends ComponentProps {
  primaryNavItems: INavigationItem[]
  secondaryNavItems?: INavigationItem[]
  footerNavItems?: INavigationItem[]
}

interface NavigationComposable {
  hasSecondaryNavigation: ComputedRef<boolean>
  hasFooterNavigation: ComputedRef<boolean>
}

export function useNavigation(props: NavigationProps): NavigationComposable {
  const hasSecondaryNavigation = computed(() => {
    return !!(props.secondaryNavItems as INavigationItem[])?.length
  })

  const hasFooterNavigation = computed(() => {
    return !!(props.footerNavItems as INavigationItem[])?.length
  })

  return {
    hasSecondaryNavigation,
    hasFooterNavigation,
  }
}
