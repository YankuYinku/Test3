import { useNavigation } from '@/composables/navigation'

describe('Navigation composable', () => {
  it('Should return hasSecondaryNavigation and hasFooterNavigation computed properties', () => {
    const result = useNavigation({ primaryNavItems: [] })

    expect(result).toHaveProperty('hasSecondaryNavigation')
    expect(result).toHaveProperty('hasFooterNavigation')
    expect(result.hasSecondaryNavigation.value).toEqual(false)
    expect(result.hasFooterNavigation.value).toEqual(false)
  })

  it('Should have secondary navigation', () => {
    const result = useNavigation({ primaryNavItems: [], secondaryNavItems: [{ href: '/' }] })

    expect(result).toHaveProperty('hasSecondaryNavigation')
    expect(result).toHaveProperty('hasFooterNavigation')
    expect(result.hasSecondaryNavigation.value).toEqual(true)
    expect(result.hasFooterNavigation.value).toEqual(false)
  })

  it('Should have footer navigation', () => {
    const result = useNavigation({ primaryNavItems: [], footerNavItems: [{ href: '/' }] })

    expect(result).toHaveProperty('hasSecondaryNavigation')
    expect(result).toHaveProperty('hasFooterNavigation')
    expect(result.hasSecondaryNavigation.value).toEqual(false)
    expect(result.hasFooterNavigation.value).toEqual(true)
  })
})
