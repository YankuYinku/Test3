// import { useLocalStorage } from '@vueuse/core'

export type IAppState = Record<string, unknown> // Define your app state interface/type here

export default (): IAppState => {
  /* Important notice: If we want to use LocalStorage for persisting the state,
   * the only way to make it work with Typescript is to cast the return value
   * of useLocalStorage as unknown first and then as the interface of our state.
   * */

  // return useLocalStorage('application-guard-state', {}) as unknown as IAppState
  return {}
}
