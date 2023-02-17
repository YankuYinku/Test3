import { defineStore } from 'pinia'
import { CustomerModel } from '@/models/customer.model'
import state from './state'
import { ICurrentUserData, IUserData, ISortiment, IPermission } from '@apetito/portal-sdk-common'
import { Supplier } from '@apetito/portal-sdk-common'

export * from '../models/user-account-model.interface'

const colors = [
  '#ababab',
  '#E34819',
  '#626eef',
  '#c6de41',
  '#B58BAB',
  '#1dad9b',
  '#f3d516',
  '#C4C4C0',
  '#CCA772',
]

const allCustomerModel: Omit<CustomerModel, 'id'> = {
  label: 'CustomerSelection.AllCustomersOption',
  customerNumber: 0,
  active: true,
}

export const useStore = defineStore('user-account', {
  state,
  actions: {
    getUserData(userData: ICurrentUserData) {
      if (userData) {
        this.userData = userData
      }
    },

    changeSelectedCustomer(id: number) {
      this.activeCustomerId = id
    },
  },
  getters: {
    // array of all available customer numbers.
    allCustomerNumbers: state =>
      state.userData?.customers?.map(customer => customer.customerNumber),

    getCustomerSelectOptions: state => {
      const all = state.userData?.customers?.map((customer, index: number) => {
        return {
          customerNumber: customer.customerNumber,
          label: customer.customerNumber.toString(),
        }
      })

      // add "all customers" select option in case more customers available
      const availableCustomers =
        state.userData?.customers?.length > 1 ? [allCustomerModel, ...all] : all
      // add ids at the end
      return availableCustomers?.map((customer, index: number) => ({
        ...customer,
        id: index,
        active: index === state.activeCustomerId,
        color: colors.length > index ? colors[index] : '#ffffff',
      }))
    },

    activeCustomer(state): IUserData | undefined {
      return state.userData?.customers?.find(
        customer => customer.customerNumber === this.activeCustomerOption?.customerNumber
      )
    },

    orderSystems(state): string[] {
      return this.activeCustomer === undefined
        ? state.userData?.all.orderSystems
        : this.activeCustomer.orderSystems
    },

    effectiveOrderSystems(state): string[] {
      return this.activeCustomer === undefined
        ? state.userData?.all.effectiveOrderSystems
        : this.activeCustomer.effectiveOrderSystems
    },

    sortiments(state): ISortiment[] {
      // in case all customers is selected just send all
      return this.activeCustomer === undefined
        ? state.userData?.all.sortiments
        : this.activeCustomer.sortiments
    },

    permissions(state): string[] {
      return this.activeCustomer === undefined
        ? state.userData.all.permissions.map((permission: IPermission) => permission.name)
        : this.activeCustomer.permissions?.map((permission: IPermission) => permission.name)
    },

    languageCodes(state): string[] {
      return this.activeCustomer === undefined
        ? state.userData.all.languageCodes
        : [this.activeCustomer.languageCode]
    },

    // currently selected customer option
    activeCustomerOption(): CustomerModel | null {
      return (
        this.getCustomerSelectOptions?.find((customer: CustomerModel) => customer.active) ?? null
      )
    },

    suppliers(state): Supplier[] {
      return this.activeCustomer?.suppliers || state.userData.all.suppliers || []
    },

    // returns all available customer numbers in case the active customer is "all customers"
    activeCustomerNumbers(): IUserData[] {
      return this.activeCustomerOption
        ? this.activeCustomerOption.id === 0
          ? this.userData.customers
          : ([
              this.userData.customers.find(
                customer => customer.customerNumber === this.activeCustomerOption?.customerNumber
              ),
            ].filter(value => !!value) as IUserData[])
        : []
    },
  },
})
