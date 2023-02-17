import { RoleDefinition } from '@/models/role'
import { UserAccountModel } from '@/models/user-account.interface'
import { IUserData } from '@apetito/portal-sdk-common'

export type AccountsState = {
  accounts: UserAccountModel[]
  roles: RoleDefinition[]
  loading: boolean
  loadError: boolean
  selectedUserData: IUserData[]
}

export default (): AccountsState => {
  return {
    accounts: [],
    roles: [],
    loading: false,
    loadError: false,
    selectedUserData: [],
  }
}
