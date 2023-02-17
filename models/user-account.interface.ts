export type Role = 'Administrator' | 'Cook' | 'Orderer'
export type AccountType = 'Member' | 'Guest'
export type AccountStatus = 'Active' | 'Invited'

export type CustomerNumberRole = {
  customerNumber: number
  role: Role
}

export interface UserAccountModel {
  id: string
  type: AccountType
  email: string
  firstName: string
  lastName: string
  shortName: string
  iconUrl?: string
  customerNumbers: CustomerNumberRole[]
  status: AccountStatus
  isSap: boolean
}
