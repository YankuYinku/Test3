import { defineStore } from 'pinia'
import { api } from '@/plugins/api'
import getters from '@/stores/getters'
import state from '@/stores/state'

const MAX_VISIBLE_INDIVIDUAL_ITEMS = 8

export const useStore = defineStore('mini-basket', {
  state,
  getters,
  actions: {
    getBasketDetailedDataIfNeeded() {
      if (this.needUpdate) {
        return this.getBasketDetailedData()
      }

      return Promise.resolve()
    },
    getBasketSummaryData() {
      return api.getBasketSummary().then(({ data }) => {
        const { positionCount } = data.summary
        const needUpdate = positionCount <= MAX_VISIBLE_INDIVIDUAL_ITEMS && positionCount !== 0

        this.summaryData = data
        this.needUpdate = needUpdate
        this.groupsView = !needUpdate
      })
    },
    getBasketDetailedData() {
      return api.getBasketDetails().then(({ data }) => {
        this.detailedData = data
      })
    },
    initShoppingSession() {
      return api
        .initShoppingSession()
    },
  },
})
