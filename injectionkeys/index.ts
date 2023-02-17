import { InjectionKey } from 'vue'
import { Client } from '@prismicio/client'

export const PrismicClientKey: InjectionKey<Client> = Symbol('PrismicClientKey')
