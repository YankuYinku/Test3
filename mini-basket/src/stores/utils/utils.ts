import { BasketSummaryGroupIcon, GroupSummary } from '@/models/basketSummary'
import { BasketGroup } from '@/models/shared'
import { ItemQuantity, ItemSharedProperties } from '@/models/basketDetails'
import { useCurrencyFormat } from '@/utils/currency'
import { useStore } from '@/stores'

export type BasketVisualGroup = GroupSummary & {
  icon: string
  name: string
  totalPrice: number | string
  key: string
}

export type BasketVisualItem = {
  thumbnailPath: string
  positionId: string
  articleNumber: string
  shortDescription: string
  freeOfChargeQuantity?: number
  quantity: ItemQuantity
  shoppingUnitPrice: number
  key: string
}

export type IndividualBasketVisualItem = {
  type: 'individual' | 'group'
  data: BasketVisualItem | BasketVisualGroup
}

export type BasketItems = {
  individualItems: IndividualBasketVisualItem[]
  groups: IndividualBasketVisualItem[]
}

export const getSummaryGroups = (): IndividualBasketVisualItem[] => {
  const store = useStore()

  return Object.keys(store.summaryData)
    .filter(key => key !== 'summary')
    .map((key): IndividualBasketVisualItem => {
      const storeObject = store.summaryData[key as BasketGroup] || {}

      return {
        type: 'group',
        data: {
          ...storeObject,
          icon: getSummaryGroupIcon(key as BasketGroup),
          name: key,
          key,
          totalPrice: useCurrencyFormat(storeObject?.total || 0),
        },
      }
    })
    .filter(basketGroup => (basketGroup.data as BasketVisualGroup).count > 0)
}

export const getSummaryGroupIcon = (groupName: BasketGroup): string => {
  return BasketSummaryGroupIcon[groupName]
}

export const getIndividualBasketItems = (): BasketItems => {
  const store = useStore()
  const { detailedData, groupsView } = store
  const result: BasketItems = {
    individualItems: [],
    groups: [],
  }

  if (groupsView) {
    result.groups = getSummaryGroups()

    return result
  }

  const items = new Map<string, IndividualBasketVisualItem>()

  const addIndividualItemToItemsMap = (item: ItemSharedProperties) => {
    const existingItem =
      (items.has(item.articleNumber) && items.get(item.articleNumber)) || undefined

    if (existingItem) {
      item.quantity.amount += (existingItem.data as BasketVisualItem).quantity.amount
    }

    items.set(item.articleNumber, {
      type: 'individual',
      data: {
        ...item,
        key: item.positionId,
      },
    })
  }

  const itemsToAdd = [
    ...(detailedData?.blocks?.menuPlanner?.menuPlans || []).map(menuPlan => menuPlan.items).flat(),
    ...(detailedData?.blocks?.ibsAlaCarte?.tableGuests || [])
      .map(tableGuest => tableGuest.items)
      .flat(),
    ...(detailedData?.blocks?.directOrder?.items || []),
    ...(detailedData?.blocks?.material?.items || []),
  ]

  itemsToAdd.forEach(addIndividualItemToItemsMap)

  result.individualItems = Array.from(items, ([, item]) => ({ ...item }))

  detailedData?.blocks?.hawa?.totals?.countPieces &&
    result.groups.push({
      type: 'group',
      data: {
        count: detailedData?.blocks?.hawa?.totals?.countPieces,
        icon: getSummaryGroupIcon(BasketGroup.MERCHANDISE),
        name: 'hawaFF',
        totalPrice: useCurrencyFormat(detailedData?.blocks?.hawa?.totals?.totalPriceNet || 0),
      } as BasketVisualGroup,
    })

  return result
}
