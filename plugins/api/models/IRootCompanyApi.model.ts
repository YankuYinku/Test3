import { AxiosResponse } from 'axios'
import { InjectionKey } from 'vue'

export interface IRootCompanyResult {
  customerNumber: number
  company: {
    customerNumber: number
    name: string
    name2: string
    name3: string
  }
  mainContactPerson: {
    customerNumber: number
    salutation: string
    firstName: string
    lastName: string
    emailAddress: string
  }
  deliveryAddress: {
    customerNumber: number
    address: string
    address2: string
    city: string
    zipCode: string
    federalRegion: string
  }
}

export interface IRootCompanyApiRoutes {
  getCompanyData: (customerNumber: number) => Promise<AxiosResponse<IRootCompanyResult>>
}

export const IRootCompanyKey: InjectionKey<Promise<IRootCompanyApiRoutes>> =
  Symbol('IRootCompanyApi')
