import { defineStore } from 'pinia'
import state from './state'
import getters from './getters'

export interface IRootState {
  menuOpen: boolean
}

export const useStore = defineStore('navigation', {
  state,
  getters,
  actions: {},
})

export default useStore
