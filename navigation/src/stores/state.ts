import { useLocalStorage } from '@vueuse/core'
import { IRootState } from '@/stores/index'

export default () => {
  /* Important notice: If we want to use LocalStorage for persisting the state,
   * the only way to make it work with Typescript is to cast the return value
   * of useLocalStorage as unknown first and then as the interface of our state.
   * */
  return useLocalStorage('navigation-state', {
    menuOpen: true,
  }) as unknown as IRootState
}
