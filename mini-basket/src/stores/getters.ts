import { IRootState } from '@/stores/interfaces'

export default {
  isOpen(state: IRootState): boolean {
    return state.open || false
  },
}