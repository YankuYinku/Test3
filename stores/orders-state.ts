import {
  ApetitoOrderDetails,
  ArticleAvailability,
  HawaOrderDetails,
  OrderGroup,
} from '@/models/order'
import { SupplierSummarization } from '@/models/supplier'
import dayjs from 'dayjs'
import { IUserData } from 'portal-sdk-common'

type OrderPageFilters = {
  searchTerm: string
  customerNumber: number | undefined
  status: boolean | undefined
  supplier: string | undefined
  orderDateFrom: string | undefined
  orderDateTo: string | undefined
}

export type OrdersState = {
  orderGroups: OrderGroup[]
  currentFilters: OrderPageFilters
  loading: boolean
  totalPages: number
  totalItems: number
  totalItemsInAllCategories: number
  currentPage: number
  selectedCustomerNumbers: IUserData[]
  detailsLoading: boolean
  suppliers: SupplierSummarization[]
  articleAvailability: ArticleAvailability[]
  articleAvailabilityLoading: boolean
  apetitoOrderDetails: ApetitoOrderDetails | null
  hawaOrderDetails: HawaOrderDetails | null
  articleAvailabilityChecked: boolean
  addArticlesToBasketLoading: boolean
}

export default (): OrdersState => {
  const now = dayjs()

  return {
    orderGroups: [],
    loading: false,
    totalPages: 0,
    totalItems: 0,
    totalItemsInAllCategories: 0,
    currentPage: 1,
    currentFilters: {
      searchTerm: '',
      customerNumber: undefined,
      status: undefined,
      supplier: undefined,
      orderDateFrom: now.subtract(30, 'days').toISOString(),
      orderDateTo: now.toISOString(),
    },
    selectedCustomerNumbers: [],
    detailsLoading: false,
    suppliers: [],
    apetitoOrderDetails: null,
    hawaOrderDetails: null,
    articleAvailabilityChecked: false,
    articleAvailability: [],
    articleAvailabilityLoading: false,
    addArticlesToBasketLoading: false,
  }
}
