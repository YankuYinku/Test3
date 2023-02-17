import { BasketSummary } from '@/models/basketSummary'
import { BasketDetails } from '@/models/basketDetails'

export interface IRootState {
  root: boolean
  orderOverviewLink?: string
  basketLink?: string

  summaryData: BasketSummary
  detailedData: BasketDetails

  open?: boolean
  needUpdate: boolean
  groupsView: boolean
}
