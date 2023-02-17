import { BasketRoute } from '../routes/Basket'
import { InjectionKey } from 'vue'

type ObjectKey = string | number | symbol

export type ApplicationAPIModule = {
  [key in ObjectKey]: unknown
}

export type ApplicationAPI = ApplicationAPIModule & BasketRoute

export const MiniBasketApiKey: InjectionKey<ApplicationAPI> = Symbol('MiniBasketApi')
