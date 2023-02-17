import { defineStore } from 'pinia'
import state from '@/stores/accounts-state'
import getters from '@/stores/getters'
import { ApolloClient, ApolloQueryResult, NormalizedCacheObject } from '@apollo/client/core'
import { changeRole, getAccountsQuery, inviteUser, removeUser } from '@/graphql/accounts'
import { GetAccountResultModel } from '@/models/get-account-result.interface'
import { RoleDefinition } from '@/models/role'
import { CustomerNumberRole, Role } from '@/models/user-account.interface'

export const useStore = defineStore('accounts-store', {
  state,
  actions: {
    async getAccounts(
      customerNumbers: number[],
      client: ApolloClient<NormalizedCacheObject>,
      translate: (key: string) => string
    ) {
      if (client) {
        this.loading = true
        this.loadError = false
        return client
          .query({
            query: getAccountsQuery,
            variables: { customerNumbers },
          })
          .then((result: ApolloQueryResult<GetAccountResultModel>) => {
            this.loading = false

            // Removes __typing property
            this.accounts = result.data?.assignedUsers.map(user => ({
              ...user,
              customerNumbers: user.customerNumbers.map(custNum => ({
                customerNumber: custNum.customerNumber,
                role: custNum.role,
              })),
            }))

            this.roles = result.data?.rolesOfAssignedUsers?.map(role => {
              switch (role.name) {
                case 'Administrator':
                  return {
                    role: role.name,
                    icon: 'user-shield',
                    description: translate('tabs.accounts.roleDescription.admin'),
                  } as RoleDefinition
                case 'Cook':
                  return {
                    role: role.name,
                    icon: 'hat-chef',
                    description: translate('tabs.accounts.roleDescription.cook'),
                  } as RoleDefinition
                case 'Orderer':
                  return {
                    role: role.name,
                    icon: 'shopping-basket',
                    description: translate('tabs.accounts.roleDescription.orderer'),
                  } as RoleDefinition
                default:
                  return {
                    role: role.name,
                    icon: 'question-circle',
                    description: '',
                  }
              }
            })
          })
          .catch(error => {
            this.loading = false
            this.loadError = true
            return error
          })
      }
    },
    async deleteAccount(
      userId: string,
      customerNumbers: number[],
      client: ApolloClient<NormalizedCacheObject>
    ) {
      return client.mutate({ mutation: removeUser, variables: { userId, customerNumbers } })
    },

    async changeRole(
      userId: string,
      customerNumber: number,
      role: Role,
      client: ApolloClient<NormalizedCacheObject>
    ) {
      return client
        .mutate({ mutation: changeRole, variables: { userId, customerNumber, role } })
        .then(() => {
          this.setRole(userId, role)
          return { userId, role }
        })
    },

    async inviteAccount(
      formData: {
        email: string
        firstName: string
        lastName: string
        customerNumberRoleAssignments: CustomerNumberRole[]
      },
      client: ApolloClient<NormalizedCacheObject>
    ) {
      const languageCode = this.getLanguageCodeForCustomerNumbers(
        formData.customerNumberRoleAssignments
      )

      return client.mutate({
        mutation: inviteUser,
        variables: {
          invitedUser: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            customerNumberRoleAssignments: formData.customerNumberRoleAssignments,
            languageCode,
          },
        },
      })
    },

    setRole(userId: string, role: Role) {
      this.accounts = this.accounts.map(account =>
        account.id === userId
          ? {
              ...account,
              customerNumbers: account.customerNumbers.map(customerNumber => ({
                ...customerNumber,
                role: role,
              })),
            }
          : account
      )
    },

    /* gets the language code from a single customer number, and a prioritized language code
     if multiple customer numbers are provided. de before at before nl before others.*/
    getLanguageCodeForCustomerNumbers(customerNumbers: CustomerNumberRole[]): string {
      let languageCode = 'de-DE'

      const allLanguageCodes = customerNumbers
        .map(cusNum => {
          const customerNumber = this.selectedUserData.find(
            cusNumObj => cusNumObj.customerNumber === cusNum.customerNumber
          )

          return customerNumber ? customerNumber.languageCode : null
        })
        .filter(value => value !== null)

      if (allLanguageCodes && allLanguageCodes.length === 1) {
        // send language code of the single selected customer number OR just de_DE as default
        return allLanguageCodes[0] ?? languageCode
      }

      // if multiple customer numbers are possible, send a prioritized language code
      if (allLanguageCodes.includes('de-DE')) {
        languageCode = 'de-DE'
      } else if (allLanguageCodes.includes('de-AT')) {
        languageCode = 'de-AT'
      } else if (allLanguageCodes.includes('nl-NL')) {
        languageCode = 'nl-NL'
      }

      return languageCode
    },
  },
  getters,
})
