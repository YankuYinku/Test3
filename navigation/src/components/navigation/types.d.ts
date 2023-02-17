import { Component } from 'vue'

export interface INavigationItem {
  applicationName: string
  name?: string
  href?: string
  entryPointName?: string
  onClick?: () => void
  promise?: Promise<string>
  imageIcon?: boolean
  icon?: string | string[]
  customIcon?: Component
  hideText?: boolean
  active?: boolean
  external?: boolean
}
