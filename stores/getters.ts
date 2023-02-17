import { Role } from '@/models/user-account.interface'
import { AccountsState } from '@/stores/accounts-state'

export default {
  roleOfCustomerNumberFromAccount(state: AccountsState) {
    return (customerNumber: number, accountId: string): Role | undefined => {
      const account = state.accounts.find(account => account.id === accountId)
      return account?.customerNumbers.find(
        customerNumberRole => customerNumberRole.customerNumber === customerNumber
      )?.role
    }
  },
}
