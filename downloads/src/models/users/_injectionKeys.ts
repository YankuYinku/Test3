import { InjectionKey, Ref } from 'vue'

export const UserLanguageInjectionKey: InjectionKey<Ref<string>> = Symbol('UserLanguageCode')
