declare module 'vue-feature-toggle' {
  import { DefineComponent } from 'vue'
  type FeatureHandler = { visibility: (name: string, value: boolean) => void }

  export const FeatureToggleComponent: DefineComponent<
    {
      name: string
      variant: string
      data: {
        type: string | Record<string, unknown>
      }
      tag?: string
    },
    Record<string, unknown>,
    unknown
  > &
    FeatureHandler
}
