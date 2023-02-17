import { Role, UserAccountModel } from './user-account.interface'

export interface GetAccountResultModel {
  assignedUsers: (UserAccountModel & { __typename: 'AssignedUserDto' })[]
  rolesOfAssignedUsers: { name: Role; __typename: 'RoleDto' }[]
}