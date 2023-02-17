import { IRootState } from '@/stores/index'

export default {
  isMenuOpen(state: IRootState): boolean {
    return state.menuOpen || false
  },
}
