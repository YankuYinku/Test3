import { ICurrentUserData } from '@apetito/portal-sdk-common'

interface UserAccountState {
  userData: ICurrentUserData
  activeCustomerId: number
}

export default (): UserAccountState => ({
  userData: {
    userEmail: '',
    customers: [],
    all: {
      languageCodes: [],
      contactPortals: [],
      orderSystems: [],
      permissions: [],
      sortiments: [],
      effectiveOrderSystems: [],
      administratedCustomerNumbers: [],
      suppliers: [],
    },
  },
  activeCustomerId: 0,
})
