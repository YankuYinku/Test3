export type OrderDateRange =
  | 'last 30 days'
  | 'last 3 month'
  | 'last 6 months'
  | 'this year'
  | 'last year'

export type StatusCodes = 'Failed' | 'InProgress' | 'SucceededPartially' | 'Succeeded'

export type Order = {
  id: string // uuid
  supplier: string
  orderDate: string // date and time,
  deliveryDate: string // date and time,
  customerNumber: number
  orderPositionCount: number
  status: StatusCodes
  totalAmount: number
  name?: string // optional name for the order, the custom can set when the order is created
}

export type OrderGroup = {
  id: number
  group: unknown
  items: Order[]
}

export type ApetitoOrderPosition = {
  id: number
  orderId: number
  articleId: string
  amount: number
  quantity: number
  consumptionDay: number
  sizeIndex: number
  menuPlanComponentOrderId: number
  comment: string
  title: string
  plannedQuantity: number
  stockQuantity: number
  showPriceInConfirmation: boolean
  tableGuestId: string
  consumptionDate: string
}

export type ApetitoOrderDetails = {
  header: {
    id: string
    customerNumber: number
    orderDate: string
    deliveryDate: string
    approval: boolean
    exported: boolean
    status: boolean // probably deprecated (Mathias Fenger)
    deliveryToCustomerNumber: string
    deliveryMaterialToCustomerNumber: string
    comment: string
    externalComment: string
    email: string
    totalAmount: number
    orderPositionCount: number
  }
  positions: ApetitoOrderPosition[]
}

export type HawaOrderPosition = {
  articleId: number
  articleNumber: string
  category: string
  supplierId: number
  orderingUnitId: number
  positionNr: number
  description: string
  quantity: number
  priceNet: number
  vat: number
  priceGross: number
  vatPercent: number
  positionNetPrice: number
  positionGrossPrice: number
  positionVat: number
  comment: string
  basicSalesUnit: string
  basicQuantity: number
  available: boolean
  errorCode: string
}

export type ApetitoOrderDetailsResponse = {
  apetitoOrderDetails: ApetitoOrderDetails
}

export type HawaOrderDetailsResponse = {
  hawaOrderDetails: HawaOrderDetails
}

export type HawaOrderDetails = {
  id: number
  orderNumber: string
  email: string
  customer: {
    id: number
    isValid: boolean
  }
  supplier: {
    id: number
    apetitoCreditorId: number
    apetitoCreditorNr: string
    name: string
    street: string
    city: string
    zip: string
    vatId: string
  }
  description: string
  orderDate: string
  deliveryDate: string
  isSelfpayer: boolean
  totals: {
    totalQuantity: number
    totalNetPrice: number
    totalGrossPrice: number
    totalVat: number
    totalVat7Price: number
    totalVat19Price: number
    includedVat19: number
    includedVat7: number
  }
  status: {
    orderId: number
    errorMessage: string
    isAcceptedByDistributor: boolean
    acceptedDistributor: string
    isSendToSupplier: boolean
    sendToSupplier: string
  }
  orderPositions: HawaOrderPosition[]
  failedOrderPositions: HawaOrderPosition[]
  errorCode: string
  hasOrderPositionsWithErrorCodes: boolean
}

export type ArticleAvailability = {
  articleId: string
  amount: number
  available: boolean
}

export type ArticleWithQuantityDtoInput = {
  articleNumber: string
  quantity: number
}

export type ArticleWithAllowedQuantityDto = {
  articleNumber: string
  allowedQuantity: number
}

export type AvailabilityCheckResultDto = {
  checkArticlesAvailability: {
    available: ArticleWithAllowedQuantityDto[]
    notAvailable: ArticleWithAllowedQuantityDto[]
  }
}

export type HawaAvailabilityCheckResultDto = {
  checkHawaArticlesAvailability: {
    available: string[]
    notAvailable: string[]
  }
}

export type AddItemsToBasketResultDto = {
  succeededArticles: string[]
  failedArticles: string[]
}

export type AddItemsToBasketHawaResultDto = {
  addItemsToBasketHawa: {
    succeededArticles: string[]
    failedArticles: string[]
  }
}

export type AddItemToBasketRequestModel = {
  articleId: string
  quantity: number
  sortiment: string
}

export type AddItemToBasketHawaRequestModelInput = {
  articleNumber: string
  quantity: number
  supplierId: number
}
