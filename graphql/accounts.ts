import gql from 'graphql-tag'

export const getAccountsQuery = gql`
  query getAccounts($customerNumbers: [Int!]!) {
    rolesOfAssignedUsers {
      name
    }
    assignedUsers(request: { customerNumbers: $customerNumbers }) {
      id
      type
      email
      firstName
      lastName
      shortName
      customerNumbers {
        customerNumber
        role
      }
      iconUrl
      status
      isSap
    }
  }
`

export const inviteUser = gql`
  mutation inviteUser($invitedUser: InviteUserRequestInput!) {
    inviteUser(inviteUserRequest: $invitedUser)
  }
`

export const removeUser = gql`
  mutation removeUser($userId: UUID!, $customerNumbers: [Int!]!) {
    removeUser(request: { userId: $userId, customerNumbers: $customerNumbers })
  }
`

export const editUser = gql`
  mutation editUser(
    $userId: UUID!
    $customerNumberRoleAssignments: [CustomerNumberWithRoleRequestInput!]
  ) {
    editUser(
      request: { userId: $userId, customerNumberRoleAssignments: $customerNumberRoleAssignments }
    )
  }
`

export const changeRole = gql`
  mutation changeRole($userId: UUID!, $customerNumber: Int!, $role: String!) {
    changeRole(request: { userId: $userId, customerNumber: $customerNumber, role: $role })
  }
`

export const reinviteUser = gql`
  mutation reinvite($userId: UUID!) {
    resendInvitation(request: { userId: $userId })
  }
`
