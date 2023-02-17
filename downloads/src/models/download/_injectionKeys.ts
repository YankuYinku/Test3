import { InjectionKey, Ref } from 'vue'
import { useDownloadModel } from '@/composables/store'

export type DownloadModel = unknown

export type DefinedDownloadModelInjectionKeyType = Ref<
  ReturnType<typeof useDownloadModel> & { promise: Promise<unknown> }
>

export type DownloadModelInjectionKeyType = Ref<undefined> | DefinedDownloadModelInjectionKeyType

export const DownloadModelInjectionKey: InjectionKey<DownloadModelInjectionKeyType> =
  Symbol('DownloadModel')
