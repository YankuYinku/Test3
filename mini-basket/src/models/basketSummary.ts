import { BasketGroup } from '@/models/shared'

export type GroupSummary = {
  positionCount: number
  count: number
  total: number
}

export enum BasketSummaryGroupIcon {
  apetito = 'soup',
  hawaFF = 'tag',
  material = 'layer-group',
}

/* This will raise a compiler error when not all values from
 * ProductCategory enum are valid keys of the ProductCategoryIcon enum.
 * */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _basketGroupTypingCheck = typeof BasketSummaryGroupIcon[BasketGroup]

export type BasketSummary = Record<BasketGroup, GroupSummary> & { summary: GroupSummary }
