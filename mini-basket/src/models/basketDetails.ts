export type CommonTotals = {
  totalPriceNet: number
  countPieces: number
}

export type RegularTotals = Pick<CommonTotals, 'totalPriceNet'> & { count: number }

export type OrderRange = {
  from: string
  to: string
}

export type CartonTotals = {
  sizeIndex: number
  countCarton: number
}

export type BlockOptions = {
  relevantForDeliveryCosts: boolean
  useConsumptionOrderSelection?: boolean
}

export type BlockValidity = {
  isValid: boolean
  validationErrors: unknown[]
}

export type ItemSharedProperties = {
  thumbnailPath: string
  positionId: string
  articleNumber: string
  shortDescription: string
  freeOfChargeQuantity?: number
  quantity: ItemQuantity
  shoppingUnitPrice: number
}

export type DirectOrderItem = {
  sortimentCode: string
  sizeIndex: number
  isAlaCarteArticle: true
  prePackagingType: string
} & ItemSharedProperties

export type DirectOrderBlock = {
  totals: CommonTotals & CartonTotals
  items: DirectOrderItem[]
  options: BlockOptions
  validity: BlockValidity
}

export type HawaSupplierItem = {
  supplierArticleId: string
  valueAddedTax: number
  basicQuantity: number
  positionId: string
  articleNumber: string
  shortDescription: string
  quantity: Pick<ItemQuantity, 'amount'>
  shoppingUnitPrice: number
}

export type HawaSupplierCategory = {
  categoryName: string
  items: HawaSupplierItem[]
}

export type HawaSupplier = {
  supplierId: number
  supplierName: string
  totals: RegularTotals
  categories: HawaSupplierCategory[]
}

export type HawaOrderBlock = {
  suppliers: HawaSupplier[]
  totals: CommonTotals
  options: BlockOptions
  validity: BlockValidity
}

export type MaterialItem = {
  sortimentCode: string
  chargeableQuantity: number
} & ItemSharedProperties

export type MaterialOrderBlock = {
  items: MaterialItem[]
  totals: CommonTotals
  options: BlockOptions
  validity: BlockValidity
}

export type ItemWeight = {
  piecesPerShoppingUnit: number
  shoppingUnitWeight: number
  weightType: string
}

export type MenuPlanItem = {
  isAlaCarteArticle: boolean
  menuPlanComponentOrderId: number
  prePackagingType: string
  quantityNeeded: ItemQuantity
  sizeIndex: number
  stockQuantity: ItemQuantity
  weights: ItemWeight
} & ItemSharedProperties

export type MenuPlan = {
  isFixedPricePlan: boolean
  items: MenuPlanItem[]
  menuPlanId: number
  menuPlanName: string
  menuPlanUrl: string
  orderRange: OrderRange
  totals: RegularTotals
}

export type MenuPlannerOrderBlock = {
  menuPlans: MenuPlan[]
  dailyMenuPlans: unknown[]
  totals: CommonTotals & CartonTotals
  options: BlockOptions
  validity: BlockValidity
}

export type IbsAlaCarteOrderRange = {
  customerId: number
} & OrderRange

export type TableGuestAddress = {
  streetAndNumber: string
  city: string
  zipCode: string
}

export type ItemQuantity = {
  amount: number
  unit: string
}

export type IbsAlaCarteTableGuestItem = {
  consumptionDate: string
  sortimentCode: string
  prePackagingType: string
} & ItemSharedProperties

export type IbsAlaCarteTableGuest = {
  tableGuestId: string
  tableGuestNumber: string
  tableGuestName: string
  tableGuestSalutation: string
  totals: CommonTotals
  address: TableGuestAddress
  items: IbsAlaCarteTableGuestItem[]
}

export type IbsAlaCarteOrderBlock = {
  tableGuests: IbsAlaCarteTableGuest[]
  totals: CommonTotals & CartonTotals
  options: BlockOptions
  validity: BlockValidity
  orderRange: IbsAlaCarteOrderRange
}

export type BasketDetailsBlocks = {
  directOrder: DirectOrderBlock
  hawa: HawaOrderBlock
  material: MaterialOrderBlock
  menuPlanner: MenuPlannerOrderBlock
  ibsAlaCarte: IbsAlaCarteOrderBlock
}

export type CustomerDeliveryDebtors = {
  customerNumber: string
  customerDescription: string
  streetInfo: string
  cityInfo: string
  partnerRole: string
}

export type CustomerInformation = {
  customerNumber: string
  customerDescription: string
  deliveryDebtors: CustomerDeliveryDebtors[]
  isSemiCustomer: boolean
}

export type BasketDetailsTotals = Omit<CartonTotals, 'sizeIndex'> &
  CommonTotals & {
    totalPriceGross: number
    vatFoodPercent: number
    vatFood: number
    vatNonFoodPercent: number
    vatNonFood: number
    residualCostUntilFreeShipping: number
    shippingCost: number
  }

export type BasketDetails = {
  blocks?: BasketDetailsBlocks
  customerInformation?: CustomerInformation[]
  totals?: BasketDetailsTotals
}
