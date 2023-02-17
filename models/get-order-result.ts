import { Order } from './order'
import { SupplierSummarization } from './supplier'

export type GetOrderResult = {
  orders: {
    orders: Order[]
    overallItemsInAllCategories: number
    supplierSummarizations: SupplierSummarization[]
    overallPages: number
    overallResults: number
  }
}
